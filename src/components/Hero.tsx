import React from "react";
import { Bot, Clock, MapPin, Tag, User, Trash2 } from "lucide-react";
import { NewsArticle } from "../types";
import { formatDistanceToNow } from "date-fns";
import Image from "./Image";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface HeroProps {
  articles: NewsArticle[];
  loading?: boolean;
}

export default function Hero({ articles, loading = false }: HeroProps) {
  const { isSuperAdmin } = useAuth();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this news article?")) {
      try {
        await deleteDoc(doc(db, "articles", id));
        window.location.reload();
      } catch (err) {
        alert("Error deleting article");
      }
    }
  };

  if (articles.length === 0) {
    return (
      <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ contain: 'layout paint' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[460px] lg:min-h-[550px]">
          {/* Main Feature Skeleton */}
          <div className="lg:col-span-8 relative rounded-xl bg-gray-200 overflow-hidden shadow-sm border border-gray-200 h-[460px] lg:h-[550px] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-800/40 to-transparent flex flex-col justify-end p-6">
              <div className="w-24 h-6 bg-gray-400/60 rounded mb-4" />
              <div className="w-3/4 h-8 bg-gray-300/80 rounded mb-3" />
              <div className="w-1/2 h-8 bg-gray-300/80 rounded mb-4" />
              <div className="w-full h-4 bg-gray-400/50 rounded mb-2" />
              <div className="w-2/3 h-4 bg-gray-400/50 rounded mb-4" />
              <div className="w-48 h-4 bg-gray-400/60 rounded" />
            </div>
          </div>

          {/* Side Articles Skeletons */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full lg:h-[550px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-row items-center p-3 gap-3 animate-pulse min-h-[160px]">
                <div className="w-28 sm:w-32 h-28 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 flex flex-col justify-between h-full py-1">
                  <div className="w-1/3 h-3 bg-gray-200 rounded mb-2" />
                  <div className="w-full h-4 bg-gray-200 rounded mb-1.5" />
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-1/2 h-3 bg-gray-200 rounded mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ contain: 'layout paint' }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[460px] lg:min-h-[550px]">
        
        {/* Main Feature */}
        <Link 
          to={`/article/${mainArticle.id}`} 
          className="lg:col-span-8 relative group overflow-hidden rounded-xl bg-gray-950 shadow-sm border border-gray-800 cursor-pointer block h-[460px] lg:h-[550px]"
        >
          {isSuperAdmin && (
            <button
              onClick={(e) => handleDelete(e, mainArticle.id)}
              className="absolute top-4 right-4 z-30 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer"
              title="Delete Article"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <div className="absolute top-4 left-4 z-20 flex space-x-2">
            <span className="bg-brand-red text-white text-xs font-black px-3 py-1 rounded shadow-md">
              {mainArticle.category?.name || (typeof mainArticle.category === 'string' ? mainArticle.category : 'विशेष')}
            </span>
            {mainArticle.aiGenerated && (
              <span className="bg-gray-950 text-amber-400 border border-amber-500 text-xs font-black px-3 py-1 rounded shadow-md flex items-center space-x-1">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Draft</span>
              </span>
            )}
          </div>
          <div className="relative h-full w-full overflow-hidden bg-gray-950">
            <Image 
              src={mainArticle.imageUrl}
              category={typeof mainArticle.category === 'string' ? mainArticle.category : mainArticle.category?.name}
              fallbackPrompt={(mainArticle as any).imagePrompt}
              alt={mainArticle.title}
              size="featured"
              priority={true}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-6 w-full z-10">
            <div className="flex items-center space-x-2 mb-3">
               {mainArticle.tags && mainArticle.tags.slice(0, 2).map(tag => (
                 <span key={tag} className="text-xs font-black uppercase tracking-wider text-white bg-gray-950 px-3 py-1 rounded shadow-md border border-gray-700 flex items-center">
                   <Tag className="w-3 h-3 mr-1 text-amber-400" />
                   {tag}
                 </span>
               ))}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
              {mainArticle.title}
            </h1>
            <p className="text-gray-100 text-xs sm:text-sm lg:text-base line-clamp-2 mb-4 max-w-3xl font-medium">
              {mainArticle.summary}
            </p>
            
            <div className="flex flex-wrap items-center text-xs font-semibold gap-2">
              <div className="flex items-center space-x-2 bg-gray-950/95 text-white px-2.5 py-1 rounded-md border border-gray-800 shadow-sm">
                {mainArticle.authorAvatar && mainArticle.authorAvatar.trim() !== '' ? (
                  <img 
                    src={mainArticle.authorAvatar} 
                    alt={mainArticle.author} 
                    width={20}
                    height={20}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full border border-gray-400 object-cover" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center ${mainArticle.authorAvatar && mainArticle.authorAvatar.trim() !== '' ? 'hidden' : ''}`}>
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-white font-bold">{mainArticle.author}</span>
              </div>
              
              <div className="flex items-center space-x-1.5 bg-gray-950/95 text-white px-2.5 py-1 rounded-md border border-gray-800 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-gray-200" />
                <span className="text-white font-semibold">Published {formatDistanceToNow(new Date(mainArticle.publishedAt), { addSuffix: true })}</span>
              </div>

              {mainArticle.location?.district && (
                <div className="flex items-center space-x-1.5 bg-gray-950/95 text-white px-2.5 py-1 rounded-md border border-gray-800 shadow-sm font-bold">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-white">{mainArticle.location.district}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Side Articles */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-full lg:h-[550px]">
          {sideArticles.map((article) => (
            <Link 
              to={`/article/${article.id}`} 
              key={article.id} 
              className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-row group cursor-pointer block hover:shadow-md transition-shadow p-3 gap-3 min-h-[160px]"
            >
              <div className="relative w-28 sm:w-32 h-full rounded-lg overflow-hidden shrink-0 bg-gray-100">
                {isSuperAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, article.id)}
                    className="absolute top-1 right-1 z-30 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition-colors cursor-pointer"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <Image 
                  src={article.imageUrl}
                  category={typeof article.category === 'string' ? article.category : article.category?.name}
                  fallbackPrompt={(article as any).imagePrompt}
                  alt={article.title}
                  size="card"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-1 left-1">
                   <span className="bg-brand-red text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    {article.category?.name || (typeof article.category === 'string' ? article.category : 'विशेष')}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                  {article.title}
                </h2>
                
                <div className="flex flex-col space-y-1.5 mt-auto pt-2">
                  <div className="flex items-center space-x-1.5 text-[11px] font-medium text-gray-700 truncate">
                    <User className="w-3 h-3 text-gray-500 shrink-0" />
                    <span className="truncate">{article.author}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold border-t border-gray-100 pt-1.5">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                    </div>
                    {article.aiGenerated && (
                      <span className="text-amber-800 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded text-[9px] font-black">
                        AI Draft
                      </span>
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
