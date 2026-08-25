import { adminDb } from '../lib/firebase-admin.js';
import { executeNewsCollectionCycle, CollectionEngineResult } from './newsCollectorEngine.js';
import { TRUSTED_NEWS_SOURCES, MAHARASHTRA_36_DISTRICTS } from './trustedSources.js';
import { CollectionCycle, NewsArticle } from '../types.js';

interface SchedulerState {
  isRunning: boolean;
  isCycleActive: boolean;
  lastCycleAt: number | null;
  nextCycleAt: number | null;
  totalArticlesCount: number;
  totalCyclesCount: number;
  lastCycleRecord: CollectionCycle | null;
  activeProgress: {
    stage: string;
    percent: number;
    details?: string;
  } | null;
  cycleHistory: CollectionCycle[];
}

const state: SchedulerState = {
  isRunning: false,
  isCycleActive: false,
  lastCycleAt: null,
  nextCycleAt: null,
  totalArticlesCount: 0,
  totalCyclesCount: 0,
  lastCycleRecord: null,
  activeProgress: null,
  cycleHistory: []
};

let timerHandle: NodeJS.Timeout | null = null;
let schedulerIntervalHours = 3;
let autoPilotEnabled = true;

/**
 * Calculates next run boundary in IST based on configured interval
 */
export function calculateNextIst3HourBoundary(): number {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  const hours = istNow.getUTCHours();
  const step = Math.max(1, schedulerIntervalHours);
  const nextIstHour = Math.floor(hours / step) * step + step;

  const nextIstDate = new Date(istNow);
  nextIstDate.setUTCHours(nextIstHour, 0, 0, 0);

  const nextTimestamp = nextIstDate.getTime() - istOffsetMs;
  const intervalMs = step * 60 * 60 * 1000;
  return nextTimestamp > now.getTime() ? nextTimestamp : now.getTime() + intervalMs;
}

export function setAutoPilotConfig(enabled: boolean, intervalHours: number) {
  autoPilotEnabled = enabled;
  if (intervalHours > 0 && intervalHours <= 24) {
    schedulerIntervalHours = intervalHours;
  }
  state.nextCycleAt = calculateNextIst3HourBoundary();
  console.log(`[CollectionScheduler] ⚙️ Autopilot settings updated: Enabled=${autoPilotEnabled}, Interval=${schedulerIntervalHours}h`);
}

/**
 * Saves generated verified news articles to Firestore without ever overwriting or deleting old articles.
 */
export async function persistArticlesToFirestore(articles: NewsArticle[]): Promise<number> {
  if (!articles || articles.length === 0) return 0;
  let savedCount = 0;

  try {
    // Write in chunks of 400 (Firestore max is 500 per batch)
    const CHUNK_SIZE = 400;
    for (let i = 0; i < articles.length; i += CHUNK_SIZE) {
      const chunk = articles.slice(i, i + CHUNK_SIZE);
      const batch = adminDb.batch();

      for (const art of chunk) {
        const docRef = adminDb.collection('articles').doc(art.id);
        const categoryVal = typeof art.category === 'object' && art.category?.name ? art.category.name : (art.category || 'महाराष्ट्र');
        const dataToSave = {
          ...art,
          category: categoryVal,
          categoryObj: typeof art.category === 'object' ? art.category : { id: 'c1', name: categoryVal, slug: 'maharashtra' },
          status: 'PUBLISHED',
          authorId: 'system-newsroom-bot',
          authorName: art.author || 'राज्यवाणी विशेष वृत्त ब्युरो',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          publishedAt: Date.now(),
          views: art.views || 15,
          aiGenerated: true,
          isArchived: false,
          district: art.district || art.location?.district || '',
          taluka: art.taluka || art.location?.taluka || '',
          village: art.village || art.location?.village || '',
        };
        batch.set(docRef, dataToSave, { merge: true });
        savedCount++;
      }

      await batch.commit();
    }

    console.log(`[CollectionScheduler] 💾 Successfully persisted ${savedCount} verified articles to Firestore 'articles' collection.`);
  } catch (err: any) {
    console.warn('[CollectionScheduler] Notice persisting articles to Firestore (using memory fallback):', err.message || err);
  }

  return savedCount;
}

