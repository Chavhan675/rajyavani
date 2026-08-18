import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { X, Bookmark, Trash2, ArrowRight, BookOpen, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Image from './Image';

interface SavedArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  district?: string;
  imageUrl?: string;
  publishedAt?: number;
}

export default function BookmarksModal() {
  const { bookmarksModalOpen, setBookmarksModalOpen, bookmarks, toggleBookmark } = useAuth();
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookmarksModalOpen || bookmarks.length === 0) {
      setArticles([]);
      return;
    }

    const fetchBookmarkedArticles = async () => {
      setLoading(true);
      const fetched: SavedArticle[] = [];
      
      for (const id of bookmarks) {
        try {
          const docSnap = await getDoc(doc(db, 'articles', id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              title: data.title || 'शीर्षक उपलब्ध नाही',
              summary: data.summary || '',
              category: data.category || 'बातम्या',
              district: data.district || '',
              imageUrl: data.imageUrl || '',
              publishedAt: data.publishedAt || data.createdAt || 0
            });
          }
        } catch (e) {
          console.warn("Failed to fetch bookmarked article:", id, e);
        }
      }

      setArticles(fetched);
      setLoading(false);
    };

    fetchBookmarkedArticles();
  }, [bookmarksModalOpen, bookmarks]);

  if (!bookmarksModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-red to-brand-saffron p-5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide">जतन केलेल्या बातम्या (Bookmarks)</h3>
              <p className="text-xs text-white/80">तुमच्या आवडीच्या बातम्या नंतर वाचण्यासाठी येथे संग्रहित आहेत</p>
            </div>
          </div>

          <button
            onClick={() => setBookmarksModalOpen(false)}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-gray-100">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
              <p className="text-sm font-medium">बातम्या लोड होत आहेत...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400">
              <BookOpen className="w-12 h-12 mb-3 text-gray-300 stroke-1" />
              <p className="text-base font-bold text-gray-700">कोणतीही बातमी सेव्ह केलेली नाही</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                कोणतीही बातमी वाचताना त्यावरील बुकमार्क आयकॉनवर क्लिक करून तुम्ही ती येथे जतन करू शकता.
              </p>
            </div>
          ) : (
            articles.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                <div className="flex gap-3.5 flex-1 min-w-0">
                  <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                    <Image
                      src={item.imageUrl}
                      category={item.category}
                      alt={item.title}
                      size="thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.district && (
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {item.district}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/article/${item.id}`}
                      onClick={() => setBookmarksModalOpen(false)}
                      className="text-sm font-bold text-gray-900 group-hover:text-brand-red transition-colors line-clamp-2"
                    >
                      {item.title}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="काढून टाका (Remove)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/article/${item.id}`}
                    onClick={() => setBookmarksModalOpen(false)}
                    className="text-xs font-bold text-brand-red hover:underline flex items-center gap-0.5 mt-1"
                  >
                    <span>वाचा</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>एकूण {articles.length} जतन केलेल्या बातम्या</span>
          <button
            onClick={() => setBookmarksModalOpen(false)}
            className="font-bold text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            बंद करा
          </button>
        </div>

      </div>
    </div>
  );
}
