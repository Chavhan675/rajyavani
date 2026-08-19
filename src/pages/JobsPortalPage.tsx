import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Search, 
  Sparkles, 
  Building2, 
  MapPin, 
  Filter, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Layers, 
  Users, 
  ExternalLink, 
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Home,
  ArrowLeft,
  AlertTriangle,
  Clock,
  FileCheck2,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { JobCard } from '../components/jobs/JobCard';
import { JobDetailModal } from '../components/jobs/JobDetailModal';
import { AiCareerAssistantModal } from '../components/jobs/AiCareerAssistantModal';
import { VERIFIED_JOBS_DATA, CATEGORY_FILTERS, QUALIFICATION_FILTERS, STATUS_FILTERS } from '../data/jobsData';
import { MAHARASHTRA_DISTRICTS } from '../data/maharashtraDistricts';
import { JobOpportunity, JobOpportunityCategory, JobOpportunityStatus } from '../types';
import { computeVerifiedJobStatus, auditAndRecheckJobs } from '../services/jobVerificationService';

export default function JobsPortalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE_ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedQualification, setSelectedQualification] = useState<string>('ALL');
  const [fresherOnly, setFresherOnly] = useState(false);
  const [language, setLanguage] = useState<'mr' | 'en' | 'both'>('mr');

  // Re-check / Audit Simulation State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);
  const [jobsDataList, setJobsDataList] = useState<JobOpportunity[]>(VERIFIED_JOBS_DATA);

  // Modals state
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  const handleRunInstantAudit = () => {
    setIsAuditing(true);
    setAuditFeedback('अधिकृत पोर्टल, मुदतवाढ शुद्धीपत्रक व अंतिम तारखांची पडताळणी सुरू आहे...');
    
    setTimeout(() => {
      const { auditedJobs, stats } = auditAndRecheckJobs(jobsDataList);
      setJobsDataList(auditedJobs);
      setIsAuditing(false);
      setAuditFeedback(`✅ पडताळणी पूर्ण! एकूण ${stats.totalChecked} भरती तपासल्या: ${stats.activeCount} सक्रिय, ${stats.extendedCount} मुदतवाढ, ${stats.upcomingCount} आगामी, ${stats.closedCount} मुदत संपलेल्या.`);
      
      setTimeout(() => {
        setAuditFeedback(null);
      }, 5000);
    }, 900);
  };

  // Filter logic
  const filteredJobs = useMemo(() => {
    return jobsDataList.filter((job) => {
      const verification = computeVerifiedJobStatus(job);

      // Status filter
      if (selectedStatus === 'ACTIVE_ALL') {
        // Show only active & extended (currently accepting applications)
        if (verification.status !== 'ACTIVE' && verification.status !== 'EXTENDED') {
          return false;
        }
      } else if (selectedStatus !== 'ALL') {
        if (verification.status !== selectedStatus) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL' && job.category !== selectedCategory) {
        return false;
      }

      // District filter
      if (selectedDistrict !== 'ALL') {
        if (job.district !== 'महाराष्ट्र सर्व जिल्हे' && !job.district.includes(selectedDistrict)) {
          return false;
        }
      }

      // Qualification filter
      if (selectedQualification !== 'ALL') {
        if (!job.qualifications.includes(selectedQualification) && !job.qualifications.includes('Any')) {
          return false;
        }
      }

      // Fresher filter
      if (fresherOnly && !job.isFresherEligible) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q) || (job.titleEn && job.titleEn.toLowerCase().includes(q));
        const matchesOrg = job.organization.toLowerCase().includes(q) || (job.organizationEn && job.organizationEn.toLowerCase().includes(q));
        const matchesDistrict = job.district.toLowerCase().includes(q) || (job.city && job.city.toLowerCase().includes(q));
        const matchesQual = job.qualificationsDisplay.toLowerCase().includes(q);
        const matchesTags = job.tags.some(t => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesOrg && !matchesDistrict && !matchesQual && !matchesTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by start date (latest first), fallback to end date (latest first)
      const dateA = new Date(a.importantDates.rawStartDate || a.importantDates.rawDate || 0).getTime();
      const dateB = new Date(b.importantDates.rawStartDate || b.importantDates.rawDate || 0).getTime();
      return dateB - dateA;
    });
  }, [jobsDataList, searchQuery, selectedStatus, selectedCategory, selectedDistrict, selectedQualification, fresherOnly]);

  const handleOpenDetails = (job: JobOpportunity) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const handleOpenAiAssistant = (job?: JobOpportunity, customPrompt?: string) => {
    setSelectedJob(job || null);
    setAiInitialPrompt(customPrompt);
    setIsAiModalOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ACTIVE_ALL');
    setSelectedCategory('ALL');
    setSelectedDistrict('ALL');
    setSelectedQualification('ALL');
    setFresherOnly(false);
  };

  // Counts for status tabs
  const statusCounts = useMemo(() => {
    let activeAll = 0;
    let extended = 0;
    let upcoming = 0;
    let closed = 0;
    let cancelled = 0;
    let all = jobsDataList.length;

    jobsDataList.forEach(j => {
      const v = computeVerifiedJobStatus(j);
      if (v.status === 'ACTIVE' || v.status === 'EXTENDED') activeAll++;
      if (v.status === 'EXTENDED') extended++;
      if (v.status === 'UPCOMING') upcoming++;
      if (v.status === 'CLOSED') closed++;
      if (v.status === 'CANCELLED') cancelled++;
    });

    return { activeAll, extended, upcoming, closed, cancelled, all };
  }, [jobsDataList]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <SEO 
        title="विद्यार्थी व नोकरी महामार्ग | Maharashtra Students & Job Opportunities - राज्यवाणी"
        description="महाराष्ट्रातील सर्व ३६ जिल्ह्यांतील सरकारी नोकऱ्या (MPSC, पोलीस, तलाठी, रेल्वे), IT व खाजगी जॉब्स, इंटर्नशिप, महाडीबीटी शिष्यवृत्ती, CET प्रवेश परीक्षा व AI करिअर मार्गदर्शक."
        category="शिक्षण व नोकरी"
      />

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs">
          <Link
            to="/"
            id="jobs-back-home-btn"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white hover:bg-red-700 font-bold text-sm rounded-xl shadow-xs hover:shadow transition-all group"
            title="मुख्यपृष्ठावर परत जा"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <Home className="w-4 h-4" />
            <span>मुख्यपृष्ठावर जा (Go to Home Page)</span>
          </Link>

          <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-brand-red flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5 text-gray-400" />
              <span>मुख्यपृष्ठ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-brand-red font-bold">नोकरी व भरती पडताळणी महामार्ग</span>
          </nav>
        </div>

        {/* Top Hero / Portal Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>१००% अधिकृत व पडताळलेली माहिती • मुदत संपलेल्या जाहिराती सक्रिय म्हणून दाखवल्या जात नाहीत</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              महाराष्ट्र विद्यार्थी व नोकरी पडताळणी महामार्ग
            </h1>
            
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              महाराष्ट्रातील तरुण आणि विद्यार्थ्यांसाठी सरकारी भरती, IT/खाजगी नोकऱ्या, इंटर्नशिप, शिष्यवृत्ती योजना आणि AI अभ्यास मार्गदर्शक. प्रत्येक जाहिरातीची अंतिम मुदत आणि शुद्धीपत्रक दर ३ तासांनी अधिकृत पोर्टलवरून तपासले जाते.
            </p>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                <span className="text-xl sm:text-2xl font-black text-amber-300 block">१७,०००+</span>
                <span className="text-[11px] text-slate-300">पोलीस व शासकीय पदे</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-300 block">३६ जिल्हे</span>
                <span className="text-[11px] text-slate-300">महाराष्ट्र कव्हरेज</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                <span className="text-xl sm:text-2xl font-black text-sky-300 block">३ तास सायकल</span>
                <span className="text-[11px] text-slate-300">स्वयंचलित री-व्हेरिफिकेशन</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                <span className="text-xl sm:text-2xl font-black text-purple-300 block">AI Prep</span>
                <span className="text-[11px] text-slate-300">मोफत अभ्यास मार्गदर्शक</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strict Job Verification & Anti-Outdated Policy Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>राज्यवाणी भरती पडताळणी धोरण (Strict Verification Rules)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Active Audit Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  Google किंवा इतर संकेतस्थळांवर जुनी भरती दिसत असली तरी आम्ही अंतिम मुदत संपलेली जाहिरात <strong>सक्रिय</strong> म्हणून दाखवत नाही.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                      alert('You are already receiving notifications for new recruitments!');
                    } else if (Notification.permission !== 'denied') {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                          alert('Successfully subscribed to real-time recruitment notifications!');
                        }
                      });
                    } else {
                      alert('Notifications are blocked. Please enable them in your browser settings.');
                    }
                  } else {
                    alert('Your browser does not support notifications.');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                id="enable-notifications-btn"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></div>
                <span>अलर्ट्स मिळवा (Get Alerts)</span>
              </button>

              <button
                onClick={handleRunInstantAudit}
                disabled={isAuditing}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isAuditing
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-red-700 text-white shadow-xs'
                }`}
                id="run-instant-audit-btn"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isAuditing ? 'पडताळणी सुरू आहे...' : 'सर्व भरती री-चेक करा (Audit Now)'}</span>
              </button>
            </div>
          </div>

          {auditFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold animate-fadeIn flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{auditFeedback}</span>
            </div>
          )}

          {/* 5-Step Process Visual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs pt-1">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
              <span className="font-black text-red-600 text-sm">१.</span>
              <div>
                <span className="font-bold text-slate-800 block">मूळ जाहिरात तपासणी</span>
                <span className="text-[11px] text-slate-500">अधिकृत शासन निर्णय व GR</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
              <span className="font-black text-red-600 text-sm">२.</span>
              <div>
                <span className="font-bold text-slate-800 block">तारीख तुलना</span>
                <span className="text-[11px] text-slate-500">आजची तारीख vs अंतिम मुदत</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
              <span className="font-black text-red-600 text-sm">३.</span>
              <div>
                <span className="font-bold text-slate-800 block">पोर्टल अर्ज स्थिती</span>
                <span className="text-[11px] text-slate-500">अर्ज स्वीकारणे सुरू आहे का?</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
              <span className="font-black text-red-600 text-sm">४.</span>
              <div>
                <span className="font-bold text-slate-800 block">शुद्धीपत्रक / मुदतवाढ</span>
                <span className="text-[11px] text-slate-500">नवीन तारखेसह अपडेट</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
              <span className="font-black text-red-600 text-sm">५.</span>
              <div>
                <span className="font-bold text-slate-800 block">३ तास स्वयंचलित सायकल</span>
                <span className="text-[11px] text-slate-500">मुदत संपल्यास आर्काइव्हमध्ये</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Career Assistant Prompt Bar */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-4 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-700/50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/40 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  राज्यवाणी AI करिअर व अभ्यास मार्गदर्शक
                </h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  विनामूल्य / Free
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                "१२वीनंतर काय करावे?", "MPSC स्टडी प्लॅन", "पुण्यातील IT नोकऱ्या", "मुलाखत प्रश्न" किंवा "रिज्युमे रिव्ह्यू" साठी AI ला विचारा!
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAiAssistant()}
            className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-indigo-950 font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
            id="open-ai-assistant-hero-btn"
          >
            <Sparkles className="w-4 h-4 text-indigo-950" />
            <span>AI मार्गदर्शकास विचारा (Ask AI)</span>
          </button>
        </div>

        {/* Status Filters Bar (Primary Recruitment Lifecycle State) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>भरती स्थितीनुसार निवडा (Filter by Recruitment Status):</span>
            </span>
            <span className="text-[11px] text-slate-500">
              एकूण {jobsDataList.length} नोंदी
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {STATUS_FILTERS.map((s) => {
              const count = 
                s.value === 'ACTIVE_ALL' ? statusCounts.activeAll :
                s.value === 'EXTENDED' ? statusCounts.extended :
                s.value === 'UPCOMING' ? statusCounts.upcoming :
                s.value === 'CLOSED' ? statusCounts.closed :
                s.value === 'CANCELLED' ? statusCounts.cancelled : statusCounts.all;

              const isSelected = selectedStatus === s.value;

              return (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? `${s.badgeClass} shadow-xs`
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  id={`status-tab-${s.value}`}
                >
                  <span>{s.iconEmoji}</span>
                  <span>{s.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Secondary Filters Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          
          {/* Main Search & Dropdown Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नोकरी, पद, विभाग, जिल्हा किंवा कीवर्ड शोधा (उदा. पोलीस, MPSC, TCS, पुणे, नांदेड)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-red-600 outline-hidden transition-colors"
                id="jobs-search-input"
              />
            </div>

            {/* District Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-red-600 outline-hidden transition-colors text-slate-800 font-medium"
                id="jobs-district-select"
              >
                <option value="ALL">📍 सर्व ३६ जिल्हे (All Districts)</option>
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.nameMarathi}>
                    {d.nameMarathi} ({d.nameEnglish})
                  </option>
                ))}
              </select>
            </div>

            {/* Language / Fresher Toggle */}
            <div className="md:col-span-3 flex items-center gap-2">
              <label 
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all ${
                  fresherOnly 
                    ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={fresherOnly}
                  onChange={(e) => setFresherOnly(e.target.checked)}
                  className="hidden"
                />
                <CheckCircle2 className={`w-3.5 h-3.5 ${fresherOnly ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>फक्त फ्रेशर्स (Freshers)</span>
              </label>

              {/* Language toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setLanguage('mr')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${language === 'mr' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${language === 'en' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedCategory === cat.value
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                id={`category-tab-${cat.value}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Qualification Filter Chips */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">पात्रता:</span>
            {QUALIFICATION_FILTERS.map((qual) => (
              <button
                key={qual.value}
                onClick={() => setSelectedQualification(qual.value)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all border shrink-0 ${
                  selectedQualification === qual.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                id={`qualification-filter-${qual.value}`}
              >
                {qual.label}
              </button>
            ))}
          </div>

        </div>

        {/* Results Counter and Active Filter Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 bg-slate-200/80 px-2.5 py-1 rounded-md text-xs">
              {filteredJobs.length} संधी उपलब्ध
            </span>
            <span>
              {selectedStatus === 'ACTIVE_ALL' && '(केवळ सध्या अर्ज सुरू असलेल्या भरती)'}
              {selectedStatus === 'EXTENDED' && '(मुदतवाढ मिळालेल्या भरती)'}
              {selectedStatus === 'UPCOMING' && '(आगामी भरती)'}
              {selectedStatus === 'CLOSED' && '(मुदत संपलेली ऐतिहासिक आर्काइव्ह)'}
              {selectedStatus === 'CANCELLED' && '(रद्द / स्थगित भरती)'}
              {selectedStatus === 'ALL' && '(सर्व भरती नोंदी)'}
            </span>
          </div>

          {(selectedCategory !== 'ALL' || selectedDistrict !== 'ALL' || selectedQualification !== 'ALL' || searchQuery || fresherOnly || selectedStatus !== 'ACTIVE_ALL') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-bold hover:underline"
              id="reset-filters-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>फिल्टर्स रिसेट करा (Reset Filters)</span>
            </button>
          )}
        </div>

        {/* Opportunity Cards Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleOpenDetails}
                onAskAi={handleOpenAiAssistant}
                language={language}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                निवडलेल्या निकषांनुसार भरती जाहिरात सापडली नाही
              </h3>
              <p className="text-xs text-slate-500">
                कृपया भरती स्थिती (Status), जिल्हा, शैक्षणिक पात्रता किंवा कीवर्ड बदलून पुन्हा प्रयत्न करा.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={resetFilters}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                सर्व सक्रिय संधी पहा (Reset)
              </button>
              <button
                onClick={() => handleOpenAiAssistant(undefined, searchQuery ? `मला "${searchQuery}" संबंधित महाराष्ट्रातील नोकऱ्या व संधी सांगा` : undefined)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI कडे थेट शोधा</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Important Official Portals Box for Maharashtra Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>महाराष्ट्र शासन व अधिकृत भरती पोर्टल्स (Official Direct Links)</span>
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Portals
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <a
              href="https://mpsc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-red-50 p-3 rounded-xl border border-slate-200 hover:border-red-200 text-center transition-all group"
            >
              <span className="font-bold text-slate-900 group-hover:text-red-700 block text-xs">MPSC पोर्टल</span>
              <span className="text-[10px] text-slate-500">लोकसेवा आयोग</span>
            </a>

            <a
              href="https://policerecruitment2026.mahait.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-red-50 p-3 rounded-xl border border-slate-200 hover:border-red-200 text-center transition-all group"
            >
              <span className="font-bold text-slate-900 group-hover:text-red-700 block text-xs">पोलीस भरती</span>
              <span className="text-[10px] text-slate-500">महा आयटी पोर्टल</span>
            </a>

            <a
              href="https://mahadbt.maharashtra.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-red-50 p-3 rounded-xl border border-slate-200 hover:border-red-200 text-center transition-all group"
            >
              <span className="font-bold text-slate-900 group-hover:text-red-700 block text-xs">MahaDBT</span>
              <span className="text-[10px] text-slate-500">शिष्यवृत्ती योजना</span>
            </a>

            <a
              href="https://cetcell.mahacet.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-red-50 p-3 rounded-xl border border-slate-200 hover:border-red-200 text-center transition-all group"
            >
              <span className="font-bold text-slate-900 group-hover:text-red-700 block text-xs">CET Cell</span>
              <span className="text-[10px] text-slate-500">प्रवेश परीक्षा कक्ष</span>
            </a>

            <a
              href="https://mahaswayam.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-red-50 p-3 rounded-xl border border-slate-200 hover:border-red-200 text-center transition-all group"
            >
              <span className="font-bold text-slate-900 group-hover:text-red-700 block text-xs">महास्वयं</span>
              <span className="text-[10px] text-slate-500">कौशल्य विकास</span>
            </a>

            <a
              href="https://ibpsonline.ibps.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-red-50 p-3 rounded-xl border border-slate-200 hover:border-red-200 text-center transition-all group"
            >
              <span className="font-bold text-slate-900 group-hover:text-red-700 block text-xs">IBPS / TCS</span>
              <span className="text-[10px] text-slate-500">परीक्षा पोर्टल</span>
            </a>
          </div>
        </div>

      </main>

      <Footer />

      {/* Modals */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAskAi={(job) => {
          setIsDetailModalOpen(false);
          handleOpenAiAssistant(job);
        }}
        language={language}
      />

      <AiCareerAssistantModal
        job={selectedJob || undefined}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialPrompt={aiInitialPrompt}
      />
    </div>
  );
}
