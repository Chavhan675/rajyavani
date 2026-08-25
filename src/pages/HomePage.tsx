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
import { articleCache } from "../lib/cacheStore";

// Lazy load below-the-fold components to minimize main-thread execution & unused JS
const DistrictExplorer = lazy(() => import("../components/DistrictExplorer"));
const Footer = lazy(() => import("../components/Footer"));

const CACHE_KEY = 'rajyavani_homepage_cache_v2';

export default function HomePage() {
  const [dbArticles, setDbArticles] = useState<any[]>(() => {
    // 0ms instant load from memory cache or localStorage
    const mem = articleCache.get<any[]>('homepage_articles');
    if (mem && Array.isArray(mem) && mem.length > 0) return mem;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          articleCache.set('homepage_articles', parsed);
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
      const mapItem = (item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        content: item.content,
        imageUrl: item.imageUrl || null,
        imagePrompt: item.imagePrompt,
        imageAlt: item.imageAlt || item.title,
        category: item.category,
        author: item.authorName || (typeof item.author === 'string' ? item.author : "जिल्हा विशेष वार्ताहर"),
        authorAvatar: item.authorAvatar,
        publishedAt: typeof item.publishedAt === 'number' ? new Date(item.publishedAt).toISOString() : (item.publishedAt || new Date().toISOString()),
        lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString() : (item.lastUpdated || null),
        readTime: item.readTime || "4 min read",
        isBreaking: item.isBreaking || item.isDeveloping || false,
        aiGenerated: item.aiGenerated || false,
        location: item.location || {
          state: (item.district || item.category === "महाराष्ट्र") ? "महाराष्ट्र" : "राष्ट्रीय",
          district: item.district,
          taluka: item.taluka,
          village: item.village
        },
        tags: item.tags || []
      });

      // 1. Fast server endpoint first (takes <2ms from memory cache)
      try {
        const res = await fetch('/api/articles?limit=20');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.articles) && data.articles.length > 0) {
            const mapped = data.articles.map(mapItem);
            setDbArticles(mapped);
            articleCache.set('homepage_articles', mapped);
            mapped.forEach(a => {
              if (a.id) articleCache.set(`article_${a.id}`, a);
              if (a.imageUrl) articleCache.prefetchImage(a.imageUrl);
            });
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
            } catch {}
            return;
          }
        }
      } catch {}

      // 2. Direct Firestore fallback
      try {
        const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        
        const q = query(
          collection(db, "articles"),
          where("status", "==", "PUBLISHED"),
          orderBy("publishedAt", "desc"),
          limit(20)
        );

        const snapshot = await getDocs(q);
        if (!isMounted) return;

        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          const mapped = fetched.map(mapItem);
          if (mapped.length > 0) {
            setDbArticles(mapped);
            articleCache.set('homepage_articles', mapped);
            mapped.forEach(a => {
              if (a.id) articleCache.set(`article_${a.id}`, a);
              if (a.imageUrl) articleCache.prefetchImage(a.imageUrl);
            });
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
            } catch {}
          }
        }
      } catch {}
    };
    
    // Immediate background fetch with no artificial delays
    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  // Use DB articles if available, deduplicating against mockArticles by article id
  const articlesToUse = React.useMemo(() => {
    if (!dbArticles || dbArticles.length === 0) return mockArticles;
    const seen = new Set<string>();
    const combined: typeof mockArticles = [];
    for (const article of [...dbArticles, ...mockArticles]) {
      if (article?.id && !seen.has(article.id)) {
        seen.add(article.id);
        combined.push(article);
      }
    }
    return combined.slice(0, 20);
  }, [dbArticles]);
  
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
        <Hero articles={articlesToUse} />
        
        {/* Top Feature Ad Unit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[130px]">
          <AdUnit format="horizontal" />
        </div>
        
        <NewsGrid title="महाराष्ट्र विशेष" articles={maharashtraNews} skeletonCount={8} />

        {/* Mid-Page Sponsor Highlight Ad Unit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdUnit 
            format="in-article" 
            article={articlesToUse[2] || articlesToUse[0]}
            title="विशेष बातमी व घडामोडी / Trending Feature" 
            subtitle="महाराष्ट्रातील वाचकांसाठी खास घडामोडी, शासकीय योजना व वृत्त - सविस्तर वाचण्यासाठी क्लिक करा" 
          />
        </div>

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

        {/* Bottom Feature Ad Unit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdUnit 
            format="horizontal" 
            article={articlesToUse[3] || articlesToUse[1]}
            title="संबंधित विशेष वृत्त / Featured Story"
            subtitle="महाराष्ट्रातील वाचकांसाठी खास घडामोडी, महत्त्वाचे अपडेट्स व बातमी - वाचण्यासाठी क्लिक करा"
          />
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

