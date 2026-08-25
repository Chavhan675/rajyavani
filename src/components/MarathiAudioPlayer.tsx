import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Sparkles, FastForward, RotateCcw } from 'lucide-react';

interface MarathiAudioPlayerProps {
  title: string;
  summary?: string;
  content: string;
}

export default function MarathiAudioPlayer({ title, summary, content }: MarathiAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<any>(null);

  // Clean HTML to plain Marathi text for smooth speech
  const getCleanText = () => {
    const text = `${title}. ${summary || ''}. ${content}`
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for Marathi voice first, then Hindi, then Indian English
      const mrVoice = voices.find(v => v.lang.startsWith('mr') || v.name.toLowerCase().includes('marathi'));
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      const inVoice = voices.find(v => v.lang === 'en-IN');
      setSelectedVoice(mrVoice || hiVoice || inVoice || voices[0] || null);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    const textToRead = getCleanText();
    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = selectedVoice?.lang || 'mr-IN';

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(5);

      // Estimate progress
      const wordCount = textToRead.split(' ').length;
      const estimatedSeconds = Math.max(10, Math.round((wordCount / (130 * rate)) * 60));
      let elapsed = 0;
      progressTimerRef.current = setInterval(() => {
        elapsed += 1;
        const pct = Math.min(95, Math.round((elapsed / estimatedSeconds) * 100));
        setProgress(pct);
      }, 1000);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setTimeout(() => setProgress(0), 1500);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      setIsPlaying(false);
      setIsPaused(false);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  const handleSpeedChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying && utteranceRef.current) {
      // Re-trigger with new rate seamlessly
      handleStop();
      setTimeout(() => {
        setRate(newRate);
        handlePlay();
      }, 100);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-red-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Title & Visualizer */}
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs transition-transform ${
            isPlaying ? 'bg-brand-red text-white scale-105' : 'bg-red-100 text-brand-red'
          }`}>
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-gray-900 font-serif">
                मराठी ऑडिओ बातमी वाचक
              </h4>
              <span className="px-2 py-0.5 bg-brand-red text-white rounded-full text-[10px] font-bold">
                AI Voice
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {isPlaying 
                ? 'बातमीचे स्पष्ट मराठीत वाचन सुरू आहे...' 
                : isPaused 
                ? 'वाचन थांबवले आहे. पुन्हा सुरू करण्यासाठी प्ले दाबा.' 
                : 'संपूर्ण सविस्तर बातमी ऑडिओ स्वरूपात ऐका.'}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          
          {/* Speed Buttons */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-2xs mr-1 text-[11px] font-bold">
            {[1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  rate === s ? 'bg-brand-red text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Main Play / Pause Button */}
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isPaused ? 'पुढे सुरू करा' : 'बातमी ऐका'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>थांबवा (Pause)</span>
            </button>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors cursor-pointer"
              title="थांबवा (Stop)"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Sound Wave Animation */}
      {isPlaying && (
        <div className="mt-3 pt-3 border-t border-red-200/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-brand-red">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-red animate-ping"></span>
              <span>वाचन प्रगती</span>
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-red-200/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-red to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
