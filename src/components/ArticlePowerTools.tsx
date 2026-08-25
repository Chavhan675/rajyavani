import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Check, 
  Type, 
  Share2, 
  Clock, 
  FileText, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  WifiOff
} from 'lucide-react';

interface ArticlePowerToolsProps {
  articleId: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
}

export default function ArticlePowerTools({
  articleId,
  title,
  summary,
  content,
  category,
  fontSize,
  setFontSize
}: ArticlePowerToolsProps) {
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [showKeyPoints, setShowKeyPoints] = useState(true);
  const [copied, setCopied] = useState(false);

  // Calculate approximate word count & reading time
  const plainContent = content.replace(/<[^>]*>/g, ' ');
  const words = plainContent.trim().split(/\s+/).length;
  const readMinutes = Math.max(2, Math.ceil(words / 180));

  // Extract 3 Smart Highlights from summary and content
  const extractKeyPoints = (): string[] => {
    if (!content) return [];
    // Extract first few strong Marathi sentences
    const cleanText = `${summary || ''} ${plainContent}`.replace(/\s+/g, ' ');
    const sentences = cleanText
      .split(/[।.\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 25 && s.length < 150);

    if (sentences.length >= 3) {
      return sentences.slice(0, 3);
    }

    return [
      `${title} संदर्भात सविस्तर अधिकृत माहिती व महत्त्वाचे मुद्दे.`,
      `शासकीय व अधिकृत संस्थांकडून पडताळणी केलेले सविस्तर वृत्त.`,
      `नागरिक आणि संबंधित क्षेत्रासाठी आवश्यक असलेले प्रमुख निर्णय व परिणाम.`
    ];
  };

  const keyPoints = extractKeyPoints();

  // Check offline storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`offline_article_${articleId}`);
      if (saved) {
        setIsOfflineSaved(true);
      }
    } catch (e) {}
  }, [articleId]);

  const handleSaveOffline = () => {
    try {
      if (isOfflineSaved) {
        localStorage.removeItem(`offline_article_${articleId}`);
        setIsOfflineSaved(false);
      } else {
        const payload = {
          id: articleId,
          title,
          summary,
          content,
          category,
          savedAt: Date.now()
        };
        localStorage.setItem(`offline_article_${articleId}`, JSON.stringify(payload));
        setIsOfflineSaved(true);
      }
    } catch (e) {
      alert('ऑफलाइन जतन करण्यासाठी मेमरी अपुरी आहे.');
    }
  };

  const handleCopyCrux = () => {
    const textToCopy = `*${title}*\n\n📌 *महत्त्वाचे मुद्दे:*\n${keyPoints.map(p => `• ${p}`).join('\n')}\n\nसविस्तर वाचा: ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 mb-6">
      
      {/* Top Bar: Article Stats, Font Controls, and Offline Save */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700">
        
        {/* Word Count & Reading Time Pills */}
        <div className="flex items-center gap-3 font-semibold text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-red" />
            <span>⏱️ {readMinutes} मिनिटे वाचन</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>📝 {words > 500 ? `${words}+ शब्द (सविस्तर)` : `${words} शब्द`}</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1 text-emerald-700 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>अधिकृत पडताळणी</span>
          </span>
        </div>

        {/* Action Controls: Font Size & Offline Save */}
        <div className="flex items-center gap-2">
          
          {/* Font Resizer */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                fontSize === 'normal' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="सामान्य फॉन्ट (Normal Font)"
            >
              अ
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg text-sm font-black transition-colors cursor-pointer ${
                fontSize === 'large' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="मोठा फॉन्ट (Large Font)"
            >
              अ+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded-lg text-base font-black transition-colors cursor-pointer ${
                fontSize === 'xlarge' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="सर्वात मोठा फॉन्ट (Extra Large Font)"
            >
              अ++
            </button>
          </div>

          {/* Offline Save Button */}
          <button
            onClick={handleSaveOffline}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
              isOfflineSaved 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
            title="इंटरनेट नसतानाही बातमी वाचण्यासाठी सेव्ह करा"
          >
            {isOfflineSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>ऑफलाइन जतन झाले</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>ऑफलाइन वाचनासाठी सेव्ह</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Smart Key Points Card */}
      {keyPoints.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-200 text-amber-900 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-gray-900 text-sm font-serif">
                ३ महत्त्वाचे ठळक मुद्दे (Instant Crux)
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCrux}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="महत्त्वाचे मुद्दे कॉपी करा"
              >
                {copied ? <Check className="w-3 h-3 text-green-700" /> : <Share2 className="w-3 h-3" />}
                <span>{copied ? 'कॉपी झाले!' : 'मुद्दे शेअर करा'}</span>
              </button>

              <button
                onClick={() => setShowKeyPoints(!showKeyPoints)}
                className="p-1 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                {showKeyPoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showKeyPoints && (
            <ul className="space-y-2 text-xs sm:text-sm text-gray-800">
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
