import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mockArticles } from '../data';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Image from '../components/Image';
import AdUnit from '../components/AdUnit';
import { getCategoryFallbackImage } from '../lib/defaultImages';
import { MapPin, Clock, User, Tag, Share2, AlertTriangle, Loader2, ChevronRight, Home, Sparkles, Newspaper, Bookmark, Trash2 } from 'lucide-react';
import BookmarkButton from '../components/BookmarkButton';
import FloatingShareButton from '../components/FloatingShareButton';
import { format } from 'date-fns';
import { useAuth } from '../lib/AuthContext';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      try {
        if (id) {
           await deleteDoc(doc(db, "articles", id));
           navigate("/");
        }
      } catch (err) {
        alert("Error deleting article");
      }
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!id) return;
        setLoading(true);
        setError('');

        // 1. Check local mock articles first if ID matches
        const mockMatch = mockArticles.find(m => m.id === id);
        if (mockMatch) {
          setArticle({
            ...mockMatch,
            category: typeof mockMatch.category === 'object' ? mockMatch.category.name : mockMatch.category,
            district: mockMatch.location?.district,
            taluka: mockMatch.location?.taluka,
            village: mockMatch.location?.village,
            authorName: mockMatch.author,
            isDeveloping: mockMatch.isBreaking,
            publishedAt: new Date(mockMatch.publishedAt).getTime(),
            updatedAt: mockMatch.lastUpdated ? new Date(mockMatch.lastUpdated).getTime() : undefined,
          });

          const related = mockArticles.filter(m => m.id !== id).slice(0, 3).map(m => ({
            ...m,
            category: typeof m.category === 'object' ? m.category.name : m.category,
            authorName: m.author,
            publishedAt: new Date(m.publishedAt).getTime(),
          }));
          setRelatedArticles(related);
          setLoading(false);
          return;
        }

        const docRef = doc(db, 'articles', id);
        
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().status === 'PUBLISHED') {
          const currentData: any = { id: docSnap.id, ...docSnap.data() };
          setArticle(currentData);

          // Fetch Related Articles in the same category
          try {
            const relatedQuery = query(
              collection(db, 'articles'),
              where('category', '==', currentData.category || 'महाराष्ट्र'),
              where('status', '==', 'PUBLISHED'),
              limit(4)
            );
            const relatedSnap = await getDocs(relatedQuery);
            const relatedList = relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(a => a.id !== docSnap.id)
              .slice(0, 3);
            setRelatedArticles(relatedList);
          } catch (rErr) {
            console.warn('Could not fetch related articles', rErr);
          }
        } else {
          setError('बातमी आढळली नाही किंवा अजून प्रसिद्ध झालेली नाही.');
        }
      } catch (err) {
        console.error(err);
        setError('बातमी लोड करण्यात अडचण आली.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-gray/50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-gray/50">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">बातमी आढळली नाही</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/" className="bg-brand-red text-white px-6 py-2 rounded-md font-bold hover:bg-brand-saffron transition-colors">
            मुख्यपृष्ठावर परत जा
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const articleUrl = `https://rajyavani.vercel.app/article/${article.id}`;
  const locationParts = [article.village, article.taluka, article.district, "महाराष्ट्र"].filter(Boolean);

  // Compute word count and reading time in Marathi
  const textContent = (article.content || '').replace(/<[^>]+>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const isShortArticle = wordCount < 600;

  const handleExpandArticle = async () => {
    if (isExpanding || !article) return;
    setIsExpanding(true);
    setExpandError(null);

    try {
      const res = await fetch('/api/expand-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          district: article.district,
        }),
      });

      const data = await res.json();
      if (data.success && data.article) {
        const updatedArticle = {
          ...article,
          title: data.article.headline || article.title,
          summary: data.article.summary || article.summary,
          content: data.article.content,
          tags: data.article.tags || article.tags,
          updatedAt: Date.now(),
        };
        setArticle(updatedArticle);

        // If it's stored in Firestore, update Firestore too
        if (article.id && !article.id.startsWith('news-')) {
          try {
            await updateDoc(doc(db, 'articles', article.id), {
              title: updatedArticle.title,
              summary: updatedArticle.summary,
              content: updatedArticle.content,
              tags: updatedArticle.tags,
              updatedAt: Date.now(),
            });
          } catch (dbErr) {
            console.warn('Could not update Firestore:', dbErr);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to expand');
      }
    } catch (err: any) {
      console.error('Expand failed:', err);
      setExpandError('सविस्तर माहिती तयार करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO 
        title={article.title} 
        description={article.summary} 
        image={article.imageUrl || getCategoryFallbackImage(article.category, article.title)}
        type="article"
        canonical={articleUrl}
        authorName={article.authorName || "राज्यवाणी संपादकीय मंडळ"}
        datePublished={new Date(article.publishedAt || article.createdAt || Date.now()).toISOString()}
        dateModified={article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date(article.publishedAt || article.createdAt || Date.now()).toISOString()}
        category={article.category || "महाराष्ट्र"}
      />
      <Header />
      
      {/* Top Ad Unit */}
      <div className="max-w-4xl mx-auto px-4 w-full py-4 border-b border-gray-100">
        <AdUnit format="horizontal" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-brand-red flex items-center"><Home className="w-4 h-4" /></Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/category/${encodeURIComponent(article.category)}`} className="hover:text-brand-red font-medium">{article.category}</Link>
          
          {article.district && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/location/district/${encodeURIComponent(article.district)}`} className="hover:text-brand-red font-medium">{article.district}</Link>
            </>
          )}
          {article.taluka && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/location/taluka/${encodeURIComponent(article.taluka)}`} className="hover:text-brand-red font-medium">{article.taluka}</Link>
            </>
          )}
          {article.village && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/location/village/${encodeURIComponent(article.village)}`} className="hover:text-brand-red font-medium">{article.village}</Link>
            </>
          )}
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-brand-red text-white text-xs font-bold uppercase rounded-md">
              {article.category || "विशेष बातमी"}
            </span>

            {article.isDeveloping && (
              <div className="inline-flex items-center px-3 py-1 bg-red-100 text-brand-red rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-brand-red mr-2"></span>
                थेट घडामोडी (Developing Story)
              </div>
            )}

            {locationParts.length > 0 && (
              <div className="inline-flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-brand-red mr-1" />
                {locationParts.join(', ')}
              </div>
            )}

            <div className="inline-flex items-center text-xs font-bold text-gray-700 bg-gray-50 border border-gray-300 px-2.5 py-1 rounded-md ml-auto">
              <Clock className="w-3.5 h-3.5 text-gray-700 mr-1" />
              वाचनाची वेळ: ~{readMinutes} मिनिटे ({wordCount} शब्द)
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            {article.title}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-900 mb-6 font-semibold leading-relaxed border-l-4 border-brand-saffron pl-4 bg-orange-50/60 py-2 rounded-r-lg">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center justify-between border-y border-gray-200 py-4 gap-4 bg-gray-50/80 px-4 rounded-lg">
            <Link to={`/author/${encodeURIComponent(article.authorId)}`} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-brand-red transition-colors flex items-center gap-1.5">
                  {article.authorName}
                  {article.aiGenerated && (
                    <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded font-bold flex items-center">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5 text-purple-700" /> राज्यवाणी AI Desk
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center text-xs text-gray-700 font-medium gap-x-4 gap-y-1 mt-1">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-gray-600" /> 
                    प्रसिद्धी: {format(new Date(article.publishedAt || article.createdAt), "dd MMMM yyyy, hh:mm a")}
                  </span>
                  {article.updatedAt && article.updatedAt > (article.publishedAt || article.createdAt) + 60000 && (
                    <span className="flex items-center text-amber-900 font-bold">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-800" /> 
                      शेवटचे अपडेट: {format(new Date(article.updatedAt), "dd MMMM yyyy, hh:mm a")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            
            {/* Social Share & Bookmark Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              {isSuperAdmin && (
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs font-semibold hover:bg-red-100 transition-colors shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
              <BookmarkButton articleId={article.id || id || ''} showText className="px-3 py-1.5 border border-gray-300 text-xs font-semibold shadow-sm" />
              <button 
                onClick={() => {
                  const text = `📢 *${article.title}*\n\n${article.summary ? `${article.summary.slice(0, 140)}...\n\n` : ''}🔗 *सविस्तर बातमी वाचण्यासाठी क्लिक करा:* 👇\n${articleUrl}\n\n📰 *राज्यवाणी (Rajyavani)*`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-md text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer"
                title="WhatsApp वर शेअर करा"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp वर शेअर करा
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="mb-8 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <Image 
            src={article.imageUrl} 
            category={article.category}
            fallbackPrompt={article.imagePrompt}
            alt={article.imageAlt || article.title}
            size="featured"
            priority={true}
            className="w-full h-auto max-h-[60vh] object-cover"
          />
          {article.imageAlt && (
            <figcaption className="p-3 text-center text-sm text-gray-700 font-medium bg-gray-50 border-t border-gray-100">
              {article.imageAlt} {article.aiGenerated && " (राज्यवाणी विशेष बातमी चित्र)"}
            </figcaption>
          )}
        </figure>

        {/* AI In-Depth News Expansion Banner */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-red-50 border border-orange-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-red/10 text-brand-red rounded-lg mt-0.5 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse text-brand-red" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {isShortArticle ? "या बातमीचे सविस्तर वृत्त (१,०००+ शब्द) उपलब्ध आहे" : "सविस्तर विश्लेषणात्मक आवृत्ती"}
                <span className={`text-xs px-2 py-0.5 rounded border ${isShortArticle ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'}`}>
                  📝 {wordCount} शब्द
                </span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {isShortArticle 
                  ? "ही बातमी सध्या प्राथमिक स्वरूपात आहे. संपूर्ण १४ मुद्द्यांचे सविस्तर वृत्त, पार्श्वभूमी, अधिकृत विधाने आणि आकडेवारी वाचण्यासाठी खाली क्लिक करा."
                  : "संपूर्ण घटनाक्रम, अधिकृत विधाने, वस्तुस्थिती आणि सविस्तर विश्लेषण समाविष्ट आहे."}
              </p>
              {expandError && (
                <p className="text-xs text-red-600 font-semibold mt-1">{expandError}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleExpandArticle}
            disabled={isExpanding}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-red to-brand-saffron text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExpanding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                सविस्तर माहिती तयार होत आहे...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {isShortArticle ? "⚡ सविस्तर बातमी वाचा (1000+ शब्द)" : "⚡ सविस्तर माहिती अद्ययावत करा"}
              </>
            )}
          </button>
        </div>

        {/* Article Editorial Body */}
        <article 
          className="article-editorial-content mb-8 text-gray-900" 
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />

        {/* Editorial Standards & Transparency Card */}
        <div className="my-8 p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>राज्यवाणी संपादकीय पडताळणी मानके (Editorial Standards)</span>
            </div>
            <Link 
              to="/editorial-policy" 
              className="text-brand-red font-semibold hover:underline"
            >
              संपादकीय धोरण वाचा →
            </Link>
          </div>

          <p className="leading-relaxed text-gray-600">
            ही बातमी राज्यवाणी संपादकीय मंडळाद्वारे अधिकृत शासकीय निवेदने, स्थानिक वार्ताहर आणि विश्वासार्ह स्रोतांच्या आधारे पडताळण्यात आली आहे. आमचा उद्देश वाचकांना वस्तुनिष्ठ, तथ्यपूर्ण आणि पक्षपातविरहित वृत्त देणे आहे.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-gray-500">
            <div className="flex items-center gap-4">
              <span>वार्ताहर/संपादक: <strong className="text-gray-800">{article.authorName}</strong></span>
              <span>•</span>
              <span>स्थान: <strong className="text-gray-800">{locationParts.join(', ')}</strong></span>
            </div>

            <Link
              to={`/contact?type=correction&article=${encodeURIComponent(article.title)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-brand-red text-gray-700 hover:text-brand-red rounded-lg font-bold transition-colors"
            >
              <span>⚠️ बातमीत चूक आढळली? दुरुस्ती सुचवा</span>
            </Link>
          </div>
        </div>

        {/* Tags Section */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-10 border-t border-gray-200 pt-6">
            <div className="flex items-center text-sm font-bold text-gray-700 mr-2">
              <Tag className="w-4 h-4 text-brand-red mr-1.5" />
              संबंधित विषय / टॅग्ज:
            </div>
            {article.tags.map((tag: string) => (
              <Link 
                key={tag} 
                to={`/tag/${encodeURIComponent(tag)}`} 
                className="bg-gray-100 hover:bg-brand-red hover:text-white text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="mb-12 border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-brand-red" />
                याच वर्गातील इतर महत्त्वाच्या बातम्या
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link 
                  key={rel.id} 
                  to={`/article/${rel.id}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-36 w-full overflow-hidden bg-gray-100 relative">
                    <Image 
                      src={rel.imageUrl} 
                      category={rel.category} 
                      alt={rel.title} 
                      size="card"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-red transition-colors line-clamp-2 mb-2">
                      {rel.title}
                    </h3>
                    <span className="text-xs font-bold text-gray-700 flex items-center mt-auto">
                      <Clock className="w-3 h-3 mr-1 text-gray-600" />
                      {format(new Date(rel.publishedAt || rel.createdAt || Date.now()), "dd MMM yyyy")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Ad Unit */}
        <div className="w-full py-4 my-8 border-y border-gray-100">
          <AdUnit format="horizontal" />
        </div>
      </main>

      {/* Persistent Floating Share Button (WhatsApp Deep Link & Clickable Full Image Card) */}
      <FloatingShareButton 
        title={article.title}
        url={articleUrl}
        summary={article.summary}
        imageUrl={article.imageUrl || getCategoryFallbackImage(article.category, article.title)}
        category={article.category}
        authorName={article.authorName}
        publishedDate={format(new Date(article.publishedAt || article.createdAt || Date.now()), "dd MMMM yyyy")}
      />

      <Footer />
    </div>
  );
}
