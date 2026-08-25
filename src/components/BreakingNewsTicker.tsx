import { Radio, Sparkles, ChevronRight, Volume2 } from "lucide-react";
import { NewsArticle } from "../types";
import { Link } from "react-router-dom";

interface TickerProps {
  articles: NewsArticle[];
}

export default function BreakingNewsTicker({ articles }: TickerProps) {
  const breakingList = articles.filter(a => a.isBreaking);
  const displayArticles = breakingList.length > 0 ? breakingList : articles.slice(0, 8);

  if (displayArticles.length === 0) return null;

  return (
    <div className="bg-slate-950 text-white px-3 sm:px-4 py-2 flex items-center shadow-inner min-h-[42px] border-b border-zinc-800" style={{ contain: 'layout paint' }}>
      {/* Breaking Tag */}
      <div className="flex items-center space-x-2 bg-gradient-to-r from-brand-red to-red-700 text-white px-3 py-1 rounded-lg mr-3 sm:mr-4 shrink-0 z-10 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        <Radio className="w-3.5 h-3.5" />
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider font-serif">
          ताजी बातमी (Live)
        </span>
      </div>
      
      {/* Marquee Ticker */}
      <div className="overflow-hidden whitespace-nowrap relative flex-1" style={{ contain: 'paint' }}>
        <div className="inline-block animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] [will-change:transform]">
          {displayArticles.map((article, i) => (
            <Link 
              to={`/article/${article.id}`} 
              key={`ticker-orig-${article.id}-${i}`} 
              className="inline-flex items-center mx-4 text-xs sm:text-sm font-semibold hover:text-amber-300 transition-colors"
            >
              <span className="text-brand-red mr-2 font-black">●</span>
              {article.category && (
                <span className="px-1.5 py-0.5 bg-zinc-800 text-amber-300 rounded text-[10px] font-bold mr-1.5">
                  {typeof article.category === 'object' ? (article.category as any).name : article.category}
                </span>
              )}
              <span>{article.title}</span>
            </Link>
          ))}
          {/* Duplicate for smooth continuous scrolling loop */}
          {displayArticles.map((article, i) => (
            <Link 
              to={`/article/${article.id}`} 
              key={`ticker-dup-${article.id}-${i}`} 
              className="inline-flex items-center mx-4 text-xs sm:text-sm font-semibold hover:text-amber-300 transition-colors"
            >
              <span className="text-brand-red mr-2 font-black">●</span>
              {article.category && (
                <span className="px-1.5 py-0.5 bg-zinc-800 text-amber-300 rounded text-[10px] font-bold mr-1.5">
                  {typeof article.category === 'object' ? (article.category as any).name : article.category}
                </span>
              )}
              <span>{article.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <Link 
        to="/archive" 
        className="hidden md:flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-white px-2 py-0.5 rounded transition-colors shrink-0 ml-2"
      >
        <span>सर्व ताज्या बातम्या</span>
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
