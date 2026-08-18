import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  FileText, 
  Briefcase, 
  Compass, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw,
  HelpCircle,
  Award
} from 'lucide-react';
import { JobOpportunity, CareerChatMessage } from '../../types';

interface AiCareerAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusedJob?: JobOpportunity | null;
  initialPrompt?: string;
}

export const AiCareerAssistantModal: React.FC<AiCareerAssistantModalProps> = ({
  isOpen,
  onClose,
  focusedJob,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultSuggestions = focusedJob ? [
    `या ${focusedJob.title} पदासाठी निवड कशी होईल आणि काय अभ्यास करावा?`,
    `या पदासाठी परीक्षेचा सविस्तर अभ्यासक्रम व महत्त्वाची पुस्तके सांगा`,
    `मुलाखतीसाठी (Interview) महत्त्वाचे १० प्रश्न आणि उत्तरे द्या`,
    `या नोकरीसाठी माझा रिज्युमे (Resume) कसा सुधारावा?`
  ] : [
    "१२वीनंतर महाराष्ट्रात कोणत्या सरकारी व खाजगी नोकऱ्या उपलब्ध आहेत?",
    "पुण्यामध्ये IT / CSE फ्रेशर्ससाठी सॉफ्टवेअर नोकऱ्या दाखवा",
    "MPSC परीक्षेसाठी ६० दिवसांचे स्टडी टाईमटेबल तयार करा",
    "नांदेड व मराठवाड्यातील चालू भरती संधी कोणत्या?",
    "इंजिनिअरिंग व डिप्लोमा विद्यार्थ्यांसाठी स्टायपेंडसह इंटर्नशिप",
    "२०२६ मध्ये चांगल्या पगारासाठी कोणती AI व डिजिटल स्किल्स शिकावीत?"
  ];

  // Initialize greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: CareerChatMessage = {
        id: 'welcome-msg',
        role: 'assistant',
        content: focusedJob 
          ? `नमस्कार! मी **राज्यवाणी AI करिअर व अभ्यास मार्गदर्शक** आहे. 🎯\n\nतुम्ही **${focusedJob.title}** (${focusedJob.organization}) या भरतीबद्दल माहिती पाहत आहात.\n\nमी तुम्हाला या पदाचा अभ्यासक्रम, पुस्तकांची यादी, मुलाखतीची तयारी, अभ्यास नियोजन (Study Plan) किंवा पात्रता समजून घेण्यास मदत करू शकतो. खालीलपैकी कोणताही प्रश्न निवडा किंवा तुमचा स्वतःचा प्रश्न विचारा!`
          : `नमस्कार! मी **राज्यवाणी AI करिअर व अभ्यास मार्गदर्शक** आहे. 🎓\n\nमहाराष्ट्रभरातील सर्व ३६ जिल्ह्यांतील विद्यार्थी, फ्रेशर्स व नोकरी शोधणाऱ्यांसाठी मी खालील बाबतीत विनामूल्य मार्गदर्शन करतो:\n\n* **१०वी, १२वी, ITI, डिप्लोमा, पदवीधर** नोकऱ्यांची माहिती\n* **MPSC, पोलीस भरती, तलाठी, रेल्वे, बँकिंग** परीक्षांचा सविस्तर अभ्यासक्रम व ३०/६० दिवसांचा स्टडी प्लॅन\n* **पुणे, मुंबई, नागपूर, नाशिक** मधील IT / सॉफ्टवेअर / कोडिंग करिअर\n* **रिज्युमे रिव्ह्यू (Resume Check)** व **मुलाखतीचे प्रश्न (Interview Prep)**\n* **महाडीबीटी शिष्यवृत्ती** व मोफत कौशल्य प्रशिक्षण योजना\n\nतुम्हाला कशाबाबत मदत हवी आहे?`,
        timestamp: Date.now(),
        suggestions: defaultSuggestions
      };
      setMessages([initialGreeting]);

      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, focusedJob, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt.trim();
    if (!query || isLoading) return;

    const userMessage: CareerChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/career-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          history: messages.slice(-4),
          opportunityContext: focusedJob ? {
            title: focusedJob.title,
            organization: focusedJob.organization,
            qualificationsDisplay: focusedJob.qualificationsDisplay,
            salary: focusedJob.salary,
            district: focusedJob.district,
            officialLink: focusedJob.officialLink
          } : undefined
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      const assistantMessage: CareerChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        suggestions: data.suggestions || defaultSuggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("AI Career Error:", err);
      const errorMessage: CareerChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "माहिती मिळवताना त्रुटी आली आहे. कृपया इंटरनेट कनेक्शन तपासा किंवा काही सेकंदांनंतर पुन्हा प्रश्न विचारा.",
        timestamp: Date.now(),
        suggestions: defaultSuggestions
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col h-[90vh] max-h-[750px]"
        id="ai-career-modal"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  राज्यवाणी AI करिअर व परीक्षा मार्गदर्शक
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Gemini 3.7 AI
                </span>
              </div>
              <p className="text-xs text-indigo-200 line-clamp-1">
                {focusedJob ? `संधी: ${focusedJob.title}` : 'अभ्यास प्लॅन • मुलाखत तयारी • नोकरी शोध • मार्गदर्शन'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors shrink-0"
            id="close-career-ai-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/60 text-sm">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div 
                className={`rounded-2xl p-4 max-w-[88%] sm:max-w-[80%] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white shadow-sm rounded-tr-xs' 
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-sm rounded-tl-xs'
                }`}
              >
                {/* Content with simple formatted blocks */}
                <div className="whitespace-pre-wrap space-y-2 text-xs sm:text-sm">
                  {msg.content}
                </div>

                {/* Assistant Footer Actions: Copy button & suggestions */}
                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[10px]">राज्यवाणी अधिकृत AI सहाय्यक</span>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors"
                      title="माहिती कॉपी करा"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">कॉपी झाले!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>कॉपी करा</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-indigo-700 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>AI अभ्यास व करिअर मार्गदर्शक उत्तर तयार करत आहे, कृपया प्रतीक्षा करा...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Quick Chips */}
        {messages.length > 0 && messages[messages.length - 1].suggestions && (
          <div className="p-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 px-1">द्रुत प्रश्न:</span>
            {messages[messages.length - 1].suggestions?.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="shrink-0 bg-white hover:bg-indigo-50 text-indigo-900 hover:text-indigo-700 font-medium text-[11px] px-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-200 transition-colors shadow-2xs whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="उदा. १२ वी नंतरच्या नोकऱ्या, MPSC स्टडी प्लॅन, पुण्यात IT जॉब्स..."
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 outline-hidden transition-all text-slate-800 placeholder-slate-400"
              id="career-ai-input"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-colors shrink-0 shadow-xs flex items-center gap-1.5 text-xs sm:text-sm"
              id="career-ai-send-btn"
            >
              <span className="hidden sm:inline">विचारा</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
