import React, { useEffect, useState } from 'react';
import Header from "../components/Header";
import BreakingNewsTicker from "../components/BreakingNewsTicker";
import Hero from "../components/Hero";
import NewsGrid from "../components/NewsGrid";
import Footer from "../components/Footer";
import AdUnit from "../components/AdUnit";
import DistrictExplorer from "../components/DistrictExplorer";
import { mockArticles } from "../data";
import { MAHARASHTRA_DISTRICTS } from "../data/maharashtraDistricts";
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import SEO from "../components/SEO";

export default function HomePage() {
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, 'articles'),
          where('status', '==', 'PUBLISHED'),
          orderBy('publishedAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
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
        
        setDbArticles(mapped);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  // Use DB articles if available, otherwise fallback to mock data
  const articlesToUse = dbArticles.length > 0 ? [...dbArticles, ...mockArticles].slice(0, 20) : mockArticles;
  
  const maharashtraNews = articlesToUse.filter(a => a.location.state === "महाराष्ट्र" || a.location.district);
  const nationalNews = articlesToUse.filter(a => a.location.state === "राष्ट्रीय" || (!a.location.state && !a.location.district));
  
  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/50">
      <SEO 
        title="ताज्या बातम्या, महाराष्ट्र आणि देश"
        description="राज्यवाणी (Rajyavani) - महाराष्ट्रातील प्रत्येक ३६ जिल्ह्यांच्या ताज्या बातम्या, स्थानिक वृत्तवाहिन्या आणि डिजिटल पोर्टलवरून पडताळलेले सविस्तर वृत्त."
        canonical="https://rajyavani.com/"
      />
      <Header />
      <BreakingNewsTicker articles={articlesToUse} />
      
      <main className="flex-1 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
          </div>
        ) : (
          <>
            {/* Top Ad Unit */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <AdUnit format="horizontal" />
            </div>

            <Hero articles={articlesToUse} />
            
            {/* Mid Page Ad Unit */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <AdUnit format="horizontal" />
            </div>
            
            <NewsGrid title="महाराष्ट्र विशेष" articles={maharashtraNews} />
            
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
                      <select 
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

            {/* Dedicated District Explorer Component for all 36 districts */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <DistrictExplorer />
            </div>

            <NewsGrid title="राष्ट्रीय बातम्या" articles={nationalNews} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

