import { adminDb } from '../lib/firebase-admin.js';
import { executeNewsCollectionCycle, CollectionEngineResult } from './newsCollectorEngine.js';
import { TRUSTED_NEWS_SOURCES, MAHARASHTRA_36_DISTRICTS } from './trustedSources.js';
import { CollectionCycle, NewsArticle, JobOpportunity } from '../types.js';
import { computeVerifiedJobStatus } from './jobVerificationService.js';
import { VERIFIED_JOBS_DATA } from '../data/jobsData.js';

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
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

/**
 * Calculates next 3-hour boundary in IST (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
 */
export function calculateNextIst3HourBoundary(): number {
  const now = new Date();
  // IST is UTC + 5:30 (330 minutes)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  const hours = istNow.getUTCHours();
  const nextIstHour = Math.floor(hours / 3) * 3 + 3;

  const nextIstDate = new Date(istNow);
  nextIstDate.setUTCHours(nextIstHour, 0, 0, 0);

  const nextTimestamp = nextIstDate.getTime() - istOffsetMs;
  return nextTimestamp > now.getTime() ? nextTimestamp : now.getTime() + THREE_HOURS_MS;
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
        const dataToSave = {
          ...art,
          status: 'PUBLISHED',
          authorId: 'system-newsroom-bot',
          authorName: art.author || 'राज्यवाणी विशेष वृत्त ब्युरो',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          publishedAt: Date.now(),
          views: art.views || 15,
          aiGenerated: true,
          isArchived: false
        };
        batch.set(docRef, dataToSave, { merge: true });
        savedCount++;
      }

      await batch.commit();
    }

    console.log(`[CollectionScheduler] 💾 Successfully persisted ${savedCount} verified articles to Firestore 'articles' collection.`);
  } catch (err: any) {
    console.error('[CollectionScheduler] Error persisting articles to Firestore:', err.message);
  }

  return savedCount;
}

/**
 * Automatically audits all active and upcoming job listings in the database every 3 hours.
 * Compares current date with application last date, detects expired recruitments, and auto-marks them as CLOSED.
 */
export async function auditJobRecruitmentsInDatabase(): Promise<{
  totalAudited: number;
  activeCount: number;
  extendedCount: number;
  closedCount: number;
}> {
  console.log('[CollectionScheduler] 🔍 Starting 3-Hour Job Recruitment Verification Audit...');
  let totalAudited = 0;
  let activeCount = 0;
  let extendedCount = 0;
  let closedCount = 0;

  try {
    const jobsSnapshot = await adminDb.collection('jobs').get();
    const batch = adminDb.batch();
    const now = Date.now();

    if (!jobsSnapshot.empty) {
      jobsSnapshot.forEach(doc => {
        const job = doc.data() as JobOpportunity;
        const verification = computeVerifiedJobStatus(job);
        totalAudited++;

        if (verification.status === 'ACTIVE') activeCount++;
        if (verification.status === 'EXTENDED') extendedCount++;
        if (verification.status === 'CLOSED') closedCount++;

        if (job.status !== verification.status || !job.lastVerifiedAt) {
          batch.update(doc.ref, {
            status: verification.status,
            statusLabelMarathi: verification.statusLabelMarathi,
            statusReason: verification.notes,
            lastVerifiedAt: now,
            applicationPortalActive: verification.isAcceptingApplications,
            isArchivedHistorical: verification.status === 'CLOSED' || verification.status === 'CANCELLED',
            updatedAt: now
          });
        }
      });

      await batch.commit();
      console.log(`[CollectionScheduler] 💼 Job Audit Completed: ${totalAudited} checked (${activeCount} Active, ${extendedCount} Extended, ${closedCount} Closed).`);
    } else {
      // If Firestore jobs collection is empty, populate with verified jobs dataset
      console.log('[CollectionScheduler] 💼 Seeding and verifying initial jobs data in Firestore...');
      for (const job of VERIFIED_JOBS_DATA) {
        const verification = computeVerifiedJobStatus(job);
        const docRef = adminDb.collection('jobs').doc(job.id);
        batch.set(docRef, {
          ...job,
          status: verification.status,
          statusLabelMarathi: verification.statusLabelMarathi,
          statusReason: verification.notes,
          lastVerifiedAt: now,
          applicationPortalActive: verification.isAcceptingApplications,
          isArchivedHistorical: verification.status === 'CLOSED' || verification.status === 'CANCELLED'
        }, { merge: true });
        totalAudited++;
      }
      await batch.commit();
    }
  } catch (err: any) {
    console.warn('[CollectionScheduler] Notice auditing jobs in Firestore:', err.message);
  }

  return { totalAudited, activeCount, extendedCount, closedCount };
}

