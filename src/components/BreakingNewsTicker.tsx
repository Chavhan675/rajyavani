import { Radio } from "lucide-react";
import { NewsArticle } from "../types";
import { Link } from "react-router-dom";

interface TickerProps {
  articles: NewsArticle[];
}

export default function BreakingNewsTicker({ articles }: TickerProps) {
  const breakingList = articles.filter(a => a.isBreaking);
  const displayArticles = breakingList.length > 0 ? breakingList : articles.slice(0, 5);

  if (displayArticles.length === 0) return null;

  return (
    <div className="bg-brand-black text-white px-4 py-2 flex items-center shadow-inner min-h-[40px]">
      <div className="flex items-center space-x-2 bg-brand-red px-3 py-1 rounded mr-4 shrink-0 z-10">
        <Radio className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider">ब्रेकिंग न्यूज</span>
      </div>
      
      <div className="overflow-hidden whitespace-nowrap relative flex-1">
        <div className="inline-block animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
          {displayArticles.map((article, i) => (
            <Link to={`/article/${article.id}`} key={`ticker-orig-${article.id}-${i}`} className="mx-4 text-sm font-medium hover:text-amber-300 transition-colors">
              <span className="text-amber-400 mr-2">•</span>
              {article.title}
            </Link>
          ))}
          {/* Duplicate for seamless scrolling */}
          {displayArticles.map((article, i) => (
            <Link to={`/article/${article.id}`} key={`ticker-dup-${article.id}-${i}`} className="mx-4 text-sm font-medium hover:text-amber-300 transition-colors">
              <span className="text-amber-400 mr-2">•</span>
              {article.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
