import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import NewsGrid from '../components/NewsGrid';
import AdUnit from '../components/AdUnit';
import { Loader2, Search, Filter, AlertCircle } from 'lucide-react';

export default function ArchivePage() {
  const { category, type, name, tag, authorId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Determine page context based on route params
  let pageTitle = "ताज्या बातम्या (Latest News)";
  let pageDesc = "राज्यावाणीवरील सर्व ताज्या बातम्यांचे संकलन.";
  
  if (category) {
    pageTitle = `${category} बातम्या`;
    pageDesc = `${category} विषयीच्या सर्व बातम्या आणि अपडेट्स.`;
  } else if (type && name) {
    const locType = type === 'district' ? 'जिल्हा' : type === 'taluka' ? 'तालुका' : 'गाव';
    pageTitle = `${name} ${locType} बातम्या`;
    pageDesc = `${name} परिसरातील स्थानिक घडामोडी.`;
  } else if (tag) {
    pageTitle = `#${tag} संबंधित बातम्या`;
    pageDesc = `${tag} विषयीच्या सर्व ताज्या घडामोडी.`;
  } else if (authorId) {
    pageTitle = `लेखकाच्या बातम्या`;
    pageDesc = `लेखकाने प्रकाशित केलेल्या बातम्या.`;
  } else if (searchQuery) {
    pageTitle = `"${searchQuery}" शोध परिणाम`;
    pageDesc = `"${searchQuery}" साठी शोधलेले निकाल.`;
  }

  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true);
      setError('');
      try {
        let q = query(
          collection(db, 'articles'),
          where('status', '==', 'PUBLISHED')
        );
        
        // Add filters based on route parameters
        if (category) {
          q = query(q, where('category', '==', category));
        } else if (type === 'district' && name) {
          q = query(q, where('district', '==', name));
        } else if (type === 'taluka' && name) {
          q = query(q, where('taluka', '==', name));
        } else if (type === 'village' && name) {
          q = query(q, where('village', '==', name));
        } else if (tag) {
          q = query(q, where('tags', 'array-contains', tag));
        } else if (authorId) {
          q = query(q, where('authorId', '==', authorId));
        }
        
        // Order by date (requires a composite index in Firestore if combined with 'where')
        // To keep it simple and robust, we'll fetch and sort if necessary, or just rely on orderBy if index exists
        // Note: Without explicit indexes, combining equality filters and orderBy works, but array-contains + orderBy might need an index.
        try {
            q = query(q, orderBy('publishedAt', 'desc'), limit(30));
        } catch (e) {
            // Fallback if index missing
        }

        const snapshot = await getDocs(q);
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Client-side search filtering (since Firestore lacks native full-text search)
        if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          fetched = fetched.filter((item: any) => 
            (item.title && item.title.toLowerCase().includes(lowerQ)) ||
            (item.summary && item.summary.toLowerCase().includes(lowerQ)) ||
            (item.content && item.content.toLowerCase().includes(lowerQ))
          );
        }

        // Map to frontend expected shape
        const mapped = fetched.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content,
          imageUrl: item.imageUrl || null,
          imagePrompt: item.imagePrompt,
          imageAlt: item.imageAlt || item.title,
          category: item.category,
          author: item.authorName || "Editor",
          authorAvatar: item.authorAvatar,
          publishedAt: new Date(item.publishedAt).toISOString(),
          lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
          readTime: "3 min read",
          isBreaking: item.isDeveloping || false,
          aiGenerated: item.aiGenerated || false,
          location: {
            state: (item.district || item.category === "महाराष्ट्र") ? "महाराष्ट्र" : "राष्ट्रीय",
            district: item.district,
            taluka: item.taluka,
            village: item.village
          },
          tags: item.tags || []
        }));

        setArticles(mapped);
      } catch (err) {
        console.error(err);
        setError('माहिती लोड करताना त्रुटी आली. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArchive();
  }, [category, type, name, tag, authorId, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/50">
      <SEO title={pageTitle} description={pageDesc} />
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{pageTitle}</h1>
            <p className="text-gray-600">{pageDesc}</p>
          </div>
          <div className="text-sm font-semibold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {articles.length} निकाल आढळले
          </div>
        </div>

        {/* Top Ad Unit */}
        <div className="w-full mb-8">
          <AdUnit format="horizontal" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand-red" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center justify-center flex-col gap-3">
            <AlertCircle className="w-8 h-8" />
            <p className="font-bold">{error}</p>
          </div>
        ) : articles.length > 0 ? (
          <NewsGrid title="" articles={articles} />
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">कोणत्याही बातम्या आढळल्या नाहीत</h2>
            <p className="text-gray-500 mb-6">तुम्ही शोधत असलेल्या निकषांशी जुळणारी कोणतीही बातमी सापडली नाही.</p>
            <Link to="/" className="inline-block bg-brand-red hover:bg-brand-saffron text-white font-bold py-3 px-6 rounded-md transition-colors">
              मुख्यपृष्ठावर परत जा
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
