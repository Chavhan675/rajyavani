import React from 'react';
import { 
  Building2, 
  MapPin, 
  GraduationCap, 
  Banknote, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Share2, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
import { JobOpportunity } from '../../types';
import { computeVerifiedJobStatus, JOB_STATUS_CONFIG } from '../../services/jobVerificationService';

interface JobCardProps {
  job: JobOpportunity;
  onViewDetails: (job: JobOpportunity) => void;
  onAskAi: (job: JobOpportunity) => void;
  language: 'mr' | 'en' | 'both';
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails, onAskAi, language }) => {
  const verification = computeVerifiedJobStatus(job);
  const statusConfig = JOB_STATUS_CONFIG[verification.status];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'GOVT_JOB':
        return { label: 'सरकारी नोकरी (Govt Job)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'PRIVATE_JOB':
        return { label: 'खाजगी / IT जॉब', bg: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'INTERNSHIP':
        return { label: 'इंटर्नशिप / अ‍ॅप्रेंटिस', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'SCHOLARSHIP':
        return { label: 'शिष्यवृत्ती योजना', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ENTRANCE_EXAM':
        return { label: 'प्रवेश परीक्षा (Exam)', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'SKILL_TRAINING':
        return { label: 'कौशल्य प्रशिक्षण', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'WALK_IN':
        return { label: 'थेट मुलाखत (Walk-in)', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: 'भरती संधी', bg: 'bg-gray-50 text-gray-800 border-gray-200' };
    }
  };

  const catBadge = getCategoryBadge(job.category);

  const shareOpportunity = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `📢 *${job.title}*\n⚡ स्थिती: ${statusConfig.badgeEmoji} ${statusConfig.labelMarathi}\n🏢 विभाग: ${job.organization}\n🎓 पात्रता: ${job.qualificationsDisplay}\n💰 वेतन/मानधन: ${job.salary}\n📅 शेवटची तारीख: ${job.importantDates.lastDate}\n\n👉 अधिकृत पडताळणी तपशील पहा राज्यवाणीवर: ${window.location.origin}/jobs`;
    
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const isClosedOrCancelled = verification.status === 'CLOSED' || verification.status === 'CANCELLED';

  return (
    <div 
      className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
        isClosedOrCancelled 
          ? 'bg-slate-50/80 border-slate-300 opacity-90' 
          : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-md'
      }`}
      id={`job-card-${job.id}`}
    >
      <div>
        {/* Top Status & Verification Strip */}
        <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 ${
          verification.status === 'ACTIVE' 
            ? 'bg-emerald-50/70 border-emerald-100' 
            : verification.status === 'EXTENDED'
            ? 'bg-blue-50/70 border-blue-100'
            : verification.status === 'UPCOMING'
            ? 'bg-amber-50/70 border-amber-100'
            : verification.status === 'CANCELLED'
            ? 'bg-slate-100 border-slate-200'
            : 'bg-red-50/80 border-red-100'
        }`}>
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
            <span className={`text-xs font-black ${statusConfig.textClass}`}>
              {statusConfig.badgeEmoji} {language === 'en' ? statusConfig.labelEnglish : statusConfig.labelMarathi}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
              ३ तासांपूर्वी पडताळणीकृत
            </span>
            <button
              onClick={shareOpportunity}
              title="WhatsApp वर शेअर करा"
              className="text-slate-400 hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-white/60"
              id={`share-btn-${job.id}`}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Secondary Category & Features Row */}
        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${catBadge.bg}`}>
              {catBadge.label}
            </span>
            {job.isOfficialVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>अधिकृत स्त्रोत</span>
              </span>
            )}
            {job.isFresherEligible && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                <UserCheck className="w-3 h-3 text-sky-600" />
                <span>फ्रेशर्स पात्र</span>
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-700">
            {job.vacancies} पदे
          </span>
        </div>

        {/* Closed / Cancelled Warning Header */}
        {verification.status === 'CLOSED' && (
          <div className="bg-red-500/10 border-b border-red-200 px-4 py-2 text-[11px] font-bold text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>मुदत संपली: ही जाहिरात केवळ संदर्भासाठी आर्काइव्हमध्ये आहे. नवीन अर्ज करू नका.</span>
          </div>
        )}

        {verification.status === 'CANCELLED' && (
          <div className="bg-slate-200 border-b border-slate-300 px-4 py-2 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>शासकीय आदेशानुसार ही भरती प्रक्रिया रद्द / स्थगित करण्यात आली आहे.</span>
          </div>
        )}

        {/* Date Extended Notice */}
        {verification.status === 'EXTENDED' && (
          <div className="bg-blue-500/10 border-b border-blue-200 px-4 py-1.5 text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>शुद्धीपत्रक: मुदतवाढ मंजूर (अंतिम तारीख: {job.importantDates.lastDate})</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Organization */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{language === 'en' && job.organizationEn ? job.organizationEn : job.organization}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(job)}
            className={`text-sm sm:text-base font-bold transition-colors cursor-pointer line-clamp-2 leading-snug mb-3 ${
              isClosedOrCancelled 
                ? 'text-slate-700 hover:text-slate-900' 
                : 'text-slate-900 group-hover:text-red-600'
            }`}
          >
            {language === 'en' && job.titleEn ? job.titleEn : job.title}
          </h3>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
            <div className="flex items-start gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 block">पात्रता:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{job.qualificationsDisplay}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 block">वेतनमान:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{job.salary}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 block">जिल्हा/विभाग:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{job.district}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <Clock className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                verification.status === 'CLOSED' 
                  ? 'text-red-600' 
                  : verification.status === 'EXTENDED' 
                  ? 'text-blue-600' 
                  : 'text-amber-600'
              }`} />
              <div>
                <span className="text-[10px] text-slate-500 block">
                  {verification.status === 'EXTENDED' ? 'नवीन शेवटची तारीख:' : 'शेवटची तारीख:'}
                </span>
                <div className="flex items-center gap-1">
                  {job.importantDates.originalLastDate && (
                    <span className="text-[10px] text-slate-400 line-through">
                      {job.importantDates.originalLastDate}
                    </span>
                  )}
                  <span className={`font-bold line-clamp-1 ${
                    verification.status === 'CLOSED' 
                      ? 'text-red-600' 
                      : verification.status === 'EXTENDED'
                      ? 'text-blue-700'
                      : 'text-slate-900'
                  }`}>
                    {job.importantDates.lastDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Reason / Countdown Note */}
          <div className="text-[11px] text-slate-600 flex items-center justify-between">
            <span className="font-medium text-slate-500">
              {verification.notes}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
        <button
          onClick={() => onAskAi(job)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors"
          id={`ai-help-btn-${job.id}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">AI अभ्यास मदत</span>
          <span className="sm:hidden">AI</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onViewDetails(job)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            id={`view-details-btn-${job.id}`}
          >
            <span>तपशील</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {isClosedOrCancelled ? (
            <button
              onClick={() => onViewDetails(job)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="मुदत संपलेली जाहिरात संदर्भासाठी पहा"
              id={`closed-view-btn-${job.id}`}
            >
              <span>मुदत संपली</span>
            </button>
          ) : (
            <a
              href={job.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              id={`apply-link-${job.id}`}
            >
              <span>अधिकृत अर्ज</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
