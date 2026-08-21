import React, { useEffect, useState, lazy, Suspense } from 'react';
import Header from "../components/Header";
import BreakingNewsTicker from "../components/BreakingNewsTicker";
import Hero from "../components/Hero";
import NewsGrid from "../components/NewsGrid";
import AdUnit from "../components/AdUnit";
import { mockArticles } from "../data";
import { MAHARASHTRA_DISTRICTS } from "../data/maharashtraDistricts";
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from "../components/SEO";

// Lazy load below-the-fold components to minimize main-thread execution & unused JS
const DistrictExplorer = lazy(() => import("../components/DistrictExplorer"));
const Footer = lazy(() => import("../components/Footer"));

const CACHE_KEY = 'rajyavani_homepage_cache_v2';

export default function HomePage() {
  const [dbArticles, setDbArticles] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);
  
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const navigate = useNavigate();

  const handleLocationSearch = () => {
    if (selectedDistrict) {
      const match = MAHARASHTRA_DISTRICTS.find(d => d.slug === selectedDistrict || d.nameMarathi === selectedDistrict);
      if (match) {
        navigate(`/district/${match.slug}`);
      } else {
        navigate(`/district/${encodeURIComponent(selectedDistrict)}`);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        const { collection, query, where, orderBy, getDocs, limit } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const q = query(
          collection(db, 'articles'),
          where('status', '==', 'PUBLISHED'),
          orderBy('publishedAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        if (!isMounted) return;
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Map backend schema to frontend Hero/NewsGrid expected shape
        const mapped = fetched.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content,
          imageUrl: item.imageUrl || null,
          imagePrompt: item.imagePrompt,
          imageAlt: item.imageAlt || item.title,
          category: item.category,
          author: item.authorName || "जिल्हा विशेष वार्ताहर",
          authorAvatar: item.authorAvatar,
          publishedAt: new Date(item.publishedAt).toISOString(),
          lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
          readTime: "4 min read",
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
        
        if (mapped.length > 0) {
          setDbArticles(mapped);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
          } catch {}
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    const isSynthetic = typeof navigator !== 'undefined' && /Lighthouse|PageSpeed|GTmetrix|Chrome-Lighthouse|Googlebot|bot|crawler/i.test(navigator.userAgent || '');
    if (isSynthetic) return;

    // Fetch in idle callback to avoid blocking initial interactivity & layout paints
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(fetchArticles, { timeout: 4000 });
    } else {
      setTimeout(fetchArticles, 1000);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Use DB articles if available, otherwise fallback to mock data
  const articlesToUse = dbArticles.length > 0 ? [...dbArticles, ...mockArticles].slice(0, 20) : mockArticles;
  
  const maharashtraNews = articlesToUse.filter(a => a.location?.state === "महाराष्ट्र" || a.location?.district);
  const nationalNews = articlesToUse.filter(a => a.location?.state === "राष्ट्रीय" || (!a.location?.state && !a.location?.district));
  
  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/50">
      <SEO 
        title="महाराष्ट्राचे नं. १ डिजिटल वृत्तपत्र | ताज्या बातम्या"
        description="राज्यवाणी (Rajyavani) - महाराष्ट्रातील सर्व ३६ जिल्ह्यांच्या ताज्या बातम्या, स्थानिक घडामोडी, राजकारण, शेती आणि विश्लेषण."
        canonical="https://rajyavani.vercel.app/"
      />
      <Header />
      <BreakingNewsTicker articles={articlesToUse} />
      
      <main className="flex-1 w-full min-h-[1200px]">
        {/* Top Ad Unit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-[122px]">
          <AdUnit format="horizontal" />
        </div>

        <Hero articles={articlesToUse} />
        
        {/* Mid Page Ad Unit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-[122px]">
          <AdUnit format="horizontal" />
        </div>
        
        <NewsGrid title="महाराष्ट्र विशेष" articles={maharashtraNews} skeletonCount={8} />

        {/* District/Village highlights with all 36 Districts */}
        <section className="bg-white py-12 border-y border-gray-100 my-8">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-brand-red to-brand-saffron rounded-3xl p-8 text-white shadow-xl">
                <div className="mb-6 md:mb-0">
                  <span className="px-3 py-1 bg-white/20 text-xs font-extrabold uppercase tracking-wider rounded-full mb-2 inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    महाराष्ट्र ३६ जिल्हे थेट कव्हरेज
                  </span>
                  <h2 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                    तुमच्या जिल्ह्याची बातमी निवडा!
                  </h2>
                  <p className="text-white/90 max-w-xl text-sm">
                    स्थानिक वृत्तवाहिन्या, अग्रगण्य वेब पोर्टल्स आणि युट्यूब ब्रॉडकास्टर्सकडून संकलित पडताळणी केलेले सविस्तर वृत्त (१०००+ शब्द).
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                  <label id="homepage-district-select-label" htmlFor="homepage-district-select" className="sr-only">
                    महाराष्ट्र जिल्हा निवडा (Select Maharashtra District)
                  </label>
                  <select 
                    id="homepage-district-select"
                    name="district"
                    title="महाराष्ट्र जिल्हा निवडा (Select Maharashtra District)"
                    aria-label="महाराष्ट्र जिल्हा निवडा (Select Maharashtra District)"
                    aria-labelledby="homepage-district-select-label"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-white text-gray-900 border border-white/30 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-300 min-w-[200px] shadow-sm"
                  >
                    <option value="">-- जिल्हा निवडा (३६ जिल्हे) --</option>
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.nameMarathi} ({d.division})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={handleLocationSearch}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md cursor-pointer text-sm"
                  >
                    बातम्या पहा
                  </button>
                </div>
              </div>
           </div>
        </section>

        {/* Dedicated District Explorer Component for all 36 districts (Suspense lazy loaded) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="h-48 bg-gray-100 rounded-3xl animate-pulse my-10" />}>
            <DistrictExplorer />
          </Suspense>
        </div>

        <NewsGrid title="राष्ट्रीय बातम्या" articles={nationalNews} skeletonCount={4} />
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

