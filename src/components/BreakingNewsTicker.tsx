import { Radio } from "lucide-react";
import { NewsArticle } from "../types";
import { Link } from "react-router-dom";

interface TickerProps {
  articles: NewsArticle[];
}

export default function BreakingNewsTicker({ articles }: TickerProps) {
  const breakingArticles = articles.filter(a => a.isBreaking);

  if (breakingArticles.length === 0) return null;

  return (
    <div className="bg-brand-black text-white px-4 py-2 flex items-center shadow-inner">
      <div className="flex items-center space-x-2 bg-brand-red px-3 py-1 rounded-sm mr-4 shrink-0 z-10">
        <Radio className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider">ब्रेकिंग न्यूज</span>
      </div>
      
      <div className="overflow-hidden whitespace-nowrap relative flex-1">
        <div className="inline-block animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
          {breakingArticles.map((article, i) => (
            <Link to={`/article/${article.id}`} key={article.id} className="mx-4 text-sm font-medium hover:text-brand-saffron transition-colors">
              <span className="text-brand-saffron mr-2">•</span>
              {article.title}
            </Link>
          ))}
          {/* Duplicate for seamless scrolling */}
          {breakingArticles.map((article, i) => (
            <Link to={`/article/${article.id}`} key={article.id + "-dup"} className="mx-4 text-sm font-medium hover:text-brand-saffron transition-colors">
              <span className="text-brand-saffron mr-2">•</span>
              {article.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
