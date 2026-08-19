import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import { Bot, AlertTriangle, Save, Loader2, CheckCircle2, Lock, LogIn, LogOut, Plus, Trash2, Newspaper, Users, ShieldAlert, Settings, Sparkles, RefreshCw, Zap, Home } from "lucide-react";
import { useAuth } from '../lib/AuthContext';
import { collection, addDoc, serverTimestamp, getDocs, getDoc, query, orderBy, limit, doc, writeBatch, where, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getCategoryFallbackImage } from '../lib/defaultImages';

import SEO from "../components/SEO";
import Image from "../components/Image";
import UserManagementTab from '../components/admin/UserManagementTab';
import AuditLogsTab from '../components/admin/AuditLogsTab';
import SiteSettingsTab from '../components/admin/SiteSettingsTab';
import ArticlesManagementTab from '../components/admin/ArticlesManagementTab';
import AutomatedCollectorDashboard from '../components/admin/AutomatedCollectorDashboard';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, userRole, isSuperAdmin, loading, setAuthModalOpen, setAuthModalTab, openAuthModal, signOut, getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'collector' | 'ai-desk' | 'articles' | 'users' | 'audit' | 'settings'>('collector');
  const [rawFacts, setRawFacts] = useState("");
  const [sources, setSources] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [isUpgradingShortArticles, setIsUpgradingShortArticles] = useState(false);
  const [upgradeProgressMessage, setUpgradeProgressMessage] = useState<string | null>(null);

  const [automatorSources, setAutomatorSources] = useState<any[]>([]);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");

  const handleUpgradeShortArticles = async () => {
    if (isUpgradingShortArticles) return;
    setIsUpgradingShortArticles(true);
    setUpgradeProgressMessage("डेटाबेसमधील लहान बातम्या तपासत आहे...");

    try {
      const snap = await getDocs(query(
        collection(db, 'articles'),
        where('status', '==', 'PUBLISHED'),
        orderBy('publishedAt', 'desc'),
        limit(20)
      ));

      const shortDocs: any[] = [];
      snap.docs.forEach(docSnap => {
        const data = docSnap.data();
        const textContent = (data.content || '').replace(/<[^>]+>/g, ' ');
        const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 600) {
          shortDocs.push({ id: docSnap.id, ...data, wordCount });
        }
      });

      if (shortDocs.length === 0) {
        setUpgradeProgressMessage("सर्व बातम्या आधीच १०००+ शब्दांपेक्षा मोठ्या आहेत!");
        setTimeout(() => setUpgradeProgressMessage(null), 4000);
        return;
      }

      setUpgradeProgressMessage(`एकूण ${shortDocs.length} लहान बातम्या आढळल्या. प्रत्येकाचा १०००+ शब्दांत विस्तार सुरू आहे...`);

      let completed = 0;
      for (const item of shortDocs) {
        try {
          setUpgradeProgressMessage(`(${completed + 1}/${shortDocs.length}) "${item.title.substring(0, 30)}..." चे सविस्तर वृत्तात रूपांतर होत आहे...`);
          
          const res = await fetch('/api/expand-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: item.title,
              summary: item.summary,
              content: item.content,
              category: item.category,
              district: item.district,
            }),
          });

          const resData = await res.json();
          if (resData.success && resData.article) {
            const articleRef = doc(db, 'articles', item.id);
            await updateDoc(articleRef, {
              title: resData.article.headline || item.title,
              summary: resData.article.summary || item.summary,
              content: resData.article.content,
              tags: resData.article.tags || item.tags || [],
              updatedAt: Date.now(),
            });
            completed++;
          }
        } catch (itemErr) {
          console.error("Failed expanding article:", item.id, itemErr);
        }
      }

      setUpgradeProgressMessage(`✅ यश! एकूण ${completed} बातम्यांचा १०००+ शब्दांत यशस्वी विस्तार झाला.`);
      setTimeout(() => setUpgradeProgressMessage(null), 6000);
    } catch (err: any) {
      console.error("Bulk upgrade failed:", err);
      setUpgradeProgressMessage(`त्रुटी: ${err.message || 'विस्तार अयशस्वी'}`);
    } finally {
      setIsUpgradingShortArticles(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      const unsubscribe = onSnapshot(collection(db, 'sources'), (snapshot) => {
        const sourceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAutomatorSources(sourceData);
      });
      return () => unsubscribe();
    }
  }, [isSuperAdmin]);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName || !newSourceUrl) return;
    try {
      await addDoc(collection(db, 'sources'), {
        name: newSourceName,
        url: newSourceUrl,
        type: 'RSS',
        isActive: true,
        createdAt: Date.now()
      });
      setNewSourceName("");
      setNewSourceUrl("");
    } catch (e) {
      console.error("Failed to add source", e);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'sources', id));
    } catch (e) {
      console.error("Failed to delete source", e);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawFacts.trim()) {
      setError("Please provide raw facts or press release content.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedDraft(null);
    setSaveSuccess(false);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rawFacts, sources }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate");
      }

      const data = await res.json();
      setGeneratedDraft(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!generatedDraft || !user) return;
    
    setIsSaving(true);
    setError("");
    
    try {
      const articleData = {
        title: (generatedDraft.headline || 'Untitled').substring(0, 300),
        summary: (generatedDraft.summary || '').substring(0, 1000),
        content: (generatedDraft.content || '').substring(0, 50000),
        status: status,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        category: (generatedDraft.category || 'News').substring(0, 100),
        district: (generatedDraft.district || '').substring(0, 100),
        taluka: (generatedDraft.taluka || '').substring(0, 100),
        village: (generatedDraft.village || '').substring(0, 100),
        tags: Array.isArray(generatedDraft.tags) ? generatedDraft.tags.map(String).slice(0, 10) : [],
        publishedAt: status === 'PUBLISHED' ? Date.now() : 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeveloping: !!generatedDraft.isDeveloping,
        aiGenerated: true,
        imageUrl: (generatedDraft.imageUrl || getCategoryFallbackImage(generatedDraft.category, generatedDraft.headline)).substring(0, 1000),
        imagePrompt: (generatedDraft.imagePrompt || '').substring(0, 1000),
        imageAlt: (generatedDraft.imageAlt || generatedDraft.headline || '').substring(0, 300)
      };
      
      await addDoc(collection(db, 'articles'), articleData);
      setSaveSuccess(true);
      setGeneratedDraft(null); // clear after save
      setRawFacts("");
      setSources("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to save article to database. " + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-gray/50">
        <SEO title="अ‍ॅडमीन पॅनेल लोड होत आहे..." noindex={true} />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-gray/50">
        <SEO title="प्रशासकीय लॉगिन (Admin Sign In)" noindex={true} />
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-red-50 text-brand-red rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">प्रशासकीय नियंत्रण कक्ष (Admin)</h2>
            <p className="text-gray-600 text-sm mb-6">
              कृपया राज्यवाणी AI डेस्क व अ‍ॅडमीन पॅनेल वापरण्यासाठी आपल्या सुपर अ‍ॅडमीन खात्याने लॉगिन करा.
            </p>
            <button
              onClick={() => {
                sessionStorage.setItem('auth_redirect', window.location.pathname);
                openAuthModal('login');
              }}
              className="w-full bg-brand-red hover:bg-brand-saffron text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>लॉगिन करा (Sign In)</span>
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-gray/50">
        <SEO title="प्रवेश प्रतिबंधित (Access Restricted)" noindex={true} />
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">प्रवेश प्रतिबंधित (Access Restricted)</h2>
            <p className="text-gray-600 text-sm mb-4">
              तुमचे चालू खाते (<span className="font-semibold text-gray-900">{user.email}</span>) हे 'वाचक (Reader)' स्वरूपाचे आहे.
            </p>
            <p className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
              हे नियंत्रण कक्ष केवळ राज्यवाणीच्या सुपर अ‍ॅडमीन (Owner) साठी आरक्षित आहे.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-brand-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
            >
              मुख्यपृष्ठावर परत जा (Go to Home)
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/50">
      <SEO title="प्रशासकीय नियंत्रण कक्ष (Super Admin Panel)" description="राज्यवाणी AI डेस्क व बातमी संकलन नियंत्रण कक्ष" noindex={true} />
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Admin Panel" }
        ]} />

        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black flex items-center gap-3">
                <Bot className="w-7 h-7 sm:w-8 h-8 text-brand-red" />
                प्रशासकीय नियंत्रण कक्ष (Super Admin Panel)
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                वेबसाइट मालक नियंत्रण: AI बातमी संकलन, लेख व्यवस्थापन, वाचक व सुरक्षा ऑडिट
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                id="admin-home-btn"
                className="text-xs bg-white hover:bg-red-50 text-gray-700 hover:text-brand-red border border-gray-200 hover:border-brand-red/30 font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs transition-all"
                title="मुख्यपृष्ठावर जा"
              >
                <Home className="w-3.5 h-3.5 text-brand-red" />
                <span>मुख्यपृष्ठ (Home)</span>
              </Link>
              <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                सुपर अ‍ॅडमीन (Owner)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-gray-100">
          <button
            onClick={() => setActiveTab('collector')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'collector'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>⚡ ३-तास स्वयंचलित संकलन (3-Hr Automator)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-desk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ai-desk'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI पत्रकार डेस्क (Manual AI Desk)</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>बातम्या व्यवस्थापन (Articles)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>वापरकर्ते नियंत्रण (Users)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>सुरक्षा व ऑडिट लॉग्स (Security)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>वेबसाइट व SEO सेटिंग्ज (Settings)</span>
          </button>
        </div>

        {/* Tab 0: 3-Hour Continuous News Collection & Verification Engine */}
        {activeTab === 'collector' && (
          <AutomatedCollectorDashboard />
        )}

        {/* Tab 1: AI News Desk & 24/7 Automator */}
        {activeTab === 'ai-desk' && (
          <div className="space-y-8">
            {/* Automator Control Panel */}
            {isSuperAdmin && (
              <div>
                <div className="bg-gradient-to-r from-brand-red to-brand-saffron p-6 rounded-t-xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">24/7 AI News Collection Engine</h2>
                    <p className="text-white/80 text-sm">Automatically monitors trusted sources, deduplicates stories, and publishes verified news.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleUpgradeShortArticles}
                      disabled={isUpgradingShortArticles || isAutomating}
                      className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold py-2 px-5 rounded-md transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 text-sm cursor-pointer"
                    >
                      {isUpgradingShortArticles ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                      {isUpgradingShortArticles ? 'विस्तार सुरू आहे...' : '⚡ लहान बातम्या १०००+ शब्दांत वाढवा'}
                    </button>

                    <button
                      onClick={async () => {
                        try {
                        setIsAutomating(true);
                        const t = await getToken();
                        if (!t) return;
                        
                        // 1. Fetch recent articles for deduplication
                        const recentSnapshot = await getDocs(query(
                          collection(db, 'articles'),
                          orderBy('publishedAt', 'desc'),
                          limit(30)
                        ));
                        
                        const recentArticles = recentSnapshot.docs.map(doc => ({
                          id: doc.id,
                          title: doc.data().title,
                          summary: doc.data().summary,
                          sourceUrl: doc.data().sourceUrl
                        }));

                        // 2. Trigger backend to run Gemini and get operations
                        const activeSources = automatorSources.filter(s => s.isActive !== false);
                        const res = await fetch('/api/admin/trigger-automator', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            recentArticles, 
                            authorName: user?.displayName || user?.email || 'Rajyavani System',
                            sources: activeSources 
                          })
                        });
                        
                        let data: any = {};
                        try {
                          data = await res.json();
                        } catch (parseErr) {
                          throw new Error(`Server returned status ${res.status} (${res.statusText})`);
                        }

                        if (!res.ok) {
                          throw new Error(data.error || `Server responded with error ${res.status}`);
                        }

                        // Execute operations on the client-side to avoid backend permission issues
                        if (data.operations && data.operations.length > 0) {
                          const batch = writeBatch(db);
                          for (const op of data.operations) {
                            if (op.type === 'UPDATE' && op.targetId) {
                               const docRef = doc(collection(db, 'articles'), op.targetId);
                               batch.set(docRef, op.data, { merge: true });
                            } else if (op.type === 'CREATE') {
                               const newRef = doc(collection(db, 'articles'));
                               batch.set(newRef, op.data);
                            }
                          }
                          await batch.commit();
                        }
                        
                        alert(`News Automator finished successfully! Processed ${data.operations?.length || 0} operations.`);
                      } catch (e: any) {
                        console.error(e);
                        alert(`Error triggering automator: ${e.message || String(e)}`);
                      } finally {
                        setIsAutomating(false);
                      }
                    }}
                    disabled={isAutomating || isUpgradingShortArticles}
                    className="bg-white text-brand-red font-bold py-2 px-6 rounded-md hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 cursor-pointer text-sm"
                  >
                    {isAutomating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                    {isAutomating ? 'Running...' : 'Run Collector Now'}
                  </button>
                  </div>
                </div>

                {upgradeProgressMessage && (
                  <div className="bg-amber-50 border-x border-b border-amber-200 px-6 py-3 text-sm font-semibold text-amber-900 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                    {upgradeProgressMessage}
                  </div>
                )}
                
                <div className="bg-white border-x border-b border-gray-200 rounded-b-xl p-6">
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                     <h3 className="font-bold text-gray-800">Configured Sources</h3>
                     <button 
                       onClick={async () => {
                         const defaultSources = [
                            { name: "ABP Majha", url: "https://news.google.com/rss/search?q=site:marathi.abplive.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "News18 Lokmat", url: "https://news.google.com/rss/search?q=site:lokmat.news18.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "TV9 Marathi", url: "https://news.google.com/rss/search?q=site:tv9marathi.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Zee 24 Taas", url: "https://news.google.com/rss/search?q=site:zeenews.india.com/marathi&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Saam TV", url: "https://news.google.com/rss/search?q=site:saamtv.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Jai Maharashtra", url: "https://news.google.com/rss/search?q=site:jaimaharashtranews.tv&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Lokmat", url: "https://news.google.com/rss/search?q=site:lokmat.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Sakal", url: "https://news.google.com/rss/search?q=site:esakal.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Loksatta", url: "https://news.google.com/rss/search?q=site:loksatta.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Maharashtra Times", url: "https://news.google.com/rss/search?q=site:maharashtratimes.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Pudhari", url: "https://news.google.com/rss/search?q=site:pudhari.news&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Divya Marathi", url: "https://news.google.com/rss/search?q=site:divyamarathi.bhaskar.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Saamana", url: "https://news.google.com/rss/search?q=site:saamana.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Deshonnati", url: "https://news.google.com/rss/search?q=site:deshonnati.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Deshdoot", url: "https://news.google.com/rss/search?q=site:deshdoot.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                            { name: "Ekmat", url: "https://news.google.com/rss/search?q=site:ekmat.in&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true }
                         ];
                         if(window.confirm('Add 16 Marathi news publishers to sources?')) {
                           try {
                             const batch = writeBatch(db);
                             defaultSources.forEach(s => {
                               if(!automatorSources.find(as => as.url === s.url)) {
                                 const newRef = doc(collection(db, 'sources'));
                                 batch.set(newRef, { ...s, createdAt: Date.now() });
                               }
                             });
                             await batch.commit();
                             alert('Added default publishers successfully!');
                           } catch(e: any) {
                             alert('Failed to add sources: ' + e.message);
                           }
                         }
                       }}
                       className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md transition-colors cursor-pointer"
                     >
                       Load Marathi Publishers
                     </button>
                  </div>

                  {automatorSources.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-4">No sources configured. The automator will fall back to default Google News RSS.</p>
                  ) : (
                    <ul className="space-y-3 mb-6">
                      {automatorSources.map(source => (
                        <li key={source.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
                          <div>
                            <span className="font-semibold text-gray-800">{source.name}</span>
                            <span className="ml-2 text-xs font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{source.type}</span>
                            <div className="text-sm text-brand-red truncate max-w-[200px] sm:max-w-md">{source.url}</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteSource(source.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 cursor-pointer"
                            title="Remove source"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <form onSubmit={handleAddSource} className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="Source Name (e.g. PTI RSS)" 
                      className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                      value={newSourceName}
                      onChange={e => setNewSourceName(e.target.value)}
                      required
                    />
                    <input 
                      type="url" 
                      placeholder="RSS/API URL" 
                      className="flex-[2] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                      value={newSourceUrl}
                      onChange={e => setNewSourceUrl(e.target.value)}
                      required
                    />
                    <button type="submit" className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Column */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 border-l-4 border-brand-red pl-3">Input Raw Facts</h2>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Raw Facts / Events / Press Release *
                    </label>
                    <textarea 
                      required
                      rows={8}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
                      placeholder="E.g., Maharashtra government announced new scheme for farmers today in Mumbai. Subsidy of 5000 rs per acre..."
                      value={rawFacts}
                      onChange={(e) => setRawFacts(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Source URLs / References (Optional)
                    </label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
                      placeholder="https://maharashtra.gov.in/press-release"
                      value={sources}
                      onChange={(e) => setSources(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>बातमी यशस्वीरीत्या जतन / प्रकाशित झाली!</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isGenerating}
                    className="w-full bg-brand-red hover:bg-brand-saffron text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        AI is Analyzing & Drafting...
                      </>
                    ) : (
                      <>
                        <Bot className="w-5 h-5" />
                        Generate Original Draft
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Output Column */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 border-l-4 border-brand-saffron pl-3 flex justify-between items-center">
                  <span>Generated Draft</span>
                  {generatedDraft && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Ready for Review
                    </span>
                  )}
                </h2>

                {!generatedDraft && !isGenerating && (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-8">
                    <Bot className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-center text-sm">
                      Generated news article will appear here.<br/>
                      The AI ensures zero plagiarism and SEO formatting.
                    </p>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-8">
                    <Loader2 className="w-10 h-10 mb-3 animate-spin text-brand-red" />
                    <p className="text-center text-sm font-medium text-gray-600 animate-pulse">
                      Fact-checking sources...<br/>Writing original Marathi article...
                    </p>
                  </div>
                )}

                {generatedDraft && (
                  <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-500 overflow-y-auto">
                    
                    {generatedDraft.requiresHumanReview && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-xs font-semibold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                        <div>
                          <span className="block font-bold mb-1">Human Review Highly Recommended</span>
                          The AI detected potential ambiguities or conflicting facts in the provided source material. Please verify dates/names before publishing.
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Headline</label>
                      <h3 className="text-xl font-bold text-gray-900">{generatedDraft.headline}</h3>
                    </div>

                    <div className="h-44 rounded-lg overflow-hidden border border-gray-200">
                      <Image 
                        src={generatedDraft.imageUrl} 
                        category={generatedDraft.category} 
                        alt={generatedDraft.headline}
                        size="card"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Summary</label>
                      <p className="text-sm font-medium text-gray-600 border-l-2 border-gray-300 pl-3">{generatedDraft.summary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-sm border border-gray-200">
                        Category: {generatedDraft.category}
                      </span>
                      {generatedDraft.district && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-sm border border-gray-200">
                          District: {generatedDraft.district}
                        </span>
                      )}
                      {generatedDraft.content && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-sm font-bold flex items-center gap-1">
                          📝 {generatedDraft.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length} शब्द (दीर्घ लेख)
                        </span>
                      )}
                      {generatedDraft.isDeveloping && (
                        <span className="bg-red-50 text-brand-red px-2 py-1 rounded-sm border border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Developing Story
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Article Content</label>
                      <div 
                        className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none prose-p:mb-4"
                        dangerouslySetInnerHTML={{ __html: generatedDraft.content }} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">SEO Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {generatedDraft.tags?.map((tag: string) => (
                          <span key={tag} className="text-xs text-brand-saffron bg-brand-saffron/10 px-2 py-1 rounded-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                      <button 
                        onClick={() => handlePublish('DRAFT')}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        Save as Draft
                      </button>
                      <button 
                        onClick={() => handlePublish('PUBLISHED')}
                        disabled={isSaving}
                        className="bg-brand-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center gap-2 text-sm shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Approve & Publish
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Articles Management */}
        {activeTab === 'articles' && <ArticlesManagementTab />}

        {/* Tab 3: Users Management */}
        {activeTab === 'users' && <UserManagementTab />}

        {/* Tab 4: Security & Audit Logs */}
        {activeTab === 'audit' && <AuditLogsTab />}

        {/* Tab 5: Website & SEO Settings */}
        {activeTab === 'settings' && <SiteSettingsTab />}
      </main>

      <Footer />
    </div>
  );
}
