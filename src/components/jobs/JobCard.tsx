import React from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Banknote, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  FileText, 
  Share2, 
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { JobOpportunity } from '../../types';

interface JobCardProps {
  job: JobOpportunity;
  onViewDetails: (job: JobOpportunity) => void;
  onAskAi: (job: JobOpportunity) => void;
  language: 'mr' | 'en' | 'both';
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails, onAskAi, language }) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'GOVT_JOB':
        return { label: 'सरकारी नोकरी (Govt Job)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'PRIVATE_JOB':
        return { label: 'खाजगी / IT जॉब (Private)', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'INTERNSHIP':
        return { label: 'इंटर्नशिप / अ‍ॅप्रेंटिस', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'SCHOLARSHIP':
        return { label: 'शिष्यवृत्ती योजना (Scholarship)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'ENTRANCE_EXAM':
        return { label: 'प्रवेश परीक्षा (Entrance Exam)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'SKILL_TRAINING':
        return { label: 'कौशल्य प्रशिक्षण (Skill Training)', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'WALK_IN':
        return { label: 'थेट मुलाखत (Walk-in)', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: 'भरती संधी', bg: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const badge = getCategoryBadge(job.category);

  const shareOpportunity = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `📢 *${job.title}*\n🏢 विभाग: ${job.organization}\n🎓 पात्रता: ${job.qualificationsDisplay}\n💰 वेतन/मानधन: ${job.salary}\n📅 शेवटची तारीख: ${job.importantDates.lastDate}\n\n👉 सविस्तर माहिती व अधिकृत लिंक पहा राज्यवाणीवर: ${window.location.origin}/jobs`;
    
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

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
      id={`job-card-${job.id}`}
    >
      <div>
        {/* Top Badges Bar */}
        <div className="p-4 pb-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.bg}`}>
              {badge.label}
            </span>
            {job.isOfficialVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                अधिकृत / Verified Source
              </span>
            )}
            {job.isFresherEligible && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                <UserCheck className="w-3.5 h-3.5" />
                फ्रेशर्स पात्र (Freshers)
              </span>
            )}
          </div>
          
          <button
            onClick={shareOpportunity}
            title="WhatsApp वर शेअर करा"
            className="text-slate-400 hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            id={`share-btn-${job.id}`}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Organization */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{language === 'en' && job.organizationEn ? job.organizationEn : job.organization}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(job)}
            className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors cursor-pointer line-clamp-2 leading-snug mb-3"
          >
            {language === 'en' && job.titleEn ? job.titleEn : job.title}
          </h3>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-500 block">शैक्षणिक पात्रता:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{job.qualificationsDisplay}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-500 block">वेतनमान / मानधन:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{job.salary}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-500 block">स्थान / जिल्हा:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{job.district}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-500 block">शेवटची तारीख:</span>
                <span className="font-semibold text-red-600 line-clamp-1">{job.importantDates.lastDate}</span>
              </div>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {language === 'en' && job.descriptionEn ? job.descriptionEn : job.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-1">
            {job.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <button
          onClick={() => onAskAi(job)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg border border-indigo-200 transition-colors"
          id={`ai-help-btn-${job.id}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI मदत (Prep/Guidance)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(job)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
            id={`view-details-btn-${job.id}`}
          >
            <span>तपशील</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={job.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
            id={`apply-link-${job.id}`}
          >
            <span>अधिकृत अर्ज</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
