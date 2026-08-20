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
      <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ contain: 'paint layout' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px] lg:min-h-[550px]">
          {/* Main Feature Skeleton */}
          <div className="lg:col-span-8 relative rounded-xl bg-gray-200 overflow-hidden shadow-sm border border-gray-200 h-[450px] lg:h-[550px] animate-pulse">
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
          <div className="lg:col-span-4 flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-pulse min-h-[160px]">
                <div className="h-32 bg-gray-200 w-full" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="w-full h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-3" />
                  <div className="w-1/3 h-3 bg-gray-200 rounded" />
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
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Feature */}
        <Link to={`/article/${mainArticle.id}`} className="lg:col-span-8 relative group overflow-hidden rounded-xl bg-gray-950 shadow-sm border border-gray-800 cursor-pointer block">
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
              {mainArticle.category.name}
            </span>
            {mainArticle.aiGenerated && (
              <span className="bg-gray-950 text-amber-400 border border-amber-500 text-xs font-black px-3 py-1 rounded shadow-md flex items-center space-x-1">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Draft</span>
              </span>
            )}
          </div>
          <div className="relative h-[450px] lg:h-[550px] w-full overflow-hidden bg-gray-950">
            <Image 
              src={mainArticle.imageUrl}
              category={typeof mainArticle.category === 'string' ? mainArticle.category : mainArticle.category?.name}
              fallbackPrompt={(mainArticle as any).imagePrompt}
              alt={mainArticle.title}
              size="featured"
              priority={true}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/85 to-transparent" />
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
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3 group-hover:text-amber-400 transition-colors">
              {mainArticle.title}
            </h1>
            <p className="text-gray-100 text-sm lg:text-base line-clamp-2 mb-5 max-w-3xl font-medium">
              {mainArticle.summary}
            </p>
            
            <div className="flex flex-wrap items-center text-xs font-semibold gap-2">
              <div className="flex items-center space-x-2 bg-gray-950/95 text-white px-2.5 py-1 rounded-md border border-gray-800 shadow-sm">
                {mainArticle.authorAvatar && mainArticle.authorAvatar.trim() !== '' ? (
                  <img 
                    src={mainArticle.authorAvatar} 
                    alt={mainArticle.author} 
                    className="w-5 h-5 rounded-full border border-gray-400" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center ${mainArticle.authorAvatar && mainArticle.authorAvatar.trim() !== '' ? 'hidden' : ''}`}>
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-white font-bold">{mainArticle.author}</span>
              </div>
              
              <div className="flex items-center space-x-1.5 bg-gray-950/95 text-white px-2.5 py-1 rounded-md border border-gray-800 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-white font-semibold">Published {formatDistanceToNow(new Date(mainArticle.publishedAt), { addSuffix: true })}</span>
              </div>

              {mainArticle.lastUpdated && (
                <div className="flex items-center space-x-1.5 bg-amber-950/95 text-amber-200 px-2.5 py-1 rounded-md border border-amber-500/60 shadow-sm font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Updated {formatDistanceToNow(new Date(mainArticle.lastUpdated), { addSuffix: true })}</span>
                </div>
              )}

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
        <div className="lg:col-span-4 flex flex-col gap-6">
          {sideArticles.map((article) => (
            <Link to={`/article/${article.id}`} key={article.id} className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group cursor-pointer block hover:shadow-md transition-shadow">
              <div className="relative h-32 overflow-hidden">
                {isSuperAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, article.id)}
                    className="absolute top-2 right-2 z-30 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-colors cursor-pointer"
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
                <div className="absolute top-2 left-2 flex space-x-2">
                   <span className="bg-brand-red text-white text-[10px] font-black px-2.5 py-1 rounded shadow">
                    {article.category.name}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-brand-red transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h2>
                
                <div className="flex flex-col space-y-3 mt-auto">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-gray-800">
                    {article.authorAvatar && article.authorAvatar.trim() !== '' ? (
                      <img 
                        src={article.authorAvatar} 
                        alt={article.author} 
                        className="w-5 h-5 rounded-full" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center ${article.authorAvatar && article.authorAvatar.trim() !== '' ? 'hidden' : ''}`}>
                      <User className="w-3 h-3 text-gray-800" />
                    </div>
                    <span>{article.author}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <div className="flex items-center text-gray-900 text-xs font-bold space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-900" />
                      <span className="text-gray-900 font-bold">{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                    </div>
                    {article.aiGenerated && (
                      <div className="flex items-center space-x-1 text-amber-950 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded text-[11px] font-black">
                        <Bot className="w-3.5 h-3.5 text-amber-950" />
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
