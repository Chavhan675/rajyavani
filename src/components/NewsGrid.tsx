import React from "react";
import { Bot, Clock, MapPin, User, Tag, Trash2 } from "lucide-react";
import { NewsArticle } from "../types";
import { formatMarathiTime } from "../lib/formatTime";
import Image from "./Image";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

interface NewsGridProps {
  title: string;
  articles: NewsArticle[];
  loading?: boolean;
  skeletonCount?: number;
}

export default function NewsGrid({ title, articles, loading = false, skeletonCount = 4 }: NewsGridProps) {
  const { isSuperAdmin } = useAuth();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this news article?")) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        await deleteDoc(doc(db, "articles", id));
        window.location.reload();
      } catch (err) {
        alert("Error deleting article");
      }
    }
  };

  if (loading) {
    return (
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="flex items-center justify-between mb-6 border-b-2 border-brand-black pb-2">
            <h2 className="text-2xl font-extrabold text-brand-black relative">
              {title}
              <span className="absolute -bottom-[10px] left-0 w-12 h-1 bg-brand-red"></span>
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-pulse min-h-[380px]">
              <div className="h-48 bg-gray-200 w-full" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-1/3 h-3 bg-gray-200 rounded mb-4" />
                  <div className="w-full h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-5/6 h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-2/3 h-4 bg-gray-200 rounded mb-4" />
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ contain: 'layout style' }}>
      {title && (
        <div className="flex items-center justify-between mb-6 border-b-2 border-brand-black pb-2">
          <h2 className="text-2xl font-extrabold text-brand-black relative">
            {title}
            <span className="absolute -bottom-[10px] left-0 w-12 h-1 bg-brand-red"></span>
          </h2>
          <Link to={`/category/${encodeURIComponent(title.replace(' बातम्या', ''))}`} className="text-sm font-bold text-brand-red hover:underline transition-colors">
            सर्व पहा &raquo;
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map((article) => (
          <Link 
            to={`/article/${article.id}`} 
            key={article.id} 
            style={{ contain: 'layout paint' }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group cursor-pointer flex flex-col transition-all hover:shadow-md hover:-translate-y-1 block"
          >
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
                <span className="bg-brand-black text-white text-[11px] font-black px-2.5 py-1 rounded shadow">
                  {typeof article.category === 'string' ? article.category : (article.category?.name || 'विशेष')}
                </span>
              </div>
              {article.aiGenerated && (
                <div className="absolute top-3 right-3 bg-amber-200 text-amber-950 font-black text-[11px] px-2 py-0.5 rounded shadow-sm flex items-center space-x-1 border border-amber-400">
                  <Bot className="w-3.5 h-3.5 text-amber-950" />
                  <span>AI Draft</span>
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center space-x-2 mb-3 text-xs font-semibold text-gray-800">
                {article.authorAvatar && article.authorAvatar.trim() !== '' ? (
                  <img 
                    src={article.authorAvatar} 
                    alt={article.author} 
                    width={24}
                    height={24}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full border border-gray-100 object-cover" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center ${article.authorAvatar && article.authorAvatar.trim() !== '' ? 'hidden' : ''}`}>
                  <User className="w-3 h-3 text-gray-700" />
                </div>
                <span>{article.author}</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-brand-red transition-colors line-clamp-3 mb-3">
                {article.title}
              </h3>
              
              <div className="flex items-center space-x-2 mb-4">
                 {article.tags && article.tags.slice(0, 2).map(tag => (
                   <span key={tag} className="text-[10px] font-black text-gray-900 bg-gray-200 px-2.5 py-0.5 rounded flex items-center border border-gray-400 shadow-xs">
                     <Tag className="w-2.5 h-2.5 mr-1 text-gray-900" />
                     {tag}
                   </span>
                 ))}
              </div>
              
              <div className="mt-auto flex flex-col space-y-3">
                {article.location && article.location.district && (
                   <div className="flex items-center text-xs text-gray-800 font-bold">
                     <MapPin className="w-3.5 h-3.5 mr-1 text-brand-red" />
                     {article.location.district}
                   </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-900 font-bold pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-900" />
                    <span className="text-gray-900 font-bold">{formatMarathiTime(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-brand-red font-black">{article.views?.toLocaleString('mr-IN') || 0} views</span>
                    {isSuperAdmin && (
                      <button 
                        onClick={(e) => handleDelete(e, article.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors z-20 relative cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
