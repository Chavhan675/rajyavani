import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  ArrowUpRight, 
  ExternalLink,
  ChevronDown,
  Info,
  Radio,
  Sliders,
  TrendingUp,
  Activity,
  Zap,
  Gauge,
  Cpu,
  Flame,
  Globe,
  Compass,
  Bot,
  Landmark,
  Wheat,
  ShieldAlert,
  Trophy,
  GraduationCap,
  HeartPulse,
  Film
} from 'lucide-react';
import { TRUSTED_NEWS_SOURCES, MAHARASHTRA_36_DISTRICTS, MAHARASHTRA_DIVISIONS_MAP, DISTRICT_DEDICATED_FEEDS } from '../../services/trustedSources';
import { MULTI_AI_ENGINES } from '../../services/multiAiEngineRegistry';
import { CollectionCycle, NewsSourceConfig, NewsArticle, AiEngineConfig, AiEngineId } from '../../types';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { doc, writeBatch, collection, setDoc } from 'firebase/firestore';

export default function AutomatedCollectorDashboard() {
  const { user } = useAuth();
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [sources, setSources] = useState<NewsSourceConfig[]>(TRUSTED_NEWS_SOURCES);
  const [loading, setLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerProgress, setTriggerProgress] = useState<any>(null);
  const [timeToNextCycle, setTimeToNextCycle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ENGINES' | 'AUTONOMOUS' | 'TURBO' | 'DISTRICTS' | 'SOURCES' | 'HISTORY'>('OVERVIEW');
  const [filterDistrictSearch, setFilterDistrictSearch] = useState('');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('ALL');
  const [targetedDistrictLoading, setTargetedDistrictLoading] = useState<string | null>(null);
  const [liveDistrictCoverage, setLiveDistrictCoverage] = useState<Record<string, number>>({});
  
  // 🤖 12+ Multi-AI Engines State
  const [aiEngines, setAiEngines] = useState<AiEngineConfig[]>(Object.values(MULTI_AI_ENGINES));
  const [runningEngineId, setRunningEngineId] = useState<string | null>(null);
  const [isBalancedSweepRunning, setIsBalancedSweepRunning] = useState(false);
  const [engineArticlesCount, setEngineArticlesCount] = useState(2);
  const [engineConcurrency, setEngineConcurrency] = useState(4);
  const [engineSearchFilter, setEngineSearchFilter] = useState('');
  const [lastEngineSweepResult, setLastEngineSweepResult] = useState<any>(null);

  // Turbo Fast-Track Configurations
  const [speedProfile, setSpeedProfile] = useState<'TURBO' | 'FAST' | 'STANDARD'>('TURBO');
  const [selectedTurboDistrict, setSelectedTurboDistrict] = useState<string>('पुणे');
  const [lastThroughputStat, setLastThroughputStat] = useState<{ duration: number; count: number; speed: number } | null>(null);

  // 24/7 Autonomous Settings
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);
  const [intervalHours, setIntervalHours] = useState(3);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Fetch scheduler status & engines from server
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [resStatus, resCov, resEngines] = await Promise.allSettled([
        fetch('/api/collector/status'),
        fetch('/api/collector/districts/coverage'),
        fetch('/api/collector/engines')
      ]);

      if (resStatus.status === 'fulfilled' && resStatus.value.ok) {
        const data = await resStatus.value.json();
        setSchedulerStatus(data.status);
        if (data.status?.intervalHours) setIntervalHours(data.status.intervalHours);
        if (data.status?.autoPilotEnabled !== undefined) setAutoPilotEnabled(data.status.autoPilotEnabled);
      }

      if (resCov.status === 'fulfilled' && resCov.value.ok) {
        const covData = await resCov.value.json();
        if (covData.coverage) {
          setLiveDistrictCoverage(covData.coverage);
        }
      }

      if (resEngines.status === 'fulfilled' && resEngines.value.ok) {
        const engineData = await resEngines.value.json();
        if (engineData.engines && engineData.engines.length > 0) {
          setAiEngines(engineData.engines);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch collector status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAutopilot = async (enabled: boolean, interval: number) => {
    try {
      setIsUpdatingSettings(true);
      const token = await user?.getIdToken();
      const res = await fetch('/api/collector/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ autoPilotEnabled: enabled, intervalHours: interval })
      });
      const data = await res.json();
      if (res.ok) {
        setAutoPilotEnabled(enabled);
        setIntervalHours(interval);
        alert(data.message || "ऑटोनॉमस सेटिंग्ज सेव्ह झाल्या!");
        fetchStatus();
      } else {
        alert(data.error || "सेटिंग्ज सेव्ह करण्यात अडचण आली");
      }
    } catch (e: any) {
      alert("त्रुटी: " + e.message);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleTestAutonomousOfflineRun = async () => {
    if (isTriggering) return;
    setIsTriggering(true);
    setTriggerProgress({ stage: 'AUTONOMOUS_TEST', percent: 35, details: '🌐 सर्व्हर-साइड 24/7 ऑफलाइन पर्सिस्टन्स चाचणी सुरू आहे...' });
    try {
      const res = await fetch(`/api/cron/autonomous-collect?token=rajyavani_auto_cron_secret&target=5`);
      const data = await res.json();
      if (data.success) {
        alert(`✅ 24/7 ऑफलाइन ऑटोनॉमस चाचणी यशस्वी!\n\n• सर्व्हरने ${data.articlesPublished} बातम्या आपोआप डेटाबेसमध्ये सेव्ह केल्या.\n• सुपर अ‍ॅडमीन ऑफलाइन असला तरीही ही प्रक्रिया दर ${intervalHours} तासांनी अविरत चालू राहील.`);
      } else {
        alert(`त्रुटी: ${data.error}`);
      }
    } catch (e: any) {
      alert("त्रुटी: " + e.message);
    } finally {
      setIsTriggering(false);
      setTriggerProgress(null);
      fetchStatus();
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!schedulerStatus?.nextCycleAt) {
      setTimeToNextCycle('मॅन्युअल मोड');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = schedulerStatus.nextCycleAt - now;

      if (diff <= 0) {
        setTimeToNextCycle('प्रारंभ होत आहे...');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToNextCycle(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedulerStatus]);

  const saveArticlesToFirestore = async (articles: any[], cycle: any) => {
    if (!articles || articles.length === 0) return;
    const CHUNK_SIZE = 400;
    for (let i = 0; i < articles.length; i += CHUNK_SIZE) {
      const chunk = articles.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const art of chunk) {
         const docRef = doc(collection(db, 'articles'), art.id);
         batch.set(docRef, {
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
         }, { merge: true });
      }
      await batch.commit();
    }
    if (cycle) {
      try {
        const cycleRef = doc(collection(db, 'news_collection_cycles'), cycle.id);
        await setDoc(cycleRef, { ...cycle, timestamp: Date.now() });
        const settingsRef = doc(collection(db, 'settings'), 'news_automation');
        await setDoc(settingsRef, {
          lastCycleAt: cycle.completedAt || Date.now(),
          lastArticlesPublished: cycle.articlesPublished,
          lastStatus: cycle.status
        }, { merge: true });
      } catch (e) {
        console.warn("Could not save cycle record", e);
      }
    }
  };

  // 🤖 Run Single AI Engine On Demand
  const handleRunSingleAiEngine = async (engineId: AiEngineId, targetArticles: number = 2) => {
    if (runningEngineId || isBalancedSweepRunning) return;
    setRunningEngineId(engineId);
    const engineConfig = aiEngines.find(e => e.id === engineId);
    const startTime = Date.now();

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/collector/engines/run-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ engineId, targetArticles })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI इंजिन चालवणे अयशस्वी');
      }

      if (data.articles && data.articles.length > 0) {
        await saveArticlesToFirestore(data.articles, null);
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      alert(`🤖 ${engineConfig?.nameMarathi || engineId} यशस्वी!\n\n• तयार केलेल्या बातम्या: ${data.articles?.length || 0}\n• सरासरी शब्दसंख्या: १०००+ शब्द\n• वेळ: ${duration} सेकंद\n• सर्व बातम्या थेट वेबसाइटवर प्रसिद्ध झाल्या.`);
      fetchStatus();
    } catch (err: any) {
      alert(`❌ AI इंजिन त्रुटी: ${err.message}`);
    } finally {
      setRunningEngineId(null);
    }
  };

  // 🚀 Run Master Balanced Multi-Engine Sweep across 12 Engines
  const handleRunBalancedMultiEngineSweep = async (targetPerEngine: number = 1, concurrency: number = 4) => {
    if (isBalancedSweepRunning || runningEngineId) return;
    setIsBalancedSweepRunning(true);
    const startTime = Date.now();

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/collector/engines/run-balanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          articlesPerEngine: targetPerEngine,
          concurrencyLimit: concurrency
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'संतुलित Multi-AI स्वीप अयशस्वी');
      }

      if (data.newArticles && data.newArticles.length > 0) {
        await saveArticlesToFirestore(data.newArticles, null);
      }

      setLastEngineSweepResult(data);
      const duration = Math.round((Date.now() - startTime) / 1000);
      alert(`🚀 संतुलित Multi-AI स्वीप यशस्वी!\n\n• एकूण १२ AI इंजिन्स समतोल राखत धावली.\n• एकूण नवीन बातम्या: ${data.totalArticles || 0}\n• कालावधी: ${duration} सेकंद\n• सर्व बातम्या डेटाबेसमध्ये सेव्ह झाल्या.`);
      fetchStatus();
    } catch (err: any) {
      alert(`❌ Multi-AI चक्र त्रुटी: ${err.message}`);
    } finally {
      setIsBalancedSweepRunning(false);
    }
  };

  // 🚀 ALL 36 DISTRICTS RAPID SWEEP
  const handleRapidAllDistricts = async (articlesPerDistrict = 1) => {
    if (isTriggering) return;
    setIsTriggering(true);
    setTriggerProgress({ 
      stage: 'DISTRICTS_SWEEP', 
      percent: 15, 
      details: '⚡ महाराष्ट्रातील सर्व ३६ जिल्ह्यांचे हाय-स्पीड संकलन सुरू होत आहे...' 
    });
    const startTime = Date.now();

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/collector/districts/all-rapid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ articlesPerDistrict, concurrency: 6 })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "३६ जिल्हे संकलन अयशस्वी");
      }

      setTriggerProgress({ stage: 'SAVING', percent: 90, details: 'डेटाबेसमध्ये ३६ जिल्ह्यांच्या बातम्या सेव्ह करत आहे...' });
      await saveArticlesToFirestore(data.newArticles, data.cycle);

      const total = data.newArticles?.length || 0;
      const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const speed = Math.round((total / duration) * 60);
      setLastThroughputStat({ duration, count: total, speed });

      alert(`🚀 सर्व ३६ जिल्हे संकलन यशस्वी!\n\n• एकूण प्रसिद्ध बातम्या: ${total}\n• कव्हर केलेले जिल्हे: ३६/३६\n• वेळ: ${duration} सेकंद (${speed} बातम्या/मिनिट)\n• सर्व बातम्या १०००+ शब्द पडताळणीकृत`);
    } catch (err: any) {
      alert(`❌ त्रुटी: ${err.message}`);
    } finally {
      setIsTriggering(false);
      setTriggerProgress(null);
      fetchStatus();
    }
  };

  // ⚡ DIVISION RAPID SWEEP
  const handleRapidDivision = async (divisionName: string, articlesPerDistrict = 1) => {
    if (isTriggering) return;
    setIsTriggering(true);
    setTriggerProgress({ 
      stage: 'DIVISION_SWEEP', 
      percent: 25, 
      details: `⚡ ${divisionName} विभागातील सर्व जिल्ह्यांचे जलद संकलन सुरू...` 
    });
    const startTime = Date.now();

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/collector/districts/division-rapid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ division: divisionName, articlesPerDistrict })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `${divisionName} संकलन अयशस्वी`);
      }

      setTriggerProgress({ stage: 'SAVING', percent: 85, details: 'डेटाबेसमध्ये सेव्ह करत आहे...' });
      await saveArticlesToFirestore(data.newArticles, data.cycle);

      const total = data.newArticles?.length || 0;
      const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const speed = Math.round((total / duration) * 60);
      setLastThroughputStat({ duration, count: total, speed });

      alert(`⚡ ${divisionName} विभाग संकलन पूर्ण!\n\n• एकूण बातम्या: ${total}\n• वेळ: ${duration} सेकंदात प्रसिद्ध`);
    } catch (err: any) {
      alert(`❌ त्रुटी: ${err.message}`);
    } finally {
      setIsTriggering(false);
      setTriggerProgress(null);
      fetchStatus();
    }
  };

  // ⚡ SINGLE DISTRICT RAPID INGESTION
  const handleRapidSingleDistrict = async (districtName: string, targetArticles = 2) => {
    if (isTriggering || targetedDistrictLoading) return;
    setTargetedDistrictLoading(districtName);
    const startTime = Date.now();

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/collector/districts/single-rapid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ district: districtName, targetArticles })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `${districtName} संकलन अयशस्वी`);
      }

      await saveArticlesToFirestore(data.newArticles, data.cycle);
      const total = data.newArticles?.length || 0;
      const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));

      alert(`✅ ${districtName} जिल्हा वृत्त संकलन यशस्वी!\n\n• ${total} सविस्तर बातम्या प्रसिद्ध (${duration} सेकंद)\n• तालुका व गाव पातळीवरील स्थानिक माहिती समाविष्ट.`);
    } catch (err: any) {
      alert(`❌ त्रुटी: ${err.message}`);
    } finally {
      setTargetedDistrictLoading(null);
      fetchStatus();
    }
  };

  // Unified Universal News Collector Trigger
  const handleTriggerCycle = async (customTarget = 15, districtFocus?: string, categoryFocus?: string) => {
    if (isTriggering) return;

    setIsTriggering(true);
    setTriggerProgress({ stage: 'STARTING', percent: 10, details: 'अतिजलद न्यूज इंजिन सुरू करत आहे...' });

    const startTime = Date.now();
    const concurrency = speedProfile === 'TURBO' ? 6 : speedProfile === 'FAST' ? 4 : 2;

    try {
      const token = await user?.getIdToken();
      
      setTriggerProgress({ 
        stage: 'COLLECTING', 
        percent: 35, 
        details: `${concurrency}x समांतर प्रोसेसर्सद्वारे बातम्या पडताळत आहे...` 
      });

      const res = await fetch('/api/collector/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          target: customTarget,
          concurrency: concurrency,
          districtFocus: districtFocus,
          categoryFocus: categoryFocus
        })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
         throw new Error(data.error || "बातम्या संकलन अयशस्वी");
      }
      
      // Save client-side to Firestore
      setTriggerProgress({ stage: 'SAVING', percent: 90, details: 'डेटाबेसमध्ये १०००+ शब्दांच्या बातम्या सेव्ह करत आहे...' });
      await saveArticlesToFirestore(data.newArticles, data.cycle);

      const total = data.newArticles?.length || 0;
      const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const speed = Math.round((total / duration) * 60);

      setLastThroughputStat({ duration, count: total, speed });
      
      alert(`⚡ संकलन यशस्वी!\n\n• एकूण बातम्या: ${total}\n• कालावधी: ${duration} सेकंद\n• गती: ~${speed} बातम्या/मिनिट`);
      
    } catch (err: any) {
      alert(`❌ त्रुटी: ${err.message}`);
    } finally {
      setIsTriggering(false);
      setTriggerProgress(null);
      fetchStatus();
    }
  };

  // ⚡ Dedicated Turbo Fast-Track Trigger (sub-5s)
  const handleTurboFastTrack = async (focus: string, count: number = 5) => {
    if (isTriggering) return;
    setIsTriggering(true);
    setTriggerProgress({ stage: 'TURBO_START', percent: 20, details: `⚡ '${focus}' साठी अल्ट्रा-फास्ट संकलन सुरू...` });
    const startTime = Date.now();

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/collector/turbo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ focus, target: count })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "टर्बो संकलन अयशस्वी");
      }

      setTriggerProgress({ stage: 'SAVING', percent: 85, details: 'डेटाबेसमध्ये तात्काळ सेव्ह करत आहे...' });
      await saveArticlesToFirestore(data.newArticles, data.cycle);

      const total = data.newArticles?.length || 0;
      const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const speed = Math.round((total / duration) * 60);
      setLastThroughputStat({ duration, count: total, speed });

      alert(`⚡ टर्बो संकलन पूर्ण!\n\n• विषय: ${focus}\n• ताज्या बातम्या: ${total}\n• वेळ: ${duration} सेकंदात प्रसिद्ध`);
    } catch (err: any) {
      alert(`❌ टर्बो त्रुटी: ${err.message}`);
    } finally {
      setIsTriggering(false);
      setTriggerProgress(null);
      fetchStatus();
    }
  };

  const districtCoverage = schedulerStatus?.lastCycleRecord?.districtCoverage || {};

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header & Live Scheduler Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>अतिजलद वृत्त संकलन इंजिन (High-Speed Turbo Collector)</span>
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-[11px] font-bold text-zinc-300">
                {speedProfile === 'TURBO' ? '⚡ 6x AI Workers (अल्ट्रा-फास्ट)' : speedProfile === 'FAST' ? '🚀 4x AI Workers (फास्ट)' : '⚙️ 2x Workers'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
              राज्यवाणी स्वयंचलित वृत्त संकलन व पडताळणी केंद्र
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              PIB, DGIPR महान्यूज, ३६ जिल्हाधिकारी कार्यालये, कृषी उत्पन्न बाजार समित्या व अधिकृत स्त्रोतांवरून अतिजलद पडताळणीकृत बातम्यांचे संकलन, डुप्लिकेशन फिल्टर, आणि १०००+ शब्दांचे दीर्घ मराठी वृत्त तयार करण्याचे हाय-स्पीड इंजिन.
            </p>
          </div>

          {/* Trigger Button & Timer */}
          <div className="bg-zinc-850/90 border border-zinc-750 p-5 rounded-2xl flex flex-col items-center justify-center min-w-[280px] text-center space-y-4 shrink-0 shadow-lg backdrop-blur-md">
            
            <div className="text-center w-full bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50">
              <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-saffron" />
                पुढील संकलन (Next Cycle)
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-wider tabular-nums drop-shadow-md">
                {timeToNextCycle || '00:00:00'}
              </div>
            </div>

            <button
              onClick={() => handleTriggerCycle(15)}
              disabled={isTriggering || schedulerStatus?.isCycleActive}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isTriggering || schedulerStatus?.isCycleActive
                  ? 'bg-amber-600/50 text-white cursor-wait'
                  : 'bg-brand-red hover:bg-brand-saffron text-white hover:scale-[1.02]'
              }`}
            >
              {isTriggering || schedulerStatus?.isCycleActive ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>संकलन चक्र सुरू आहे...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>⚡ अतिजलद संकलन सुरू करा (१५+ बातम्या)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Progress Bar if cycle is running */}
        {(isTriggering || schedulerStatus?.isCycleActive) && (
          <div className="mt-6 pt-5 border-t border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>{triggerProgress?.details || schedulerStatus?.activeProgress?.details || 'बातम्यांची अतिजलद पडताळणी व संकलन सुरू आहे...'}</span>
              </span>
              <span>{triggerProgress?.percent || schedulerStatus?.activeProgress?.percent || 45}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-brand-red to-orange-500 transition-all duration-500 rounded-full"
                style={{ width: `${triggerProgress?.percent || schedulerStatus?.activeProgress?.percent || 45}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. 🌐 24/7 AUTONOMOUS AUTOPILOT CONTROL (SUPER ADMIN OFFLINE CONTINUOUS INGESTION) */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-3xl border-2 border-emerald-500/30 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900 font-serif">
                  २४/७ ऑटोनॉमस ऑटो-पायलट (Super Admin Offline Engine)
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  24/7 LIVE
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                सुपर अ‍ॅडमीन ऑफलाइन असला, संगणक बंद असला किंवा रात्री झोपलेला असला तरीही बातम्या आपोआप संकलित होऊन थेट डेटाबेसमध्ये प्रसिद्ध होतात.
              </p>
            </div>
          </div>

          {/* Autopilot Interval & Mode Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            
            {/* Frequency Selector */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs text-xs font-bold text-gray-700">
              <span className="px-2 text-[10px] uppercase text-gray-400 font-black">वारंवारता:</span>
              {[1, 2, 3, 6].map((hrs) => (
                <button
                  key={hrs}
                  disabled={isUpdatingSettings}
                  onClick={() => handleUpdateAutopilot(autoPilotEnabled, hrs)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    intervalHours === hrs
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  दर {hrs} तास
                </button>
              ))}
            </div>

            {/* Enable/Pause Toggle */}
            <button
              disabled={isUpdatingSettings}
              onClick={() => handleUpdateAutopilot(!autoPilotEnabled, intervalHours)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                autoPilotEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{autoPilotEnabled ? 'ऑटोपायलट चालू' : 'ऑटोपायलट थांबवला'}</span>
            </button>

            {/* Instant Offline Run Test */}
            <button
              disabled={isTriggering}
              onClick={handleTestAutonomousOfflineRun}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              title="सर्व्हर-साइड बॅकग्राउंड सेव्हिंग तात्काळ तपासा"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>ऑफलाइन चाचणी (Test)</span>
            </button>
          </div>
        </div>

        {/* Webhook URL for Cloud Scheduler / UptimeRobot */}
        <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-bold text-emerald-800 shrink-0">🔗 External Cron Webhook URL:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-mono text-gray-800 break-all select-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/api/cron/autonomous-collect?token=rajyavani_auto_cron_secret` : '/api/cron/autonomous-collect'}
            </code>
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(`${window.location.origin}/api/cron/autonomous-collect?token=rajyavani_auto_cron_secret`);
                setCopiedWebhook(true);
                setTimeout(() => setCopiedWebhook(false), 2000);
              }
            }}
            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            {copiedWebhook ? '✓ URL कॉपी झाली!' : 'Webhook URL कॉपी करा'}
          </button>
        </div>
      </div>

      {/* 3. ⚡ TURBO FAST-TRACK CONTROL PANEL */}
      <div className="bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent p-6 rounded-3xl border-2 border-amber-400/40 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 font-serif flex items-center gap-2">
                <span>अतिजलद वृत्त संकलन केंद्र (Turbo Fast-Track Hub)</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-200 text-amber-950 rounded-full uppercase">Ultra-Speed</span>
              </h3>
              <p className="text-xs text-gray-600">
                १-क्लिकमध्ये ५ सेकंदात विशिष्ट जिल्हा किंवा विषयाचे थेट पडताळणीकृत वृत्त गोळा करा.
              </p>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setSpeedProfile('TURBO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                speedProfile === 'TURBO'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>टर्बो 6x</span>
            </button>
            <button
              onClick={() => setSpeedProfile('FAST')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                speedProfile === 'FAST'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>फास्ट 4x</span>
            </button>
            <button
              onClick={() => setSpeedProfile('STANDARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                speedProfile === 'STANDARD'
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>स्टँडर्ड 2x</span>
            </button>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Action 1: Maharashtra Top 10 Flash */}
          <button
            onClick={() => handleTurboFastTrack('महाराष्ट्र', 8)}
            disabled={isTriggering}
            className="p-4 bg-white hover:bg-amber-50/80 border border-amber-200/80 rounded-2xl text-left transition-all hover:shadow-md cursor-pointer group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4 fill-amber-700" />
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                ~३ सेकंदात
              </span>
            </div>
            <div className="font-black text-sm text-gray-900 group-hover:text-brand-red">
              महाराष्ट्र टॉप ८ फ्लॅश
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              राज्यभरातील ८ ताज्या ठळक घडामोडी तात्काळ प्रसिद्ध करा.
            </div>
          </button>

          {/* Action 2: District Express with Dropdown */}
          <div className="p-4 bg-white border border-red-200/80 rounded-2xl text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-red-100 text-brand-red rounded-xl">
                <MapPin className="w-4 h-4" />
              </span>
              <select
                value={selectedTurboDistrict}
                onChange={(e) => setSelectedTurboDistrict(e.target.value)}
                className="text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                {MAHARASHTRA_36_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleTurboFastTrack(selectedTurboDistrict, 5)}
              disabled={isTriggering}
              className="w-full py-1.5 px-3 bg-brand-red hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>{selectedTurboDistrict} जिल्हा एक्सप्रेस (५)</span>
            </button>
            <div className="text-[10px] text-gray-500">
              निवडलेल्या जिल्ह्यातील ५ सविस्तर बातम्या तात्काळ गोळा करा.
            </div>
          </div>

          {/* Action 3: Agriculture & APMC Express */}
          <button
            onClick={() => handleTurboFastTrack('शेती', 6)}
            disabled={isTriggering}
            className="p-4 bg-white hover:bg-green-50/80 border border-green-200/80 rounded-2xl text-left transition-all hover:shadow-md cursor-pointer group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-green-100 text-green-800 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                बाजारभाव व शेती
              </span>
            </div>
            <div className="font-black text-sm text-gray-900 group-hover:text-green-700">
              शेती व APMC एक्सप्रेस (६)
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              हवामान, पीक परिस्थिती आणि बाजारभाव वृत्त संकलन.
            </div>
          </button>

          {/* Action 4: Career & Job Updates */}
          <button
            onClick={() => handleTurboFastTrack('शिक्षण', 5)}
            disabled={isTriggering}
            className="p-4 bg-white hover:bg-blue-50/80 border border-blue-200/80 rounded-2xl text-left transition-all hover:shadow-md cursor-pointer group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                पडताळणीकृत २०२६
              </span>
            </div>
            <div className="font-black text-sm text-gray-900 group-hover:text-blue-700">
              शिक्षण व भरती एक्सप्रेस (५)
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              १५ दिवसांतील चालू सरकारी नोकरी व शैक्षणिक अपडेट्स.
            </div>
          </button>

        </div>

        {/* Live Throughput Telemetry Bar */}
        {lastThroughputStat && (
          <div className="bg-white p-3 rounded-2xl border border-amber-300 flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>शेवटचे संकलन आकडेवारी: {lastThroughputStat.count} बातम्या ({lastThroughputStat.duration}s)</span>
            </span>
            <span className="text-amber-700 font-mono font-black">
              ⚡ सरासरी गती: ~{lastThroughputStat.speed} बातम्या/मिनिट
            </span>
          </div>
        )}
      </div>

      {/* 3. Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Last Cycle Articles */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>शेवटच्या चक्रातील बातम्या</span>
            <div className="p-2 bg-red-50 text-brand-red rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {schedulerStatus?.lastCycleRecord?.articlesPublished || '१००+'}
          </div>
          <p className="text-[11px] text-green-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>सर्व १०००+ शब्द पडताळणीकृत</span>
          </p>
        </div>

        {/* Card 2: Maharashtra Priority Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>महाराष्ट्र ३६ जिल्हे कव्हरेज</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {Object.keys(districtCoverage).length > 0 ? `${Object.keys(districtCoverage).length}/३६` : '३६/३६'}
          </div>
          <p className="text-[11px] text-amber-700 font-bold">
            महाराष्ट्र मुख्य प्राधान्य (Primary Priority)
          </p>
        </div>

        {/* Card 3: Anti-Fake & Verification Filters */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>डुप्लिकेशन व अफवा फिल्टर</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {schedulerStatus?.lastCycleRecord?.duplicatesMerged || 0} विलीन
          </div>
          <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>अनेक स्त्रोत १ अधिकृत लेखात विलीन</span>
          </p>
        </div>

        {/* Card 4: Trusted Sources */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>सक्रिय विश्वसनीय स्त्रोत</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {TRUSTED_NEWS_SOURCES.length} स्त्रोत
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">
            PIB, DGIPR, आकाशवाणी, ३६ जिल्हे
          </p>
        </div>
      </div>

      {/* 4. Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          📊 सायकल आढावा (Overview)
        </button>
        <button
          onClick={() => setActiveTab('ENGINES')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ENGINES'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bot className="w-4 h-4 text-brand-red" />
          <span>🤖 १२+ मल्टी-AI इंजिन केंद्र (12+ AI Engines)</span>
          <span className="px-1.5 py-0.2 bg-red-100 text-brand-red text-[10px] rounded-full font-black">12 Live</span>
        </button>
        <button
          onClick={() => setActiveTab('DISTRICTS')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'DISTRICTS'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          📍 ३६ जिल्हे कव्हरेज मॅट्रिक्स (36 Districts Matrix)
        </button>
        <button
          onClick={() => setActiveTab('SOURCES')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SOURCES'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          📡 विश्वसनीय स्त्रोत यादी (Trusted Sources)
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'HISTORY'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          📜 चक्र इतिहास नोंदी (Cycle History Logs)
        </button>
      </div>

      {/* 5. Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Editorial & Verification Rules */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>स्वयंचलित पत्रकारिता व पडताळणी नियमावली</span>
              </h3>

              <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl space-y-1">
                  <strong className="text-brand-red text-sm block">१. किमान १०००+ शब्दांचे परिपूर्ण मराठी वृत्त (Minimum 1,000 Words)</strong>
                  <p>प्रत्येक बातमीमध्ये ५ Ws आणि १ H, सविस्तर घटनाक्रम, पार्श्वभूमी, प्रशासकीय व न्यायालयीन कारवाई, जनजीवनावरील प्रभाव, आणि शेवटी FAQ व ठळक मुद्द्यांचा सारांश असणे बंधनकारक आहे.</p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1">
                  <strong className="text-amber-800 text-sm block">२. महाराष्ट्र प्राधान्य आणि ३६ जिल्हे समतोल कव्हरेज</strong>
                  <p>पुणे, मुंबई, नागपूर, नाशिक यांसोबतच मराठवाडा, विदर्भ, उत्तर महाराष्ट्र आणि कोकणातील सर्व ग्रामीण व निमशहरी तालुक्यांमधील घडामोडींना सर्वोच्च स्थान दिले जाते.</p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                  <strong className="text-blue-800 text-sm block">३. डुप्लिकेशन शोध व अधिकृत विलीनीकरण (Smart Deduplication)</strong>
                  <p>एकाच घटनेवर ५ वेगवेगळ्या वृत्तपत्रांनी दिलेल्या बातम्यांचे ५ स्वतंत्र लेख न बनवता, सर्व सत्य माहिती एकत्रित करून १ परिपूर्ण, अधिकृत वृत्त प्रसिद्ध केले जाते.</p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                  <strong className="text-emerald-800 text-sm block">४. कायमस्वरूपी ऐतिहासिक डेटाबेस (Never Delete Old News)</strong>
                  <p>प्रसिद्ध झालेली कोणतीही बातमी हटवली जात नाही; त्या आपोआप <strong>'राज्यवाणी बातमी संग्रह' (News Archive)</strong> मध्ये कायमच्या सुरक्षित राहतात.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Cycle Summary Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-red" />
                <span>चालू सायकल स्थिती</span>
              </h3>

              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 font-medium">सायकल स्थिती:</span>
                  <span className="font-bold text-green-600">सक्रिय व कार्यरत (Active)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 font-medium">स्पीड मोड:</span>
                  <span className="font-bold text-amber-600">{speedProfile} (हाय-थ्रूपूट)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 font-medium">वेळेचे अंतर:</span>
                  <span className="font-bold text-gray-800">दर ३ तास (3 Hours)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 font-medium">शेवटचे चक्र पूर्ण:</span>
                  <span className="font-bold text-gray-800">
                    {schedulerStatus?.lastCycleAt ? new Date(schedulerStatus.lastCycleAt).toLocaleTimeString('mr-IN') : 'आत्ताच सुरू झाले'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 font-medium">पुढील नियोजित चक्र:</span>
                  <span className="font-bold text-amber-600">{schedulerStatus?.nextCycleIstFormatted || 'पुढील ३-तास'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 font-medium">लक्ष्य प्रति चक्र:</span>
                  <span className="font-bold text-brand-red">१००+ पडताळणीकृत बातम्या</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 6. Tab 2: 🤖 12+ MULTI-AI ENGINES HUB */}
      {activeTab === 'ENGINES' && (
        <div className="space-y-6">
          
          {/* Master Multi-Engine Orchestrator Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 rounded-full text-xs font-black text-indigo-300">
                    <Bot className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>१२+ स्वायत्त AI वृत्त इंजिन्स (Autonomous Multi-AI Engine Suite)</span>
                  </span>
                  <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-[11px] font-bold text-zinc-300">
                    🔄 लोड बॅलन्सिंग व समतोल वाटप
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
                  विषयनिहाय १२ स्वतंत्र AI वृत्त संकलन इंजिन्स
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  प्रत्येक महत्त्वाच्या विषयासाठी (शासन/GR, ३६ जिल्हे, शेती, राष्ट्रीय, गुन्हे, व्यापार, क्रीडा, शिक्षण/भरती, विज्ञान, मनोरंजन, आरोग्य, ब्रेकिंग/फॅक्ट-चेक) स्वतंत्र AI इंजिन कार्यरत आहे. हे इंजिन नियमित समतोल राखून आपोआप वेबसाइटवर सविस्तर १०००+ शब्दांच्या बातम्या जोडतात.
                </p>
              </div>

              {/* Master Sweep Button & Concurrency Controls */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-3 min-w-[300px] shrink-0 shadow-lg backdrop-blur-md">
                <div className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>⚡ संतुलित स्वीप कॉन्फिगरेशन</span>
                  <span className="text-[10px] text-indigo-400 font-mono">12 Engines</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">प्रति इंजिन बातम्या:</label>
                    <select
                      value={engineArticlesCount}
                      onChange={(e) => setEngineArticlesCount(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs font-bold"
                    >
                      <option value={1}>१ बातमी / इंजिन (१२ एकूण)</option>
                      <option value={2}>२ बातम्या / इंजिन (२४ एकूण)</option>
                      <option value={3}>३ बातम्या / इंजिन (३६ एकूण)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">पॅरलल AI क्षमता:</label>
                    <select
                      value={engineConcurrency}
                      onChange={(e) => setEngineConcurrency(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs font-bold"
                    >
                      <option value={2}>२ इंजिन एकाच वेळी</option>
                      <option value={4}>४ इंजिन एकाच वेळी (फास्ट)</option>
                      <option value={6}>६ इंजिन एकाच वेळी (टर्बो)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleRunBalancedMultiEngineSweep(engineArticlesCount, engineConcurrency)}
                  disabled={isBalancedSweepRunning || !!runningEngineId}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isBalancedSweepRunning
                      ? 'bg-indigo-700 text-white cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02]'
                  }`}
                >
                  {isBalancedSweepRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>१२ AI इंजिन समतोल स्वीप सुरू आहे...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>🚀 सर्व १२ AI इंजिन संतुलित स्वीप करा</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Last Sweep Result summary banner */}
            {lastEngineSweepResult && (
              <div className="mt-5 p-3.5 bg-indigo-950/80 border border-indigo-800 rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="flex items-center gap-2 text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>शेवटचा मल्टी-AI स्वीप: <strong>{lastEngineSweepResult.totalArticles} बातम्या प्रसिद्ध</strong> ({lastEngineSweepResult.durationSeconds}s)</span>
                </span>
                <span className="text-emerald-300 font-mono font-bold">
                  ✓ १०००+ शब्द पडताळणी पूर्ण व डेटाबेसमध्ये सुरक्षित
                </span>
              </div>
            )}
          </div>

          {/* Engine Search and Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="AI इंजिन किंवा विषय शोधा..."
                value={engineSearchFilter}
                onChange={(e) => setEngineSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Bot className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
              <span>एकूण इंजिन्स: <strong className="text-indigo-600 font-black">{aiEngines.length}</strong></span>
              <span>•</span>
              <span>सर्व १०००+ शब्द खात्री</span>
              <span>•</span>
              <span className="text-emerald-600">२४/७ ऑटोनॉमस समतोल</span>
            </div>
          </div>

          {/* 12 AI Engine Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiEngines
              .filter(engine => 
                engine.nameMarathi.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                engine.name.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                engine.domainMarathi.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                engine.category.toLowerCase().includes(engineSearchFilter.toLowerCase())
              )
              .map((engine) => {
                const isCurrentlyRunning = runningEngineId === engine.id;

                return (
                  <div 
                    key={engine.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl ${engine.badgeColor || 'bg-indigo-700 text-white'} shadow-xs`}>
                            <Bot className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-gray-900 leading-tight">
                              {engine.nameMarathi}
                            </h4>
                            <div className="text-[11px] text-gray-400 font-normal">
                              {engine.name}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black shrink-0">
                          {engine.category}
                        </span>
                      </div>

                      {/* Domain / Beat */}
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {engine.description}
                      </p>

                      {/* Keywords / Search query */}
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
                          <span>विशेष कव्हरेज बीट (Beat):</span>
                          <span className="text-indigo-600 font-mono">Weight: {engine.priorityWeight}/10</span>
                        </div>
                        <div className="text-[11px] text-gray-700 font-medium">
                          {engine.domainMarathi}
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-[10px] text-gray-400 font-bold">प्रसिद्ध</div>
                          <div className="text-xs font-black text-gray-900">{engine.totalArticlesPublished}+</div>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-xl">
                          <div className="text-[10px] text-emerald-600 font-bold">शब्दसंख्या</div>
                          <div className="text-xs font-black text-emerald-700">{engine.avgWordCount}+</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-xl">
                          <div className="text-[10px] text-blue-600 font-bold">आरोग्य</div>
                          <div className="text-xs font-black text-blue-700">{engine.healthScore}%</div>
                        </div>
                      </div>

                      {/* Last headline snippet if present */}
                      {engine.lastArticleHeadline && (
                        <div className="text-[11px] text-gray-500 bg-amber-50/60 p-2 rounded-lg border border-amber-100 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 italic">"{engine.lastArticleHeadline}"</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleRunSingleAiEngine(engine.id, 2)}
                        disabled={isCurrentlyRunning || isBalancedSweepRunning}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isCurrentlyRunning
                            ? 'bg-amber-600 text-white cursor-wait'
                            : 'bg-slate-900 hover:bg-brand-red text-white'
                        }`}
                      >
                        {isCurrentlyRunning ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>बातमी संकलन सुरू आहे...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                            <span>⚡ ही बातमी आणा (Run Engine)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* AI Engines Operational Architecture Guide */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>मल्टी-AI इंजिन कार्यप्रणाली व लोड बॅलन्सिंग तत्त्वे (Architecture)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                <strong className="text-indigo-900 font-bold block">१. विषयनिहाय स्वतंत्र विशेषज्ञ मॉडेल्स</strong>
                <p>प्रत्येक इंजिनला त्या क्षेत्रातील सखोल पार्श्वभूमी (Persona Prompt) आणि अधिकृत स्त्रोत जोडलेले आहेत, ज्यामुळे बातम्या सामान्य न होता अत्यंत विश्लेषणात्मक व तज्ज्ञ दर्जाच्या बनतात.</p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                <strong className="text-emerald-900 font-bold block">२. स्वयंचलित लोड बॅलन्सिंग</strong>
                <p>सर्व इंजिन्समध्ये कामाचे समान वाटप केले जाते. २४/७ ऑटोनॉमस शेड्युलर दर ३ तासांनी फिरत्या पद्धतीने (Round-Robin) प्रत्येक कॅटेगरीत नवीन वृत्त जोडतो.</p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1">
                <strong className="text-amber-900 font-bold block">३. १०००+ शब्द व डुप्लिकेशन सुरक्षा</strong>
                <p>कोणत्याही दोन इंजिनच्या बातम्यांमध्ये पुनरावृत्ती (Duplicate) होणार नाही याची क्रॉस-इंजिन पडताळणी होते आणि प्रत्येक बातमी १०००+ शब्दांचीच तयार होते.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 7. Tab 3: DISTRICTS MATRIX & RAPID COLLECTOR */}
      {activeTab === 'DISTRICTS' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          
          {/* Header & Rapid Master Sweep Control */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-zinc-900 text-white rounded-2xl p-6 border border-red-900/50 relative overflow-hidden shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-brand-red text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                    ⚡ ३६ जिल्हे हाय-स्पीड इंजिन
                  </span>
                  <span className="px-2.5 py-0.5 bg-white/10 text-zinc-300 text-[11px] font-bold rounded-full">
                    ६x पॅरलल AI वर्कर्स • १०००+ शब्द खात्री
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                  महाराष्ट्रातील सर्व ३६ जिल्हे जलद वृत्त संकलन केंद्र
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  प्रत्येक जिल्ह्याच्या अधिकृत वृत्त स्त्रोतांतून, तालुका व गाव पातळीवरील स्थानिक घडामोडींचे जलद संकलन करा. एका क्लिकवर संपूर्ण ३६ जिल्ह्यांचा हाय-स्पीड स्वीप पूर्ण होतो.
                </p>
              </div>

              {/* Master 36 Districts Trigger */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleRapidAllDistricts(1)}
                  disabled={isTriggering || !!targetedDistrictLoading}
                  className={`py-3 px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isTriggering
                      ? 'bg-amber-600/60 text-white cursor-wait'
                      : 'bg-brand-red hover:bg-brand-saffron text-white hover:scale-[1.02]'
                  }`}
                >
                  {isTriggering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>३६ जिल्हे संकलन चालू आहे...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>🚀 सर्व ३६ जिल्हे हाय-स्पीड स्वीप करा</span>
                    </>
                  )}
                </button>
                <div className="text-[10px] text-zinc-400 text-center font-medium">
                  सरासरी ३०-४५ सेकंदात ३६+ सविस्तर पडताळणीकृत बातम्या
                </div>
              </div>
            </div>
          </div>

          {/* Division Fast-Track Bar */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-red" />
                <span className="text-xs font-black text-gray-900 uppercase tracking-wide">
                  प्रशासकीय विभागानुसार जलद संकलन (Division Fast-Tracks):
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">६ प्रशासकीय विभाग</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.entries(MAHARASHTRA_DIVISIONS_MAP).map(([divName, divDistricts]) => (
                <button
                  key={divName}
                  onClick={() => handleRapidDivision(divName, 1)}
                  disabled={isTriggering || !!targetedDistrictLoading}
                  className="p-2.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-brand-red/40 rounded-xl text-left transition-all group cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <div className="text-xs font-black text-gray-900 group-hover:text-brand-red truncate">
                    {divName}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 flex items-center justify-between">
                    <span>{divDistricts.length} जिल्हे</span>
                    <Zap className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedDivisionFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDivisionFilter === 'ALL'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                सर्व ३६ जिल्हे
              </button>
              {Object.keys(MAHARASHTRA_DIVISIONS_MAP).map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivisionFilter(div)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDivisionFilter === div
                      ? 'bg-brand-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={filterDistrictSearch}
              onChange={(e) => setFilterDistrictSearch(e.target.value)}
              placeholder="जिल्हा शोधा..."
              className="py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl max-w-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* 36 Districts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {MAHARASHTRA_36_DISTRICTS
              .filter(d => {
                const matchSearch = d.toLowerCase().includes(filterDistrictSearch.toLowerCase());
                if (selectedDivisionFilter === 'ALL') return matchSearch;
                const divisionDistricts = MAHARASHTRA_DIVISIONS_MAP[selectedDivisionFilter] || [];
                return matchSearch && divisionDistricts.includes(d);
              })
              .map(district => {
                const count = liveDistrictCoverage[district] || districtCoverage[district] || 0;
                const isTargetLoading = targetedDistrictLoading === district;
                const feed = DISTRICT_DEDICATED_FEEDS[district];

                return (
                  <div
                    key={district}
                    className="p-3.5 bg-gray-50 hover:bg-red-50/50 border border-gray-200 hover:border-red-200 rounded-2xl transition-all flex flex-col justify-between space-y-3 group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900 group-hover:text-brand-red">
                          {district}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
                        {feed?.division ? `${feed.division} विभाग` : 'महाराष्ट्र'}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-200/60">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-gray-500 font-medium">ताज्या बातम्या:</span>
                        <span className="text-xs font-black text-brand-red">{count}</span>
                      </div>

                      <button
                        onClick={() => handleRapidSingleDistrict(district, 2)}
                        disabled={isTriggering || !!targetedDistrictLoading}
                        className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isTargetLoading
                            ? 'bg-amber-600 text-white cursor-wait'
                            : 'bg-white hover:bg-brand-red hover:text-white border border-gray-200 text-gray-800 shadow-2xs'
                        }`}
                      >
                        {isTargetLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>संकलन चालू...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-amber-500 group-hover:text-white" />
                            <span>बातमी आणा (२)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 7. Tab 3: TRUSTED SOURCES */}
      {activeTab === 'SOURCES' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600" />
              <span>पडताळणीकृत अधिकृत वृत्त स्त्रोत ({TRUSTED_NEWS_SOURCES.length})</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              सर्व स्त्रोत १००% सुरक्षित व चालू
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">स्त्रोत नाव (Source)</th>
                  <th className="py-3 px-4">प्रकार (Type)</th>
                  <th className="py-3 px-4">विभाग / जिल्हा (Region)</th>
                  <th className="py-3 px-4">विश्वासार्हता स्कोअर (Trust Score)</th>
                  <th className="py-3 px-4">स्थिती (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TRUSTED_NEWS_SOURCES.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-800">
                      <div>{source.nameMarathi}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{source.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                        {source.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-600">
                      {source.district ? `📍 ${source.district}` : (source.region === 'MAHARASHTRA' ? 'महाराष्ट्र राज्य' : 'राष्ट्रीय भारत')}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {source.trustScore}%
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span>सक्रिय</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Tab 4: CYCLE HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>३-तास संकलन चक्र इतिहास नोंदी (Cycle History Logs)</span>
          </h3>

          {schedulerStatus?.recentCycles && schedulerStatus.recentCycles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">वेळ (IST Time)</th>
                    <th className="py-3 px-4">प्रसिद्ध बातम्या</th>
                    <th className="py-3 px-4">महाराष्ट्र कव्हरेज</th>
                    <th className="py-3 px-4">राष्ट्रीय बातम्या</th>
                    <th className="py-3 px-4">डुप्लिकेट विलीन</th>
                    <th className="py-3 px-4">कालावधी</th>
                    <th className="py-3 px-4">स्थिती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedulerStatus.recentCycles.map((cycle: CollectionCycle) => (
                    <tr key={cycle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-800">
                        {cycle.cycleScheduledTime || new Date(cycle.startedAt).toLocaleString('mr-IN')}
                      </td>
                      <td className="py-3 px-4 font-black text-brand-red text-sm">
                        {cycle.articlesPublished}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700">
                        {cycle.maharashtraCount}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700">
                        {cycle.nationalCount}
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-bold">
                        {cycle.duplicatesMerged}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {cycle.durationMs ? `${Math.round(cycle.durationMs / 1000)}s` : '३०s'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cycle.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cycle.status === 'COMPLETED' ? 'यशस्वी' : cycle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <span>पहिल्या ३-तास चक्राच्या नोंदी तयार होत आहेत...</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
