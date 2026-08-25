import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mockArticles, categories } from '../data';
import { NewsArticle } from '../types';
import { MAHARASHTRA_36_DISTRICTS } from '../services/trustedSources';
import { getTalukasForDistrict } from '../data/maharashtraDistricts';
import { 
  Archive, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Tag, 
  Clock, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  ArrowRight, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X,
  Home,
  ArrowLeft,
  Compass,
  Navigation
} from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import Image from '../components/Image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AdUnit from '../components/AdUnit';
import { articleCache } from '../lib/cacheStore';

const QUICK_CATEGORIES = [
  { label: 'सर्व बातम्या (All)', value: 'ALL' },
  { label: 'महाराष्ट्र', value: 'महाराष्ट्र' },
  { label: 'राजकारण', value: 'राजकारण' },
  { label: 'शेती व कृषी', value: 'शेती' },
  { label: 'गुन्हेगारी', value: 'गुन्हेगारी' },
  { label: 'शिक्षण व करिअर', value: 'शिक्षण' },
  { label: 'व्यापार व बाजार', value: 'व्यापार' },
  { label: 'क्रीडा', value: 'क्रीडा' },
  { label: 'मनोरंजन', value: 'मनोरंजन' },
  { label: 'तंत्रज्ञान', value: 'तंत्रज्ञान' },
  { label: 'आरोग्य', value: 'आरोग्य' },
  { label: 'हवामान व पाऊस', value: 'हवामान' },
  { label: 'मराठवाडा', value: 'मराठवाडा' },
  { label: 'विदर्भ', value: 'विदर्भ' },
  { label: 'उत्तर महाराष्ट्र', value: 'उत्तर महाराष्ट्र' },
  { label: 'कोकण', value: 'कोकण' },
];