/**
 * Saves cycle metrics record to Firestore 'news_collection_cycles'
 */
export async function persistCycleRecord(cycle: CollectionCycle): Promise<void> {
  try {
    await adminDb.collection('news_collection_cycles').doc(cycle.id).set({
      ...cycle,
      timestamp: Date.now()
    });

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
    console.warn('[CollectionScheduler] Notice persisting cycle telemetry:', err.message);
  }
}

/**
 * Executes one complete automated or manual news collection cycle.
 */
export async function runNewsCollectionCycle(triggeredBy: 'AUTOMATIC_3HR_SCHEDULER' | 'ADMIN_MANUAL' = 'AUTOMATIC_3HR_SCHEDULER'): Promise<CollectionEngineResult> {
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
  state.activeProgress = { stage: 'STARTING', percent: 5, details: '३-तास वृत्त संकलन चक्र सुरू होत आहे...' };

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
      targetArticles: 100,
      triggeredBy: triggeredBy,
      existingArticleUrls: existingUrls,
      existingTitles: existingTitles,
      onProgress: (p) => {
        state.activeProgress = p;
      }
    });

    if (result.success && result.newArticles.length > 0) {
      // 3. Save to database permanently
      await persistArticlesToFirestore(result.newArticles);
      await persistCycleRecord(result.cycle);

      // 4. Run 3-Hour Job Recruitment Verification Audit
      try {
        await auditJobRecruitmentsInDatabase();
      } catch (jobErr: any) {
        console.warn('[CollectionScheduler] Job audit notice:', jobErr.message);
      }

      // 5. Update in-memory state
      state.lastCycleAt = result.cycle.completedAt || Date.now();
      state.lastCycleRecord = result.cycle;
      state.totalArticlesCount += result.newArticles.length;
      state.totalCyclesCount += 1;
      state.cycleHistory.unshift(result.cycle);
      if (state.cycleHistory.length > 50) state.cycleHistory.pop();
    }

    state.nextCycleAt = calculateNextIst3HourBoundary();
    state.activeProgress = { stage: 'COMPLETED', percent: 100, details: `सायकल यशस्वी! ${result.newArticles.length} नव्या बातम्या प्रसिद्ध.` };

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
 * Initializes and starts the 24/7 3-Hour Automation Loop.
 */
export function start3HourNewsScheduler(): void {
  if (state.isRunning) return;
  state.isRunning = true;
  state.nextCycleAt = calculateNextIst3HourBoundary();

  console.log(`[CollectionScheduler] 🕒 Initializing 24/7 3-Hour News Scheduler for Rajyavani.`);
  console.log(`[CollectionScheduler] Next 3-hour scheduled run at: ${new Date(state.nextCycleAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);

  // Check every minute if it's time for the 3-hour cycle
  timerHandle = setInterval(async () => {
    const now = Date.now();
    if (state.nextCycleAt && now >= state.nextCycleAt && !state.isCycleActive) {
      console.log(`[CollectionScheduler] ⏰ 3-Hour timer triggered! Starting automated collection cycle...`);
      await runNewsCollectionCycle('AUTOMATIC_3HR_SCHEDULER');
    }
  }, 60 * 1000);

  // Run an initial check on startup after 15 seconds if database has few articles
  setTimeout(async () => {
    try {
      if (adminDb) {
        const snap = await adminDb.collection('articles').limit(5).get().catch(() => null);
        if (snap && snap.empty) {
          console.log(`[CollectionScheduler] Initial bootstrap news check complete.`);
        }
      }
    } catch {
      // Quiet background check
    }
  }, 15000);
}

/**
 * Stops the scheduler.
 */
export function stop3HourNewsScheduler(): void {
  if (timerHandle) {
    clearInterval(timerHandle);
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
    isCycleActive: state.isCycleActive,
    lastCycleAt: state.lastCycleAt,
    nextCycleAt: state.nextCycleAt || calculateNextIst3HourBoundary(),
    nextCycleIstFormatted: new Date(state.nextCycleAt || calculateNextIst3HourBoundary()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
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
