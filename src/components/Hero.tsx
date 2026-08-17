import { Bot, Clock, MapPin, Tag, User } from "lucide-react";
import { NewsArticle } from "../types";
import { formatDistanceToNow } from "date-fns";
import Image from "./Image";
import { Link } from "react-router-dom";

interface HeroProps {
  articles: NewsArticle[];
}

export default function Hero({ articles }: HeroProps) {
  if (articles.length === 0) return null;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Feature */}
        <Link to={`/article/${mainArticle.id}`} className="lg:col-span-8 relative group overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 cursor-pointer block">
          <div className="absolute top-4 left-4 z-20 flex space-x-2">
            <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-sm shadow-md">
              {mainArticle.category.name}
            </span>
            {mainArticle.aiGenerated && (
              <span className="bg-brand-black/80 backdrop-blur-sm text-brand-saffron text-xs font-bold px-3 py-1 rounded-sm shadow-md flex items-center space-x-1">
                <Bot className="w-3 h-3" />
                <span>AI Draft</span>
              </span>
            )}
          </div>
          <div className="relative h-[450px] lg:h-[550px] w-full overflow-hidden">
            <Image 
              src={mainArticle.imageUrl}
              category={typeof mainArticle.category === 'string' ? mainArticle.category : mainArticle.category?.name}
              fallbackPrompt={(mainArticle as any).imagePrompt}
              alt={mainArticle.title}
              size="featured"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex items-center space-x-2 mb-3">
               {mainArticle.tags && mainArticle.tags.slice(0, 2).map(tag => (
                 <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-white/20 px-2 py-0.5 rounded-sm backdrop-blur-sm border border-white/10 flex items-center">
                   <Tag className="w-2.5 h-2.5 mr-1" />
                   {tag}
                 </span>
               ))}
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3 group-hover:text-brand-saffron transition-colors">
              {mainArticle.title}
            </h1>
            <p className="text-gray-300 text-sm lg:text-base line-clamp-2 mb-5 max-w-3xl">
              {mainArticle.summary}
            </p>
            
            <div className="flex flex-wrap items-center text-gray-300 text-xs font-medium gap-y-2 gap-x-5">
              <div className="flex items-center space-x-2">
                {mainArticle.authorAvatar ? (
                  <img 
                    src={mainArticle.authorAvatar} 
                    alt={mainArticle.author} 
                    className="w-6 h-6 rounded-full border border-gray-500" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center ${mainArticle.authorAvatar ? 'hidden' : ''}`}>
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-white">{mainArticle.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Published {formatDistanceToNow(new Date(mainArticle.publishedAt), { addSuffix: true })}</span>
              </div>
              {mainArticle.lastUpdated && (
                <div className="flex items-center space-x-1 text-brand-saffron">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDistanceToNow(new Date(mainArticle.lastUpdated), { addSuffix: true })}</span>
                </div>
              )}
              {mainArticle.location.district && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{mainArticle.location.district}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Side Articles */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {sideArticles.map((article) => (
            <Link to={`/article/${article.id}`} key={article.id} className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer block hover:shadow-md transition-shadow">
              <div className="relative h-32 overflow-hidden">
                <Image 
                  src={article.imageUrl}
                  category={typeof article.category === 'string' ? article.category : article.category?.name}
                  fallbackPrompt={(article as any).imagePrompt}
                  alt={article.title}
                  size="card"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 flex space-x-2">
                   <span className="bg-brand-red/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    {article.category.name}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-brand-red transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
                
                <div className="flex flex-col space-y-3 mt-auto">
                  <div className="flex items-center space-x-2 text-xs font-medium text-gray-600">
                    {article.authorAvatar ? (
                      <img 
                        src={article.authorAvatar} 
                        alt={article.author} 
                        className="w-5 h-5 rounded-full" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center ${article.authorAvatar ? 'hidden' : ''}`}>
                      <User className="w-3 h-3" />
                    </div>
                    <span>{article.author}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <div className="flex items-center text-gray-400 text-[11px] space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                    </div>
                    {article.aiGenerated && (
                      <div className="flex items-center space-x-1 text-brand-saffron text-[10px] font-bold">
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI Draft</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