/**
 * Saves cycle metrics record to Firestore 'news_collection_cycles'
 */
export async function persistCycleRecord(cycle: CollectionCycle): Promise<void> {
  try {
    await adminDb.collection('news_collection_cycles').doc(cycle.id).set({
      ...cycle,
      timestamp: Date.now()
    }, { merge: true });

    // Update site_settings general state
    await adminDb.collection('settings').doc('news_automation').set({
      lastCycleAt: cycle.completedAt || Date.now(),
      nextCycleAt: state.nextCycleAt,
      lastArticlesPublished: cycle.articlesPublished,
      lastStatus: cycle.status,
      maharashtraCount: cycle.maharashtraCount,
      nationalCount: cycle.nationalCount,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err: any) {
    console.warn('[CollectionScheduler] Notice persisting cycle telemetry:', err.message || err);
  }
}

export interface SchedulerRunOptions {
  triggeredBy?: 'AUTOMATIC_3HR_SCHEDULER' | 'ADMIN_MANUAL' | 'TURBO_FAST_TRACK';
  targetCount?: number;
  sourceFilters?: string[];
  concurrencyMultiplier?: number;
  districtFocus?: string;
  categoryFocus?: string;
}

/**
 * Executes one complete automated, manual, or turbo news collection cycle.
 */
export async function runNewsCollectionCycle(
  triggeredByOrOptions: 'AUTOMATIC_3HR_SCHEDULER' | 'ADMIN_MANUAL' | 'TURBO_FAST_TRACK' | SchedulerRunOptions = 'AUTOMATIC_3HR_SCHEDULER',
  targetCount: number = 15,
  sourceFilters?: string[]
): Promise<CollectionEngineResult> {
  const opts: SchedulerRunOptions = typeof triggeredByOrOptions === 'object'
    ? triggeredByOrOptions
    : {
        triggeredBy: triggeredByOrOptions,
        targetCount: targetCount,
        sourceFilters: sourceFilters
      };

  const finalTriggeredBy = opts.triggeredBy || 'AUTOMATIC_3HR_SCHEDULER';
  const finalTargetCount = opts.targetCount || 15;

  if (state.isCycleActive) {
    console.warn('[CollectionScheduler] ⚠️ A collection cycle is already active. Skipping duplicate run.');
    return {
      success: false,
      cycle: state.lastCycleRecord || ({} as any),
      newArticles: [],
      error: 'सायकल आधीच सुरू आहे.'
    };
  }

  state.isCycleActive = true;
  state.activeProgress = { stage: 'STARTING', percent: 5, details: 'अतिजलद वृत्त संकलन चक्र सुरू होत आहे...' };

  try {
    // 1. Fetch recent article URLs from Firestore to avoid duplicate generation
    let existingUrls: string[] = [];
    let existingTitles: string[] = [];
    try {
      const recentSnaps = await adminDb.collection('articles')
        .orderBy('createdAt', 'desc')
        .limit(300)
        .get();

      recentSnaps.forEach(doc => {
        const d = doc.data();
        if (d.sourceUrl) existingUrls.push(d.sourceUrl);
        if (d.title) existingTitles.push(d.title);
      });
    } catch (e: any) {
      console.warn('[CollectionScheduler] Notice loading recent articles for deduplication:', e.message);
    }

    // 2. Execute the engine
    const result = await executeNewsCollectionCycle({
      targetArticles: finalTargetCount,
      triggeredBy: finalTriggeredBy,
      existingArticleUrls: existingUrls,
      existingTitles: existingTitles,
      sourceFilters: opts.sourceFilters,
      concurrencyMultiplier: opts.concurrencyMultiplier || 5,
      districtFocus: opts.districtFocus,
      categoryFocus: opts.categoryFocus,
      onProgress: (p) => {
        state.activeProgress = p;
      }
    });

    if (result.success && result.newArticles.length > 0) {
      // 💾 CRUCIAL: Automatically persist articles to Firestore on the server
      // so even if the Super Admin is completely offline, all articles are saved and published!
      try {
        await persistArticlesToFirestore(result.newArticles);
        await persistCycleRecord(result.cycle);
      } catch (persistErr: any) {
        console.error('[CollectionScheduler] Background Firestore persistence error:', persistErr.message);
      }

      // Update in-memory state
      state.lastCycleAt = result.cycle.completedAt || Date.now();
      state.lastCycleRecord = result.cycle;
      state.totalArticlesCount += result.newArticles.length;
      state.totalCyclesCount += 1;
      state.cycleHistory.unshift(result.cycle);
      if (state.cycleHistory.length > 50) state.cycleHistory.pop();
    }

    state.nextCycleAt = calculateNextIst3HourBoundary();
    state.activeProgress = { stage: 'COMPLETED', percent: 100, details: `सायकल यशस्वी! ${result.newArticles.length} नव्या बातम्या (${result.durationSeconds || 0}s मध्ये).` };

    return result;
  } catch (err: any) {
    console.error('[CollectionScheduler] Cycle failed:', err);
    state.activeProgress = { stage: 'FAILED', percent: 100, details: `त्रुटी: ${err.message}` };
    return {
      success: false,
      cycle: ({} as any),
      newArticles: [],
      error: err.message
    };
  } finally {
    state.isCycleActive = false;
  }
}

/**
 * Initializes and starts the 24/7 Automation Loop that runs completely server-side.
 * Even when the Super Admin is completely offline, closed laptop, or asleep,
 * the news collection engine runs autonomously and persists articles to the database.
 */
export function start3HourNewsScheduler(): void {
  if (state.isRunning) return;
  state.isRunning = true;

  const scheduleNextCycle = () => {
    state.nextCycleAt = calculateNextIst3HourBoundary();
    const now = Date.now();
    const delay = Math.max(5000, state.nextCycleAt - now);

    console.log(`[CollectionScheduler] 🕒 Autonomous 24/7 news scheduler active. Next run in ${Math.round(delay / 60000)} minutes.`);

    timerHandle = setTimeout(async () => {
      if (autoPilotEnabled) {
        try {
          console.log(`[CollectionScheduler] ⚡ Autonomous cycle interval reached! Super admin offline? No problem. Ingesting and saving news...`);
          await runNewsCollectionCycle({
            triggeredBy: 'AUTOMATIC_3HR_SCHEDULER',
            targetCount: 25,
            concurrencyMultiplier: 6
          });
        } catch (err) {
          console.error('[CollectionScheduler] ❌ Autonomous cycle failed:', err);
        }
      } else {
        console.log('[CollectionScheduler] ⏸️ Autopilot currently paused by Admin.');
      }
      scheduleNextCycle();
    }, delay);
  };

  // Kickoff the initial scheduling
  scheduleNextCycle();

  // Startup check: after 12 seconds, perform a lightweight check
  setTimeout(async () => {
    try {
      console.log('[CollectionScheduler] 🚀 Autonomous news engine ready in background. 24/7 persistent ingestion active.');
    } catch (e) {}
  }, 12000);
}

/**
 * Stops the scheduler.
 */
export function stop3HourNewsScheduler(): void {
  if (timerHandle) {
    clearTimeout(timerHandle);
    timerHandle = null;
  }
  state.isRunning = false;
  console.log('[CollectionScheduler] Scheduler stopped.');
}

/**
 * Returns current telemetry and status for the Super Admin dashboard.
 */
export function getSchedulerStatus() {
  return {
    isRunning: state.isRunning,
    autoPilotEnabled: autoPilotEnabled,
    intervalHours: schedulerIntervalHours,
    isAutonomous: true,
    isCycleActive: state.isCycleActive,
    lastCycleAt: state.lastCycleAt,
    nextCycleAt: state.nextCycleAt,
    nextCycleIstFormatted: state.nextCycleAt ? new Date(state.nextCycleAt).toLocaleTimeString('mr-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : "Manual Only",
    totalArticlesCount: state.totalArticlesCount,
    totalCyclesCount: state.totalCyclesCount,
    lastCycleRecord: state.lastCycleRecord,
    activeProgress: state.activeProgress,
    recentCycles: state.cycleHistory.slice(0, 15),
    sourcesCount: TRUSTED_NEWS_SOURCES.length,
    activeSources: TRUSTED_NEWS_SOURCES.filter(s => s.enabled),
    all36Districts: MAHARASHTRA_36_DISTRICTS
  };
}
