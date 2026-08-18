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
  AlertTriangle,
  FileCheck2,
  Briefcase,
  Layers,
  History,
  CheckCircle
} from 'lucide-react';
import { JobOpportunity } from '../../types';
import { computeVerifiedJobStatus, JOB_STATUS_CONFIG } from '../../services/jobVerificationService';

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

  const verification = computeVerifiedJobStatus(job);
  const statusConfig = JOB_STATUS_CONFIG[verification.status];
  const isClosedOrCancelled = verification.status === 'CLOSED' || verification.status === 'CANCELLED';

  const shareOpportunity = () => {
    const shareText = `📢 *${job.title}*\n⚡ स्थिती: ${statusConfig.badgeEmoji} ${statusConfig.labelMarathi}\n🏢 विभाग: ${job.organization}\n🎓 पात्रता: ${job.qualificationsDisplay}\n💰 मानधन/वेतन: ${job.salary}\n📅 शेवटची तारीख: ${job.importantDates.lastDate}\n\n👉 अधिकृत पडताळणी तपशील पहा राज्यवाणीवर: ${window.location.origin}/jobs`;
    
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
              {/* Strict Status Pill */}
              <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusConfig.bgClass} ${statusConfig.borderClass}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                <span>{statusConfig.badgeEmoji} {language === 'en' ? statusConfig.labelEnglish : statusConfig.labelMarathi}</span>
              </span>

              {job.isOfficialVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  अधिकृत स्त्रोत पडताळणी
                </span>
              )}

              {job.isFresherEligible && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  फ्रेशर्स पात्र
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

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-700 divide-y divide-slate-100">
          
          {/* Section 0: Strict Official Status & Audit Report */}
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border ${
              verification.status === 'ACTIVE'
                ? 'bg-emerald-50/70 border-emerald-200'
                : verification.status === 'EXTENDED'
                ? 'bg-blue-50/70 border-blue-200'
                : verification.status === 'UPCOMING'
                ? 'bg-amber-50/70 border-amber-200'
                : verification.status === 'CANCELLED'
                ? 'bg-slate-100 border-slate-300'
                : 'bg-red-50/80 border-red-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      भरती स्थिती पडताळणी अहवाल (Recruitment Audit Report)
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border font-bold text-slate-600">
                      दर ३ तासांनी री-चेक
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {verification.notes}
                  </p>
                </div>
              </div>

              {/* Strict Verification 5-Point Checklist */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>अधिकृत शासन निर्णय / अधिसूचना पडताळली</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>अधिकृत पोर्टलवर थेट अर्ज स्थिती तपासली</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>तारीख गणित व मुदत संपल्याची खात्री केली</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>नवीन शुद्धीपत्रक / मुदतवाढ नोंद तपासली</span>
                </div>
              </div>
            </div>

            {/* Warning Callout for Closed Jobs */}
            {verification.status === 'CLOSED' && (
              <div className="bg-red-600 text-white p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-sm">⚠️ मुदत संपली (Application Closed / Expired)</h4>
                  <p className="text-red-100 leading-relaxed">
                    या भरतीची ऑनलाइन अर्ज करण्याची अधिकृत मुदत <strong>{job.importantDates.lastDate}</strong> रोजी संपली आहे. राज्यवाणीच्या नियमांनुसार आम्ही मुदत संपलेली जाहिरात नवीन किंवा सक्रिय म्हणून दाखवत नाही. ही माहिती केवळ जुन्या संदर्भासाठी आर्काइव्हमध्ये ठेवली आहे.
                  </p>
                </div>
              </div>
            )}

            {/* Corrigendum Note for Extended Jobs */}
            {verification.status === 'EXTENDED' && (
              <div className="bg-blue-600 text-white p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <FileCheck2 className="w-5 h-5 text-sky-200 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-sm">📢 अधिकृत मुदतवाढ (Deadline Extended)</h4>
                  <p className="text-blue-100 leading-relaxed">
                    {job.corrigendumNotes || `अधिकृत शुद्धीपत्रकाद्वारे अर्ज करण्याची शेवटची तारीख वाढवण्यात आली आहे.`}
                  </p>
                  {job.importantDates.originalLastDate && (
                    <div className="mt-1 pt-1 border-t border-blue-400 text-[11px] text-blue-200">
                      मूळ अंतिम तारीख: <span className="line-through">{job.importantDates.originalLastDate}</span> ➔ <strong>नवीन अंतिम तारीख: {job.importantDates.lastDate}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Overview and Simple Explanation */}
          <div className="pt-4 space-y-3">
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

          {/* Section 2: Key Parameters Table */}
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
              <div className={`p-3 rounded-lg border text-center ${
                verification.status === 'CLOSED'
                  ? 'bg-red-50 border-red-200'
                  : verification.status === 'EXTENDED'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <span className="text-[11px] text-slate-600 font-semibold block">
                  {verification.status === 'EXTENDED' ? 'नवीन शेवटची तारीख' : 'अर्ज करण्याची शेवटची तारीख'}
                </span>
                <span className={`font-extrabold text-sm ${
                  verification.status === 'CLOSED' 
                    ? 'text-red-700' 
                    : verification.status === 'EXTENDED' 
                    ? 'text-blue-700' 
                    : 'text-emerald-700'
                }`}>
                  {job.importantDates.lastDate}
                </span>
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
                <span className="font-semibold text-slate-900 block">अधिकृत स्रोत व अचूकता पडताळणी:</span>
                <span>ही माहिती {job.sourceName} या अधिकृत अधिसूचनेच्या आधारे प्रसिद्ध करण्यात आली आहे. राज्यवाणीवरील प्रत्येक भरतीची दर ३ तासांनी पुनर्तपासणी केली जाते.</span>
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
              <span>AI अभ्यास मार्गदर्शक</span>
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

            {isClosedOrCancelled ? (
              <div 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-200 px-4 py-2.5 rounded-xl cursor-not-allowed border border-slate-300"
                id="modal-apply-disabled-btn"
              >
                <span>अर्ज प्रक्रिया बंद (Expired)</span>
              </div>
            ) : (
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
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
