import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, limit, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import NewsGrid from '../components/NewsGrid';
import AdUnit from '../components/AdUnit';
import Image from '../components/Image';
import { 
  MAHARASHTRA_DISTRICTS, 
  getDistrictBySlug, 
  getDistrictByName, 
  DistrictInfo 
} from '../data/maharashtraDistricts';
import { mockArticles } from '../data';
import { 
  MapPin, 
  Globe, 
  Tv, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  Filter, 
  CheckCircle2, 
  Radio, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Compass,
  Navigation,
  Search,
  X,
  Building2,
  Home
} from 'lucide-react';

import { articleCache } from '../lib/cacheStore';

export default function DistrictPage() {
  const { slug, name } = useParams<{ slug?: string; name?: string }>();
  const navigate = useNavigate();

  const districtIdentifier = slug || name || '';
  const currentDistrict = getDistrictBySlug(districtIdentifier) || getDistrictByName(districtIdentifier) || MAHARASHTRA_DISTRICTS[0];

  // 0ms instant cache initialization
  const [articles, setArticles] = useState<any[]>(() => {
    return articleCache.get<any[]>(`district_${currentDistrict.slug}`) || [];
  });
  const [loading, setLoading] = useState(() => {
    return !articleCache.has(`district_${currentDistrict.slug}`);
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [activeDivision, setActiveDivision] = useState<string>('all');
  const [selectedTaluka, setSelectedTaluka] = useState<string>('ALL');
  const [villageSearch, setVillageSearch] = useState<string>('');

  const divisions = ['all', 'पश्चिम महाराष्ट्र', 'विदर्भ', 'मराठवाडा', 'उत्तर महाराष्ट्र', 'कोकण'];

  // Reset taluka when district changes
  useEffect(() => {
    setSelectedTaluka('ALL');
    setVillageSearch('');
    const cached = articleCache.get<any[]>(`district_${currentDistrict.slug}`);
    if (cached) {
      setArticles(cached);
      setLoading(false);
    }
  }, [currentDistrict.slug]);

  const fetchDistrictArticles = async () => {
    try {
      const targetAliases = currentDistrict.aliases;

      // 1. Try fast cached API endpoint first
      try {
        const res = await fetch(`/api/articles?district=${encodeURIComponent(currentDistrict.nameMarathi)}&limit=30`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
            const mapped = data.articles.map((item: any) => ({
              id: item.id,
              title: item.title,
              summary: item.summary,
              content: item.content,
              imageUrl: item.imageUrl || null,
              imagePrompt: item.imagePrompt,
              imageAlt: item.imageAlt || item.title,
              category: item.category || 'महाराष्ट्र',
              author: item.authorName || 'जिल्हा विशेष प्रतिनिधी',
              authorAvatar: item.authorAvatar,
              publishedAt: new Date(item.publishedAt || Date.now()).toISOString(),
              lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
              readTime: '4 min read',
              isBreaking: item.isDeveloping || false,
              aiGenerated: item.aiGenerated || false,
              location: {
                state: 'महाराष्ट्र',
                district: item.district || currentDistrict.nameMarathi,
                taluka: item.taluka || '',
                village: item.village || ''
              },
              tags: item.tags || []
            }));
            setArticles(mapped);
            articleCache.set(`district_${currentDistrict.slug}`, mapped);
            mapped.forEach(a => {
              if (a.id) articleCache.set(`article_${a.id}`, a);
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 2. Direct Firestore fallback
      const q = query(
        collection(db, 'articles'),
        where('status', '==', 'PUBLISHED')
      );

      const snapshot = await getDocs(q);
      const allDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Strict district filtering: only articles belonging to this district
      const matched = allDocs.filter((item: any) => {
        const itemDist = (item.district || '').trim().toLowerCase();
        const itemContent = `${item.title || ''} ${item.summary || ''} ${item.content || ''}`.toLowerCase();
        
        return targetAliases.some(alias => {
          const normAlias = alias.toLowerCase();
          return itemDist === normAlias || itemDist.includes(normAlias) || normAlias.includes(itemDist);
        });
      });

      // Map to frontend shape
      const mapped = matched.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        content: item.content,
        imageUrl: item.imageUrl || null,
        imagePrompt: item.imagePrompt,
        imageAlt: item.imageAlt || item.title,
        category: item.category || 'महाराष्ट्र',
        author: item.authorName || 'जिल्हा विशेष प्रतिनिधी',
        authorAvatar: item.authorAvatar,
        publishedAt: new Date(item.publishedAt || Date.now()).toISOString(),
        lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
        readTime: '4 min read',
        isBreaking: item.isDeveloping || false,
        aiGenerated: item.aiGenerated || false,
        location: {
          state: 'महाराष्ट्र',
          district: item.district || currentDistrict.nameMarathi,
          taluka: item.taluka || '',
          village: item.village || ''
        },
        tags: item.tags || []
      }));

      // Sort by date
      mapped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      // If Firestore has no articles for this district, check mock data matching this district
      if (mapped.length === 0) {
        const matchingMocks = mockArticles.filter(m => {
          const mDist = (m.location.district || '').toLowerCase();
          const mText = `${m.title} ${m.summary} ${m.content}`.toLowerCase();
          return targetAliases.some(alias => {
            const norm = alias.toLowerCase();
            return mDist.includes(norm) || mText.includes(norm);
          });
        });

        const formattedMocks = (matchingMocks.length > 0 ? matchingMocks : mockArticles.slice(0, 4)).map(m => ({
          ...m,
          category: typeof m.category === 'object' ? m.category.name : m.category,
          author: m.author,
          location: {
            ...m.location,
            district: currentDistrict.nameMarathi
          }
        }));
        setArticles(formattedMocks);
        articleCache.set(`district_${currentDistrict.slug}`, formattedMocks);
      } else {
        setArticles(mapped);
        articleCache.set(`district_${currentDistrict.slug}`, mapped);
        mapped.forEach(a => {
          if (a.id) articleCache.set(`article_${a.id}`, a);
        });
      }
    } catch (err) {
      console.error(err);
      if (articles.length === 0) {
        setArticles(mockArticles.slice(0, 4).map(m => ({
          ...m,
          category: typeof m.category === 'object' ? m.category.name : m.category,
          author: m.author,
          location: { ...m.location, district: currentDistrict.nameMarathi }
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictArticles();
  }, [currentDistrict.slug]);

  // On-demand generation for this specific district / taluka / village using verified sources
  const handleGenerateDistrictNews = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch('/api/district-news/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtSlug: currentDistrict.slug,
          districtName: currentDistrict.nameMarathi,
          taluka: selectedTaluka !== 'ALL' ? selectedTaluka : undefined,
          village: villageSearch.trim() || undefined,
          websiteSource: currentDistrict.website,
          newsPortals: currentDistrict.newsPortals || [],
          youtubeChannel: currentDistrict.youtubeChannel,
          division: currentDistrict.division
        })
      });

      const data = await res.json();
      if (data.success && data.article) {
        const newArticle: any = {
          title: data.article.headline,
          summary: data.article.summary,
          content: data.article.content,
          category: data.article.category || 'महाराष्ट्र',
          district: currentDistrict.nameMarathi,
          taluka: data.article.taluka || (selectedTaluka !== 'ALL' ? selectedTaluka : ''),
          village: data.article.village || villageSearch.trim(),
          tags: data.article.tags || [currentDistrict.nameMarathi, 'महाराष्ट्र', 'स्थानिक घडामोडी'],
          status: 'PUBLISHED',
          publishedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          authorName: `${currentDistrict.nameMarathi} विशेष वार्ताहर`,
          authorId: 'system-district-automator',
          imageUrl: data.article.imageUrl || null,
          imagePrompt: data.article.imagePrompt || '',
          imageAlt: data.article.imageAlt || data.article.headline,
          isDeveloping: !!data.article.isDeveloping,
          aiGenerated: true,
          views: 1
        };

        // Save to Firestore
        try {
          const docRef = await addDoc(collection(db, 'articles'), newArticle);
          newArticle.id = docRef.id;
        } catch (dbErr) {
          console.warn('Could not save to Firestore directly:', dbErr);
          newArticle.id = `temp-${Date.now()}`;
        }

        // Add to state and refetch
        await fetchDistrictArticles();
      } else {
        throw new Error(data.error || 'Failed to generate district news');
      }
    } catch (err: any) {
      console.error('District generation error:', err);
      setGenerateError(err.message || 'बातमी संकलित करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsGenerating(false);
    }
  };

  const otherDivisionDistricts = MAHARASHTRA_DISTRICTS.filter(
    d => d.division === currentDistrict.division && d.id !== currentDistrict.id
  );

  const filteredDistricts = activeDivision === 'all' 
    ? MAHARASHTRA_DISTRICTS 
    : MAHARASHTRA_DISTRICTS.filter(d => d.division === activeDivision);

  // Filter articles by selected Taluka and Village
  const displayedArticles = articles.filter(art => {
    if (selectedTaluka !== 'ALL') {
      const artTaluka = (art.taluka || art.location?.taluka || '').toLowerCase();
      const text = `${art.title} ${art.summary} ${art.content}`.toLowerCase();
      const target = selectedTaluka.toLowerCase();
      if (!artTaluka.includes(target) && !text.includes(target)) {
        return false;
      }
    }
    if (villageSearch.trim()) {
      const targetVillage = villageSearch.trim().toLowerCase();
      const artVillage = (art.village || art.location?.village || '').toLowerCase();
      const text = `${art.title} ${art.summary} ${art.content}`.toLowerCase();
      if (!artVillage.includes(targetVillage) && !text.includes(targetVillage)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/30">
      <SEO 
        title={`${currentDistrict.nameMarathi} जिल्हा ताज्या बातम्या | ${currentDistrict.nameEnglish} News`}
        description={`${currentDistrict.nameMarathi} जिल्ह्यातील ताज्या घडामोडी, स्थानिक राजकारण, शेती, प्रशासन आणि गुन्हेगारीच्या सविस्तर बातम्या. प्रमुख स्रोत: ${currentDistrict.website}.`}
        canonical={`https://rajyavani.vercel.app/district/${currentDistrict.slug}`}
      />
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-bold text-gray-700 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-red transition-colors">मुख्यपृष्ठ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
          <Link to="/category/महाराष्ट्र" className="hover:text-brand-red transition-colors">महाराष्ट्र</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
          <span className="text-gray-900 font-black">{currentDistrict.nameMarathi}</span>
        </nav>

        {/* District Hero Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 mb-8 relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <span className="px-3 py-1 bg-brand-red text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                जिल्हा क्रमांक #{currentDistrict.id}
              </span>
              <span className="px-3 py-1 bg-white/10 border border-white/20 text-amber-300 text-xs font-bold rounded-full">
                विभाग: {currentDistrict.division}
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                थेट जिल्हा कव्हरेज
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  {currentDistrict.nameMarathi}
                </h1>
                <p className="text-sm font-semibold text-gray-200 tracking-wide mb-3">
                  {currentDistrict.nameEnglish} • {currentDistrict.division} विभाग
                </p>
                {currentDistrict.description && (
                  <p className="text-gray-100 text-sm sm:text-base leading-relaxed">
                    {currentDistrict.description}
                  </p>
                )}
              </div>

              {/* Action Button: Generate / Fetch On-Demand */}
              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerateDistrictNews}
                  disabled={isGenerating}
                  className="px-6 py-3.5 bg-gradient-to-r from-brand-red to-brand-saffron hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      बातमी संकलित होत आहे...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {currentDistrict.nameMarathi}ची ताजी बातमी तयार करा
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* District Quick Metadata Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2 bg-brand-red/20 text-brand-saffron rounded-lg shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] uppercase font-bold text-gray-200 tracking-wider block">
                    प्रमुख प्रादेशिक वेब पोर्टल
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {currentDistrict.newsPortals && currentDistrict.newsPortals.length > 0 
                      ? currentDistrict.newsPortals.join(' | ') 
                      : currentDistrict.website}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2 bg-red-500/20 text-red-300 rounded-lg shrink-0">
                  <Tv className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] uppercase font-bold text-gray-200 tracking-wider block">
                    युट्यूब ब्रॉडकास्ट पार्टनर
                  </span>
                  <span className="text-sm font-bold text-white truncate block">
                    {currentDistrict.youtubeChannel}
                  </span>
                </div>
              </div>
            </div>

            {generateError && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-semibold rounded-lg">
                {generateError}
              </div>
            )}
          </div>
        </div>

        {/* Top Ad Unit */}
        <div className="mb-8 min-h-[120px]">
          <AdUnit format="horizontal" />
        </div>

        {/* District Switcher Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Filter className="w-4 h-4 text-brand-red" />
              <span>महाराष्ट्र ३६ जिल्हे थेट नेव्हिगेशन:</span>
            </div>

            {/* Division Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {divisions.map((div) => (
                <button
                  key={div}
                  onClick={() => setActiveDivision(div)}
                  className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeDivision === div
                      ? 'bg-brand-red text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {div === 'all' ? 'सर्व ३६ जिल्हे' : div}
                </button>
              ))}
            </div>
          </div>

          {/* District Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-gray-100">
            {filteredDistricts.map((d) => {
              const isSelected = d.slug === currentDistrict.slug;
              return (
                <Link
                  key={d.slug}
                  to={`/district/${d.slug}`}
                  className={`px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-center transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-brand-red text-white border-brand-red shadow-sm'
                      : 'bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-brand-red border-gray-200'
                  }`}
                >
                  <span className="truncate">{d.nameMarathi}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Taluka & Village Administrative Deep Coverage Bar */}
        <div className="bg-gradient-to-r from-amber-50/70 via-white to-red-50/50 rounded-2xl p-5 shadow-xs border border-amber-200/80 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-700 rounded-xl">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <span>तालुका व ग्रामीण परिसर शोध ({currentDistrict.nameMarathi} जिल्हा)</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    {currentDistrict.talukas?.length || 0} तालुके
                  </span>
                </h3>
                <p className="text-[11px] text-gray-600 font-medium">
                  केवळ जिल्हा मुख्यालयापुरते मर्यादित न राहता तालुका आणि गाव पातळीवरील पडताळणीकृत बातम्या.
                </p>
              </div>
            </div>

            {/* Village Search Input inside District */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={villageSearch}
                onChange={(e) => setVillageSearch(e.target.value)}
                placeholder="गाव / स्थानिक परिसर शोधा..."
                className="w-full pl-8 pr-7 py-2.5 min-h-[44px] bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {villageSearch && (
                <button
                  onClick={() => setVillageSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Taluka Quick Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTaluka('ALL')}
              className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTaluka === 'ALL'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
              }`}
            >
              सर्व तालुके
            </button>
            {(currentDistrict.talukas || []).map((talukaName) => (
              <button
                key={talukaName}
                onClick={() => setSelectedTaluka(talukaName)}
                className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTaluka === talukaName
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                {talukaName}
              </button>
            ))}
          </div>

          {/* Targeted Generation Trigger if Taluka or Village selected */}
          {(selectedTaluka !== 'ALL' || villageSearch.trim()) && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-amber-200 animate-in fade-in text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Navigation className="w-4 h-4 text-amber-600" />
                <span>
                  निवडलेले क्षेत्र: <strong>महाराष्ट्र › {currentDistrict.nameMarathi}</strong>
                  {selectedTaluka !== 'ALL' && <span> › <strong className="text-amber-700">{selectedTaluka} तालुका</strong></span>}
                  {villageSearch.trim() && <span> › <strong className="text-emerald-700">{villageSearch.trim()} गाव</strong></span>}
                </span>
              </div>
              <button
                onClick={handleGenerateDistrictNews}
                disabled={isGenerating}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:opacity-95 text-white font-black rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>संकलित होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>⚡ या तालुक्याची/गावाची सविस्तर बातमी मिळवा</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* News Stream for the Selected District */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-red inline-block"></span>
                {currentDistrict.nameMarathi} जिल्हा विशेष वृत्त
                {selectedTaluka !== 'ALL' && (
                  <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    तालुका: {selectedTaluka}
                  </span>
                )}
              </h2>
              <p className="text-xs font-medium text-gray-700 mt-0.5">
                {selectedTaluka !== 'ALL'
                  ? `${currentDistrict.nameMarathi} जिल्ह्यातील ${selectedTaluka} तालुका व स्थानिक परिसरातील पडताळणी केलेले सविस्तर वृत्त (१,०००+ शब्द)`
                  : `केवळ ${currentDistrict.nameMarathi} परिसरातील पडताळणी केलेले सविस्तर वृत्त (१,०००+ शब्द)`}
              </p>
            </div>
            <div className="text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-300 self-start sm:self-auto">
              📝 एकूण बातम्या: {displayedArticles.length}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
            </div>
          ) : displayedArticles.length > 0 ? (
            <NewsGrid 
              title="" 
              articles={displayedArticles} 
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-50 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {selectedTaluka !== 'ALL' ? `${selectedTaluka} तालुक्याची बातमी लवकरच उपलब्ध होईल` : `${currentDistrict.nameMarathi} जिल्ह्याची बातमी लवकरच उपलब्ध होईल`}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                आमची AI यंत्रणा {currentDistrict.website} आणि {currentDistrict.youtubeChannel} वरून या भागातील स्थानिक बातम्या संकलित करत आहे.
              </p>
              <button
                onClick={handleGenerateDistrictNews}
                disabled={isGenerating}
                className="px-6 py-3 bg-brand-red hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    बातमी संकलित होत आहे...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    ⚡ {selectedTaluka !== 'ALL' ? `${selectedTaluka} तालुक्यासाठी` : `${currentDistrict.nameMarathi}साठी`} बातमी आताच तयार करा
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* District Page Mid Feature Ad Unit */}
        <div className="my-8">
          <AdUnit 
            format="in-article"
            article={displayedArticles[0] || articles[0]}
            title={`${currentDistrict.nameMarathi} विशेष घडामोडी व बातमी`}
            subtitle="जिल्ह्यातील वाचकांसाठी शासकीय योजना, घडामोडी व सविस्तर वृत्त - वाचण्यासाठी येथे क्लिक करा"
          />
        </div>

        {/* Division Neighbors */}
        {otherDivisionDistricts.length > 0 && (
          <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" />
              {currentDistrict.division} विभागातील इतर जिल्हे
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherDivisionDistricts.map(other => (
                <Link
                  key={other.slug}
                  to={`/district/${other.slug}`}
                  className="p-4 rounded-xl border border-gray-100 hover:border-brand-red/30 hover:bg-red-50/40 transition-all group"
                >
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-red flex items-center justify-between mb-1">
                    {other.nameMarathi}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-[11px] font-medium text-gray-700">
                    वेब: {other.website}
                  </p>
                  <p className="text-[11px] font-medium text-gray-700">
                    युट्यूब: {other.youtubeChannel}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