export default function ArchivePage() {
  const { bookmarks, toggleBookmark } = useAuth();
  const { category: categoryParam, tag: tagParam, type: typeParam, name: nameParam } = useParams<{ category?: string; tag?: string; type?: string; name?: string }>();
  const [searchParams] = useSearchParams();

  // 0ms instant initialization from cache
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    const cachedArchive = articleCache.get<NewsArticle[]>('archive_articles');
    if (cachedArchive && cachedArchive.length > 0) return cachedArchive;
    const homeCached = articleCache.get<any[]>('homepage_articles');
    if (homeCached && homeCached.length > 0) return homeCached as any[];
    return [];
  });
  const [loading, setLoading] = useState(() => {
    return !articleCache.has('archive_articles') && !articleCache.has('homepage_articles');
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedTaluka, setSelectedTaluka] = useState('ALL');
  const [villageFilter, setVillageFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'POPULAR'>('NEWEST');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Sync state with URL params
  useEffect(() => {
    if (categoryParam) {
      const decoded = decodeURIComponent(categoryParam);
      setSelectedCategory(decoded);
    } else if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') || 'ALL');
    } else {
      setSelectedCategory('ALL');
    }

    if (tagParam) {
      const decoded = decodeURIComponent(tagParam);
      setSearchTerm(decoded);
    } else if (searchParams.get('q')) {
      setSearchTerm(searchParams.get('q') || '');
    }

    if (typeParam === 'district' && nameParam) {
      setSelectedDistrict(decodeURIComponent(nameParam));
    } else if (searchParams.get('district')) {
      setSelectedDistrict(searchParams.get('district') || 'ALL');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, tagParam, typeParam, nameParam, searchParams]);

  // Dynamic talukas for currently selected district
  const availableTalukas = useMemo(() => {
    if (selectedDistrict === 'ALL') return [];
    return getTalukasForDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // When district changes, reset taluka
  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    setSelectedTaluka('ALL');
  };

  // Load news articles from Firestore + fallback to mockArticles
  const fetchArchiveArticles = async () => {
    try {
      // 1. Try fast server endpoint first
      try {
        const res = await fetch('/api/articles?limit=50');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
            const mappedList: NewsArticle[] = data.articles.map((d: any) => ({
              id: d.id,
              title: d.title || '',
              summary: d.summary || '',
              content: d.content || '',
              imageUrl: d.imageUrl || '',
              category: d.category || { id: 'c1', name: 'महाराष्ट्र', slug: 'maharashtra' },
              location: d.location || { state: d.state || 'महाराष्ट्र', district: d.district || '' },
              publishedAt: d.publishedAt ? (typeof d.publishedAt === 'number' ? new Date(d.publishedAt).toISOString() : d.publishedAt) : new Date().toISOString(),
              author: d.authorName || d.author || 'राज्यवाणी ब्युरो',
              lastUpdated: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
              tags: d.tags || [],
              isBreaking: d.isBreaking || false,
              isTrending: d.isTrending || false,
              aiGenerated: d.aiGenerated !== false,
              views: d.views || 25,
              sourceName: d.sourceName || 'राज्यवाणी वृत्त संकलन',
              sourceUrl: d.sourceUrl,
              verificationStatus: d.verificationStatus || 'VERIFIED',
              verificationNotes: d.verificationNotes,
              state: d.state || 'महाराष्ट्र',
              district: d.district || ''
            }));
            setArticles(mappedList);
            articleCache.set('archive_articles', mappedList);
            mappedList.forEach(a => {
              if (a.id) articleCache.set(`article_${a.id}`, a);
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 2. Direct Firestore fallback
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), firestoreLimit(250));
      const snapshot = await getDocs(q);
      
      const firestoreList: NewsArticle[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        firestoreList.push({
          id: docSnap.id,
          title: d.title || '',
          summary: d.summary || '',
          content: d.content || '',
          imageUrl: d.imageUrl || '',
          category: d.category || { id: 'c1', name: 'महाराष्ट्र', slug: 'maharashtra' },
          location: d.location || { state: d.state || 'महाराष्ट्र', district: d.district || '' },
          publishedAt: d.publishedAt ? (typeof d.publishedAt === 'number' ? new Date(d.publishedAt).toISOString() : d.publishedAt) : new Date().toISOString(),
          author: d.authorName || d.author || 'राज्यवाणी ब्युरो',
          lastUpdated: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
          tags: d.tags || [],
          isBreaking: d.isBreaking || false,
          isTrending: d.isTrending || false,
          aiGenerated: d.aiGenerated !== false,
          views: d.views || 25,
          sourceName: d.sourceName || 'राज्यवाणी वृत्त संकलन',
          sourceUrl: d.sourceUrl,
          verificationStatus: d.verificationStatus || 'VERIFIED',
          verificationNotes: d.verificationNotes,
          state: d.state || 'महाराष्ट्र',
          district: d.district || ''
        });
      });

      if (firestoreList.length > 0) {
        setArticles(firestoreList);
        articleCache.set('archive_articles', firestoreList);
        firestoreList.forEach(a => {
          if (a.id) articleCache.set(`article_${a.id}`, a);
        });
      } else {
        setArticles(mockArticles);
      }
    } catch (err) {
      console.warn('Archive Firestore fetch notice, using local records:', err);
      if (articles.length === 0) setArticles(mockArticles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveArticles();
  }, []);

  // Robust matching helper for Marathi / English / Regional news
  const matchesCategoryOrRegion = (art: NewsArticle, targetCategory: string): boolean => {
    if (!targetCategory || targetCategory === 'ALL') return true;
    const target = targetCategory.trim().toLowerCase();
    const artCatName = (art.category?.name || '').trim().toLowerCase();
    const artCatSlug = (art.category?.slug || '').trim().toLowerCase();

    // 1. Direct match
    if (artCatName === target || artCatSlug === target) return true;

    // 2. Synonyms and English slugs mapping
    const categoryMap: Record<string, string[]> = {
      'महाराष्ट्र': ['महाराष्ट्र', 'maharashtra', 'राज्य', 'राज्यव्यापी'],
      'राजकारण': ['राजकारण', 'politics', 'political', 'निवडणूक', 'शासन', 'सरकार', 'मंत्रिमंडळ', 'विधानसभा', 'लोकसभा', 'महायुती', 'महाविकास आघाडी'],
      'शेती': ['शेती', 'कृषी', 'agriculture', 'farming', 'शेतकरी', 'पीक', 'खरीप', 'रब्बी', 'हवामान', 'बाजारभाव', 'कांदा', 'सोयाबीन', 'कापूस'],
      'गुन्हेगारी': ['गुन्हेगारी', 'crime', 'police', 'पोलीस', 'तपास', 'कारवाई', 'कोर्ट', 'सायबर', 'फसवणूक', 'गुन्हा', 'अटक'],
      'शिक्षण': ['शिक्षण', 'education', 'exam', 'neet', 'cet', 'शाळा', 'महाविद्यालय', 'प्रवेश', 'विद्यापीठ', 'विद्यार्थी', 'निकाल', 'भरती'],
      'व्यापार': ['व्यापार', 'business', 'economy', 'market', 'शेअर बाजार', 'उद्योग', 'अर्थकारण', 'rbi', 'सोने', 'बँक', 'गुंतवणूक'],
      'क्रीडा': ['क्रीडा', 'sports', 'cricket', 'football', 'खेळ', 'सामना', 'टीम इंडिया', 'ऑलिम्पिक', 'स्पर्धा', 'विश्वचषक'],
      'मनोरंजन': ['मनोरंजन', 'entertainment', 'cinema', 'bollywood', 'मराठी चित्रपट', 'सिनेमा', 'चित्रपट', 'मालिका', 'कलाकार', 'गाणी', 'ओटीटी'],
      'तंत्रज्ञान': ['तंत्रज्ञान', 'technology', 'tech', 'ai', 'स्मार्टफोन', 'डिजिटल', 'सायबर', 'गॅजेट्स', 'ॲप', 'इंटरनेट', 'सायन्स'],
      'आरोग्य': ['आरोग्य', 'health', 'medical', 'हॉस्पिटल', 'डॉक्टर', 'औषध', 'फिटनेस', 'आहार', 'आयुर्वेद', 'साथीचे आजार'],
      'हवामान': ['हवामान', 'weather', 'monsoon', 'पाऊस', 'तापमान', 'अलर्ट', 'imd', 'अतिवृष्टी', 'चक्रीवादळ', 'गारपीट'],
      'राष्ट्रीय': ['राष्ट्रीय', 'national', 'देश', 'भारत', 'नवी दिल्ली', 'पंतप्रधान', 'संसद'],
    };

    for (const [key, synonyms] of Object.entries(categoryMap)) {
      if (target === key.toLowerCase() || synonyms.includes(target)) {
        if (artCatName === key.toLowerCase() || synonyms.includes(artCatName) || synonyms.includes(artCatSlug)) {
          return true;
        }
        // Check in tags or title
        if ((art.tags || []).some(t => synonyms.some(s => t.toLowerCase().includes(s) || s.includes(t.toLowerCase())))) {
          return true;
        }
        if (synonyms.some(s => art.title.toLowerCase().includes(s) || art.summary.toLowerCase().includes(s))) {
          return true;
        }
      }
    }

    // 3. Regional divisions (मराठवाडा, विदर्भ, उत्तर महाराष्ट्र, कोकण, पश्चिम महाराष्ट्र)
    const divisionDistricts: Record<string, string[]> = {
      'मराठवाडा': ['छत्रपती संभाजीनगर', 'औरंगाबाद', 'जालना', 'बीड', 'परभणी', 'नांदेड', 'धाराशिव', 'उस्मानाबाद', 'लातूर', 'हिंगोली'],
      'विदर्भ': ['नागपूर', 'अमरावती', 'अकोला', 'यवतमाळ', 'बुलढाणा', 'वाशीम', 'वर्धा', 'चंद्रपूर', 'गडचिरोली', 'भंडारा', 'गोंदिया'],
      'उत्तर महाराष्ट्र': ['नाशिक', 'जळगाव', 'धुळे', 'नंदुरबार', 'अहिल्यानगर', 'अहमदनगर', 'खान्देश'],
      'कोकण': ['मुंबई शहर', 'मुंबई उपनगर', 'मुंबई', 'ठाणे', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग'],
      'पश्चिम महाराष्ट्र': ['पुणे', 'सातारा', 'सांगली', 'सोलापूर', 'कोल्हापूर', 'अहिल्यानगर']
    };

    for (const [divName, districtList] of Object.entries(divisionDistricts)) {
      if (target === divName.toLowerCase() || target.includes(divName.toLowerCase())) {
        const artDistrict = (art.district || art.location?.district || '').trim().toLowerCase();
        const artContent = `${art.title} ${art.summary} ${art.content} ${(art.tags || []).join(' ')}`.toLowerCase();
        
        const districtMatch = districtList.some(d => artDistrict.includes(d.toLowerCase()) || artContent.includes(d.toLowerCase()));
        if (districtMatch || artContent.includes(divName.toLowerCase())) {
          return true;
        }
      }
    }

    // 4. District direct match if target is a district name
    const artDistrict = (art.district || art.location?.district || '').trim().toLowerCase();
    if (artDistrict && (artDistrict.includes(target) || target.includes(artDistrict))) {
      return true;
    }

    // 5. Fallback in tags, title or summary
    if ((art.tags || []).some(t => t.toLowerCase().includes(target) || target.includes(t.toLowerCase()))) return true;
    if (art.title.toLowerCase().includes(target)) return true;
    if (art.summary.toLowerCase().includes(target)) return true;

    return false;
  };

  // Filtering & Sorting Logic
  const filteredArticles = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return articles.filter(art => {
      // Keyword search across headline, summary, content, tags, author, and location
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(query);
        const matchesSummary = art.summary.toLowerCase().includes(query);
        const matchesDistrict = (art.district || art.location.district || '').toLowerCase().includes(query);
        const matchesTaluka = (art.taluka || art.location.taluka || '').toLowerCase().includes(query);
        const matchesVillage = (art.village || art.location.village || '').toLowerCase().includes(query);
        const matchesCategory = (art.category?.name || '').toLowerCase().includes(query);
        const matchesTags = (art.tags || []).some(t => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesSummary && !matchesDistrict && !matchesTaluka && !matchesVillage && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // District Filter
      if (selectedDistrict !== 'ALL') {
        const artDistrict = (art.district || art.location.district || '').trim().toLowerCase();
        if (artDistrict !== selectedDistrict.trim().toLowerCase()) return false;
      }

      // Taluka Filter
      if (selectedTaluka !== 'ALL') {
        const artTaluka = (art.taluka || art.location.taluka || '').trim().toLowerCase();
        const artText = `${art.title} ${art.summary} ${art.content}`.toLowerCase();
        const targetTaluka = selectedTaluka.trim().toLowerCase();
        if (artTaluka !== targetTaluka && !artTaluka.includes(targetTaluka) && !artText.includes(targetTaluka)) {
          return false;
        }
      }

      // Village Filter
      if (villageFilter.trim()) {
        const targetVillage = villageFilter.trim().toLowerCase();
        const artVillage = (art.village || art.location.village || '').trim().toLowerCase();
        const artText = `${art.title} ${art.summary} ${art.content}`.toLowerCase();
        if (!artVillage.includes(targetVillage) && !artText.includes(targetVillage)) {
          return false;
        }
      }

      // Category & Region Filter
      if (selectedCategory !== 'ALL') {
        if (!matchesCategoryOrRegion(art, selectedCategory)) {
          return false;
        }
      }

      // State Filter
      if (selectedState !== 'ALL') {
        const artState = art.state || art.location.state || 'महाराष्ट्र';
        if (artState !== selectedState) return false;
      }

      // Date Filter
      const artTime = new Date(art.publishedAt).getTime();
      if (dateFilter === 'TODAY' && artTime < todayStart) return false;
      if (dateFilter === 'YESTERDAY' && (artTime < yesterdayStart || artTime >= todayStart)) return false;
      if (dateFilter === 'LAST_7_DAYS' && artTime < sevenDaysAgo) return false;
      if (dateFilter === 'THIS_MONTH' && artTime < monthStart) return false;
      if (dateFilter === 'CUSTOM') {
        if (customStartDate && artTime < new Date(customStartDate).getTime()) return false;
        if (customEndDate && artTime > new Date(customEndDate + 'T23:59:59').getTime()) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      if (sortBy === 'POPULAR') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
  }, [articles, searchTerm, selectedDistrict, selectedTaluka, villageFilter, selectedCategory, selectedState, dateFilter, customStartDate, customEndDate, sortBy]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedDistrict('ALL');
    setSelectedTaluka('ALL');
    setVillageFilter('');
    setSelectedCategory('ALL');
    setSelectedState('ALL');
    setDateFilter('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('NEWEST');
  };

  const hasActiveFilters = searchTerm !== '' || selectedDistrict !== 'ALL' || selectedTaluka !== 'ALL' || villageFilter !== '' || selectedCategory !== 'ALL' || selectedState !== 'ALL' || dateFilter !== 'ALL';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <SEO 
        title={`${selectedCategory !== 'ALL' ? `${selectedCategory} बातम्या | ` : ''}बातमी संग्रह (News Archive) | राज्यवाणी डिजिटल वृत्त`}
        description="महाराष्ट्रातील सर्व ३६ जिल्हे आणि भारतातील सर्व महत्त्वाच्या पडताळलेल्या बातम्यांचा कायमस्वरूपी ऐतिहासिक डेटाबेस."
        canonical="https://rajyavani.vercel.app/archive"
      />
      
      {/* Site Header */}
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation & Back to Home Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <Link
            to="/"
            id="archive-back-home-button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white hover:bg-red-700 font-bold text-sm rounded-xl shadow-xs hover:shadow transition-all group cursor-pointer"
            title="मुख्यपृष्ठावर परत जा"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <Home className="w-4 h-4" />
            <span>मुख्यपृष्ठावर जा (Go to Home Page)</span>
          </Link>

          <nav className="flex items-center space-x-2 text-xs font-bold text-gray-700" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-brand-red flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5 text-gray-700" />
              <span>मुख्यपृष्ठ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            <Link to="/archive" className="hover:text-brand-red transition-colors">बातमी संग्रह</Link>
            {selectedCategory !== 'ALL' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-brand-red font-black">{selectedCategory}</span>
              </>
            )}
          </nav>
        </div>

        {/* Page Hero & Heading */}
        <div className="bg-gradient-to-r from-red-900 via-brand-red to-orange-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Quick Home action button inside hero banner */}
          <div className="absolute top-5 sm:top-8 right-5 sm:right-8 z-20">
            <Link
              to="/"
              id="hero-archive-home-link"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/20 hover:bg-white text-white hover:text-gray-900 backdrop-blur-md rounded-xl text-xs sm:text-sm font-bold border border-white/30 transition-all shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">मुख्यपृष्ठ</span>
              <span>Home</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-amber-200 border border-white/20">
              <Archive className="w-3.5 h-3.5" />
              <span>{selectedCategory !== 'ALL' ? `विशेष वर्गवारी: ${selectedCategory}` : 'डिजिटल वृत्त इतिहास आणि शोध संग्रहालय'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white mb-3">
              {selectedCategory !== 'ALL' ? `${selectedCategory} बातम्या संग्रह` : 'राज्यवाणी बातमी संग्रह (News Archive)'}
            </h1>
            <p className="text-sm sm:text-base text-red-100 leading-relaxed max-w-2xl">
              {selectedCategory !== 'ALL'
                ? `महाराष्ट्र आणि देशातील '${selectedCategory}' संबंधित सर्व महत्त्वाच्या, ताज्या व पडताळलेल्या बातम्या येथे एकाच ठिकाणी उपलब्ध आहेत.`
                : 'महाराष्ट्रातील सर्व ३६ जिल्हे आणि भारतातील सर्व महत्त्वाच्या पडताळलेल्या बातम्यांचा कायमस्वरूपी ऐतिहासिक डेटाबेस. तारीख, जिल्हा, वर्गवारी किंवा कीवर्डनुसार जुन्या व ताज्या बातम्या शोधा.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-amber-100">
              <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>१००% पडताळणीकृत बातम्या</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>३६ जिल्हे कव्हरेज</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <Clock className="w-4 h-4 text-blue-300" />
                <span>दर ३ तासांनी स्वयंचलित संकलन</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Category Filtering Chips */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200">
          <div className="flex items-center gap-2 mb-2 text-xs font-black text-gray-900 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-brand-red" />
            <span>वर्गवारीनुसार थेट शोधा (Quick Category Explorer):</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_CATEGORIES.map((c) => {
              const isSelected = selectedCategory === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setSelectedCategory(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 min-h-[36px] flex items-center ${
                    isSelected
                      ? 'bg-brand-red text-white shadow-xs'
                      : 'bg-gray-100 text-gray-800 hover:bg-red-50 hover:text-brand-red'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Search Control Panel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
          
          {/* Top Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="कोणतीही बातमी, घटना, नेते, जिल्हा किंवा कीवर्ड शोधा..."
                className="w-full pl-12 pr-10 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red font-medium transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={fetchArchiveArticles}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="संग्रह रिफ्रेश करा"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-red' : ''}`} />
              <span>रिफ्रेश</span>
            </button>
          </div>

          {/* Detailed Dropdown Filters (District -> Taluka -> Village -> Category -> Date -> Sort) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-2 border-t border-gray-200">
            
            {/* 1. District Filter */}
            <div>
              <label htmlFor="archive-district-filter" className="block text-[11px] font-black text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-red" />
                <span>१. जिल्हा (District)</span>
              </label>
              <select
                id="archive-district-filter"
                name="district"
                aria-label="जिल्हा निवडा (Select District)"
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
              >
                <option value="ALL">सर्व ३६ जिल्हे (All Districts)</option>
                {MAHARASHTRA_36_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* 2. Taluka Filter (Dynamic based on selected district) */}
            <div>
              <label htmlFor="archive-taluka-filter" className="block text-[11px] font-black text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-600" />
                <span>२. तालुका (Taluka)</span>
              </label>
              <select
                id="archive-taluka-filter"
                name="taluka"
                aria-label="तालुका निवडा (Select Taluka)"
                value={selectedTaluka}
                onChange={(e) => setSelectedTaluka(e.target.value)}
                disabled={selectedDistrict === 'ALL' || availableTalukas.length === 0}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="ALL">
                  {selectedDistrict === 'ALL' 
                    ? 'आधी जिल्हा निवडा' 
                    : `सर्व तालुके (${availableTalukas.length})`}
                </option>
                {availableTalukas.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 3. Village / Local Area Input */}
            <div>
              <label htmlFor="archive-village-filter" className="block text-[11px] font-black text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>३. गाव / स्थानिक परिसर</span>
              </label>
              <div className="relative">
                <input
                  id="archive-village-filter"
                  name="village"
                  aria-label="गाव किंवा परिसर नाव शोधा (Search village or area)"
                  type="text"
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  placeholder="उदा. बारामती, उरुळी, लोणी..."
                  className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
                {villageFilter && (
                  <button
                    onClick={() => setVillageFilter('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 4. Category Filter */}
            <div>
              <label htmlFor="archive-category-filter" className="block text-[11px] font-black text-gray-900 uppercase tracking-wider mb-1">
                ४. वर्गवारी (Category)
              </label>
              <select
                id="archive-category-filter"
                name="category"
                aria-label="वर्गवारी निवडा (Select Category)"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
              >
                <option value="ALL">सर्व वर्गवारी (All Categories)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="राष्ट्रीय">राष्ट्रीय</option>
                <option value="प्रशासन">प्रशासन</option>
                <option value="शेती">शेती व ग्रामीण</option>
              </select>
            </div>

            {/* 5. Date Presets */}
            <div>
              <label htmlFor="archive-date-filter" className="block text-[11px] font-black text-gray-900 uppercase tracking-wider mb-1">
                ५. कालखंड (Date Range)
              </label>
              <select
                id="archive-date-filter"
                name="dateRange"
                aria-label="कालखंड निवडा (Select Date Range)"
                value={dateFilter}
                onChange={(e: any) => setDateFilter(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
              >
                <option value="ALL">सर्व काळ (All Time)</option>
                <option value="TODAY">आज (Today)</option>
                <option value="YESTERDAY">काल (Yesterday)</option>
                <option value="LAST_7_DAYS">गेले ७ दिवस (Last 7 Days)</option>
                <option value="THIS_MONTH">चालू महिना (This Month)</option>
                <option value="CUSTOM">कस्टम तारीख निवडा...</option>
              </select>
            </div>

            {/* 6. Sort Order */}
            <div>
              <label htmlFor="archive-sort-by" className="block text-[11px] font-black text-gray-900 uppercase tracking-wider mb-1">
                ६. क्रमवारी (Sort By)
              </label>
              <select
                id="archive-sort-by"
                name="sortBy"
                aria-label="क्रमवारी निवडा (Select Sort Order)"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
              >
                <option value="NEWEST">नवीनतम प्रथम (Newest First)</option>
                <option value="OLDEST">सर्वात जुनी प्रथम (Oldest First)</option>
                <option value="POPULAR">सर्वाधिक वाचलेल्या (Most Read)</option>
              </select>
            </div>
          </div>

          {/* Custom Date Picker row if 'CUSTOM' is selected */}
          {dateFilter === 'CUSTOM' && (
            <div className="flex flex-wrap items-center gap-3 pt-2 bg-red-50/50 p-3 rounded-xl border border-red-100 animate-in fade-in">
              <span className="text-xs font-bold text-brand-red flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> कस्टम कालावधी:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-800 font-bold">पासून:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="py-1 px-2.5 bg-white border border-gray-400 rounded-lg text-xs font-bold text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-800 font-bold">पर्यंत:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="py-1 px-2.5 bg-white border border-gray-400 rounded-lg text-xs font-bold text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Active Filter Badges & Results Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-gray-800 font-bold">
              <span>एकूण सापडलेल्या बातम्या: <strong className="text-brand-red text-sm font-black">{filteredArticles.length}</strong></span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs sm:text-sm text-red-700 hover:text-red-900 font-bold underline cursor-pointer ml-2 min-h-[44px] inline-flex items-center"
                >
                  सर्व फिल्टर्स रीसेट करा
                </button>
              )}
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-xl min-h-[44px]">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === 'GRID' ? 'bg-white text-brand-red shadow-xs font-black' : 'text-gray-800 hover:text-black'
                }`}
              >
                ग्रिड (Grid)
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === 'LIST' ? 'bg-white text-brand-red shadow-xs font-black' : 'text-gray-800 hover:text-black'
                }`}
              >
                यादी (List)
              </button>
            </div>
          </div>
        </div>

        {/* Top Ad Unit for Archive Page */}
        <div className="my-6 min-h-[110px]">
          <AdUnit 
            format="horizontal" 
            article={filteredArticles[0] || articles[0]} 
            title="संबंधित विशेष बातमी / Featured News"
            subtitle="वाचकांसाठी महत्त्वाची आणि ताजी घडामोड - सविस्तर बातमी वाचण्यासाठी येथे क्लिक करा"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-red animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-600">बातमी संग्रह लोड होत आहे...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredArticles.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-4">
            <Archive className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="text-lg font-bold text-gray-800">निवडलेल्या निकषांनुसार बातम्या सापडल्या नाहीत</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              कृपया तुमचा सर्च कीवर्ड किंवा जिल्हा बदलून पहा, किंवा 'सर्व फिल्टर्स रीसेट करा' बटणावर क्लिक करा.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-5 py-2.5 bg-brand-red hover:bg-brand-saffron text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              सर्व बातम्या दाखवा
            </button>
          </div>
        )}

        {/* Results Heading for Accessibility */}
        {!loading && filteredArticles.length > 0 && (
          <h2 className="sr-only">संग्रहित बातम्या निकाल यादी</h2>
        )}

        {/* Articles Grid Display */}
        {!loading && filteredArticles.length > 0 && viewMode === 'GRID' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const isSaved = bookmarks.includes(article.id);
              const districtName = article.district || article.location?.district || '';
              const talukaName = article.taluka || article.location?.taluka || '';
              const villageName = article.village || article.location?.village || '';
              const stateName = article.state || article.location?.state || 'महाराष्ट्र';
              const formattedDate = new Date(article.publishedAt).toLocaleDateString('mr-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Article Image & Badges */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      category={article.category.name}
                      size="card"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-red text-white shadow-sm">
                        {article.category.name}
                      </span>
                      {districtName && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-gray-800 shadow-sm backdrop-blur-sm">
                          📍 {districtName}
                        </span>
                      )}
                      {talukaName && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                          तालुका: {talukaName}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-green-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>पडताळणीकृत</span>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleBookmark(article.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-brand-red shadow-sm transition-all cursor-pointer"
                      title={isSaved ? 'सेव्ह काढून टाका' : 'बातमी सेव्ह करा'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-red text-brand-red' : ''}`} />
                    </button>
                  </div>

                  {/* Article Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      {/* Administrative hierarchy breadcrumb */}
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                        <span>{stateName}</span>
                        {districtName && <span>› <strong className="text-gray-900">{districtName}</strong></span>}
                        {talukaName && <span>› <strong className="text-amber-800">{talukaName}</strong></span>}
                        {villageName && <span>› <strong className="text-emerald-800">{villageName}</strong></span>}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-600" />
                          {formattedDate}
                        </span>
                        <span>{article.author || 'राज्यवाणी ब्युरो'}</span>
                      </div>

                      <Link 
                        to={`/article/${article.id}`}
                        onMouseEnter={() => {
                          articleCache.prefetchArticle(article.id);
                          if (article.imageUrl) articleCache.prefetchImage(article.imageUrl);
                        }}
                        onTouchStart={() => {
                          articleCache.prefetchArticle(article.id);
                        }}
                      >
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 hover:text-brand-red transition-colors leading-snug font-serif">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    {/* Footer / Read More */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-gray-600">
                        {article.sourceName ? `स्त्रोत: ${article.sourceName}` : 'अधिकृत वृत्त'}
                      </span>

                      <Link
                        to={`/article/${article.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:text-red-700 hover:underline transition-colors"
                      >
                        <span>संपूर्ण वाचा</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Articles List Display */}
        {!loading && filteredArticles.length > 0 && viewMode === 'LIST' && (
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
            {filteredArticles.map((article) => {
              const isSaved = bookmarks.includes(article.id);
              const districtName = article.district || article.location?.district || '';
              const talukaName = article.taluka || article.location?.taluka || '';
              const villageName = article.village || article.location?.village || '';
              const stateName = article.state || article.location?.state || 'महाराष्ट्र';
              const formattedDate = new Date(article.publishedAt).toLocaleDateString('mr-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div key={article.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-48 aspect-video sm:aspect-square sm:w-36 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image src={article.imageUrl} alt={article.title} category={article.category.name} size="card" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-brand-red/10 text-brand-red rounded-md text-[10px] font-bold uppercase">
                        {article.category.name}
                      </span>
                      <span className="text-xs font-bold text-gray-700">📍 {stateName} › {districtName}</span>
                      {talukaName && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          तालुका: {talukaName}
                        </span>
                      )}
                      {villageName && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          गाव: {villageName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-600 font-semibold">• {formattedDate}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-800 bg-green-50 px-2 py-0.5 rounded font-bold border border-green-200">
                        <CheckCircle2 className="w-3 h-3 text-green-700" /> पडताळणीकृत
                      </span>
                    </div>

                    <Link to={`/article/${article.id}`}>
                      <h3 className="text-base font-bold text-gray-900 hover:text-brand-red transition-colors font-serif">
                        {article.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-gray-600 font-semibold">
                        {article.sourceName ? `स्त्रोत: ${article.sourceName}` : 'राज्यवाणी ब्युरो'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-brand-red cursor-pointer"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-red text-brand-red' : ''}`} />
                        </button>
                        <Link
                          to={`/article/${article.id}`}
                          className="text-xs font-bold text-brand-red hover:underline flex items-center gap-0.5"
                        >
                          <span>वाचा</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Ad Unit */}
        <div className="my-8 min-h-[110px]">
          <AdUnit 
            format="horizontal" 
            article={filteredArticles[1] || filteredArticles[0] || articles[1]} 
            title="वाचकांसाठी विशेष घडामोडी व माहिती / Sponsored Story"
            subtitle="ताज्या घडामोडी, महत्त्वाच्या शासकीय योजना व वृत्त वाचण्यासाठी येथे क्लिक करा"
          />
        </div>

        {/* Bottom Back to Home Bar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-gray-900 text-sm">ताज्या आणि मुख्य बातम्या वाचायच्या आहेत?</h4>
            <p className="text-xs font-medium text-gray-700">राज्यवाणीच्या मुख्यपृष्ठावर २४/७ ताज्या घडामोडी थेट प्रसिद्ध होत असतात.</p>
          </div>
          <Link
            to="/"
            id="archive-bottom-home-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <Home className="w-4 h-4" />
            <span>मुख्यपृष्ठावर परत जा (Return to Home)</span>
          </Link>
        </div>

      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
