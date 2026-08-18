import { Bot, Clock, MapPin, User, Tag } from "lucide-react";
import { NewsArticle } from "../types";
import { formatDistanceToNow } from "date-fns";
import Image from "./Image";
import { Link } from "react-router-dom";

interface NewsGridProps {
  title: string;
  articles: NewsArticle[];
}

export default function NewsGrid({ title, articles }: NewsGridProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {title && (
        <div className="flex items-center justify-between mb-6 border-b-2 border-brand-black pb-2">
          <h2 className="text-2xl font-extrabold text-brand-black relative">
            {title}
            <span className="absolute -bottom-[10px] left-0 w-12 h-1 bg-brand-red"></span>
          </h2>
          <Link to={`/category/${encodeURIComponent(title.replace(' बातम्या', ''))}`} className="text-sm font-semibold text-brand-red hover:text-brand-saffron transition-colors">
            सर्व पहा &raquo;
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map((article) => (
          <Link to={`/article/${article.id}`} key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer flex flex-col transition-all hover:shadow-md hover:-translate-y-1 block">
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <Image 
                src={article.imageUrl}
                category={typeof article.category === 'string' ? article.category : article.category?.name}
                fallbackPrompt={(article as any).imagePrompt}
                alt={article.title}
                size="card"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3 flex flex-col space-y-1">
                <span className="bg-brand-black/80 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-sm w-max">
                  {article.category.name || article.category}
                </span>
              </div>
              {article.aiGenerated && (
                <div className="absolute top-3 right-3 bg-brand-saffron text-brand-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center space-x-1 shadow-sm">
                  <Bot className="w-3 h-3" />
                  <span>AI Draft</span>
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center space-x-2 mb-3 text-xs font-medium text-gray-700">
                {article.authorAvatar && article.authorAvatar.trim() !== '' ? (
                  <img 
                    src={article.authorAvatar} 
                    alt={article.author} 
                    className="w-6 h-6 rounded-full border border-gray-100" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center ${article.authorAvatar && article.authorAvatar.trim() !== '' ? 'hidden' : ''}`}>
                  <User className="w-3 h-3 text-gray-500" />
                </div>
                <span>{article.author}</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-brand-red transition-colors line-clamp-3 mb-3">
                {article.title}
              </h3>
              
              <div className="flex items-center space-x-2 mb-4">
                 {article.tags && article.tags.slice(0, 2).map(tag => (
                   <span key={tag} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm flex items-center">
                     <Tag className="w-2.5 h-2.5 mr-1" />
                     {tag}
                   </span>
                 ))}
              </div>
              
              <div className="mt-auto flex flex-col space-y-3">
                {article.location && article.location.district && (
                   <div className="flex items-center text-xs text-gray-500 font-medium">
                     <MapPin className="w-3.5 h-3.5 mr-1 text-brand-red" />
                     {article.location.district}
                   </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-400 font-medium pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                  </div>
                  <span className="text-brand-red">{article.views?.toLocaleString('mr-IN') || 0} views</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
