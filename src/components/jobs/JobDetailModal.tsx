import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Banknote, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  Download, 
  ShieldCheck, 
  Clock, 
  UserCheck,
  AlertCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { JobOpportunity } from '../../types';

interface JobDetailModalProps {
  job: JobOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAi: (job: JobOpportunity) => void;
  language: 'mr' | 'en' | 'both';
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onAskAi,
  language
}) => {
  if (!isOpen || !job) return null;

  const shareOpportunity = () => {
    const shareText = `📢 *${job.title}*\n🏢 विभाग: ${job.organization}\n🎓 पात्रता: ${job.qualificationsDisplay}\n💰 मानधन/वेतन: ${job.salary}\n📅 शेवटची तारीख: ${job.importantDates.lastDate}\n\n👉 अधिकृत अर्ज लिंक व सविस्तर तपशील पहा राज्यवाणीवर: ${window.location.origin}/jobs`;
    
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        id="job-detail-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                {job.category === 'GOVT_JOB' ? 'सरकारी नोकरी (Govt Job)' : 
                 job.category === 'PRIVATE_JOB' ? 'खाजगी / IT संधी' : 
                 job.category === 'INTERNSHIP' ? 'इंटर्नशिप / अ‍ॅप्रेंटिस' : 
                 job.category === 'SCHOLARSHIP' ? 'शिष्यवृत्ती योजना' : 
                 job.category === 'ENTRANCE_EXAM' ? 'प्रवेश परीक्षा' : 
                 job.category === 'SKILL_TRAINING' ? 'कौशल्य विकास' : 'संधी तपशील'}
              </span>

              {job.isOfficialVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  अधिकृत व पडताळलेली माहिती
                </span>
              )}

              {job.isFresherEligible && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  फ्रेशर्स पात्र (Freshers Eligible)
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.organization}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {job.title}
            </h2>
            {job.titleEn && (
              <p className="text-xs text-slate-600 font-medium">
                {job.titleEn}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors shrink-0"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body - 15 Structured Points */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-700 divide-y divide-slate-100">
          
          {/* Section 1: Overview and Simple Explanation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>१. सोप्या भाषेत माहिती व पार्श्वभूमी (Summary & Details)</span>
            </h3>
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/70 text-slate-800 leading-relaxed text-sm">
              <p className="mb-2 font-medium">{job.description}</p>
              {job.descriptionEn && (
                <p className="text-xs text-slate-600 italic border-t border-amber-200/50 pt-2">{job.descriptionEn}</p>
              )}
            </div>
          </div>

          {/* Section 2: Key Parameters Table (15 Official Fields) */}
          <div className="pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>२. भरती व संधीचे महत्त्वाचे निकष (Key Criteria & Vacancy Info)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">संस्था / विभाग (Organization):</span>
                <span className="font-bold text-slate-900 text-sm">{job.organization}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">एकूण पदे / जागा (Vacancies):</span>
                <span className="font-bold text-slate-900 text-sm">{job.vacancies}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">शैक्षणिक पात्रता (Qualification):</span>
                <span className="font-bold text-indigo-900 text-sm">{job.qualificationsDisplay}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">वेतनमान / मानधन (Salary/Stipend):</span>
                <span className="font-bold text-emerald-800 text-sm">{job.salary}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">वयोमर्यादा (Age Limit):</span>
                <span className="font-bold text-slate-900 text-sm">{job.ageLimit}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">नोकरीचे स्थान (Location / District):</span>
                <span className="font-bold text-slate-900 text-sm">{job.district} {job.city ? `(${job.city})` : ''}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">अर्ज शुल्क (Application Fee):</span>
                <span className="font-bold text-slate-900 text-sm">{job.applicationFee}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-0.5">निवड पद्धत (Selection Process):</span>
                <span className="font-bold text-slate-900 text-sm">{job.selectionProcess}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Important Dates */}
          <div className="pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>३. महत्त्वाच्या तारखा (Important Dates & Deadlines)</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {job.importantDates.startDate && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">अर्ज सुरू होण्याची तारीख</span>
                  <span className="font-bold text-slate-800 text-xs">{job.importantDates.startDate}</span>
                </div>
              )}
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                <span className="text-[11px] text-red-600 font-semibold block">अर्ज करण्याची शेवटची तारीख</span>
                <span className="font-extrabold text-red-700 text-sm">{job.importantDates.lastDate}</span>
              </div>
              {job.importantDates.examDate && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">संभाव्य परीक्षा / मुलाखत तारीख</span>
                  <span className="font-bold text-slate-800 text-xs">{job.importantDates.examDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Required Documents Checklist */}
          <div className="pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>४. अर्जासाठी आवश्यक कागदपत्रे (Required Documents Checklist)</span>
            </h3>
            
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {job.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 5: Official Verification & Disclaimer */}
          <div className="pt-4 space-y-2">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">अधिकृत स्रोत पडताळणी:</span>
                <span>ही माहिती {job.sourceName} या अधिकृत अधिसूचनेच्या आधारे प्रसिद्ध करण्यात आली आहे. अर्ज करण्यापूर्वी उमेदवारांनी अधिकृत जाहिरात काळजीपूर्वक वाचावी.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer CTAs */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAi(job)}
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-100/80 hover:bg-indigo-200 px-4 py-2.5 rounded-xl border border-indigo-300 transition-colors"
              id="modal-ask-ai-btn"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI अभ्यास / मुलाखत मार्गदर्शक</span>
            </button>

            <button
              onClick={shareOpportunity}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 transition-colors"
              id="modal-share-btn"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">शेअर करा</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {job.notificationPdfUrl && (
              <a
                href={job.notificationPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 transition-colors"
                id="modal-pdf-link"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>जाहिरात PDF</span>
              </a>
            )}

            <a
              href={job.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              id="modal-apply-link"
            >
              <span>अधिकृत अर्ज करा</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
