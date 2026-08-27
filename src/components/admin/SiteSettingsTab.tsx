import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Settings, Save, CheckCircle2, AlertCircle, Loader2, Megaphone, Globe, Shield, Radio, DollarSign, FileCode2, Copy, ExternalLink, RefreshCw, Check } from 'lucide-react';

export default function SiteSettingsTab() {
  const { getToken } = useAuth();
  const [siteName, setSiteName] = useState('राज्यवाणी');
  const [tagline, setTagline] = useState('महाराष्ट्राचा बुलंद आवाज • सत्य, अचूक, निष्पक्ष');
  const [contactEmail, setContactEmail] = useState('contact@rajyavani.com');
  const [siteDomain, setSiteDomain] = useState('https://rajyavani.vercel.app');
  const [googleVerification, setGoogleVerification] = useState('-zk1qdzl7JP29O_3EHp5nsjwp4Q9G9WOtBXN4YMmuAA');
  const [monetagVerification, setMonetagVerification] = useState('99e0dfa12d1b827e85c2ff507cb728c3');
  const [monetagZoneId, setMonetagZoneId] = useState('272255');
  const [monetagScriptUrl, setMonetagScriptUrl] = useState('https://quge5.com/88/tag.min.js');
  const [monetagDirectLink, setMonetagDirectLink] = useState('https://omg10.com/4/11630717');
  const [enableMonetag, setEnableMonetag] = useState(true);
  const [enableInPagePush, setEnableInPagePush] = useState(true);
  const [enableVignette, setEnableVignette] = useState(true);
  const [enablePopunder, setEnablePopunder] = useState(true);
  const [enableDirectLink, setEnableDirectLink] = useState(true);
  const [enableAds, setEnableAds] = useState(true);
  const [emergencyBannerText, setEmergencyBannerText] = useState('');
  const [emergencyBannerActive, setEmergencyBannerActive] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sitemap management state
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [sitemapStatus, setSitemapStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.siteName) setSiteName(d.siteName);
          if (d.tagline) setTagline(d.tagline);
          if (d.contactEmail) setContactEmail(d.contactEmail);
          if (d.siteDomain) setSiteDomain(d.siteDomain);
          if (d.googleVerification) setGoogleVerification(d.googleVerification);
          if (d.monetagVerification) setMonetagVerification(d.monetagVerification);
          if (d.monetagZoneId) setMonetagZoneId(d.monetagZoneId);
          if (d.monetagScriptUrl) setMonetagScriptUrl(d.monetagScriptUrl);
          if (d.monetagDirectLink) setMonetagDirectLink(d.monetagDirectLink);
          if (d.enableMonetag !== undefined) setEnableMonetag(d.enableMonetag);
          if (d.enableInPagePush !== undefined) setEnableInPagePush(d.enableInPagePush);
          if (d.enableVignette !== undefined) setEnableVignette(d.enableVignette);
          if (d.enablePopunder !== undefined) setEnablePopunder(d.enablePopunder);
          if (d.enableDirectLink !== undefined) setEnableDirectLink(d.enableDirectLink);
          if (d.enableAds !== undefined) setEnableAds(d.enableAds);
          if (d.emergencyBannerText) setEmergencyBannerText(d.emergencyBannerText);
          if (d.emergencyBannerActive !== undefined) setEmergencyBannerActive(d.emergencyBannerActive);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateSitemap = async () => {
    try {
      setGeneratingSitemap(true);
      setSitemapStatus(null);
      const token = await getToken();

      const res = await fetch('/api/admin/sitemap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ customDomain: siteDomain })
      });

      const data = await res.json();
      if (data.success) {
        setSitemapStatus(`साईस्टमॅप व robots.txt यशस्वीरीत्या अपडेट झाले! (${siteDomain})`);
      } else {
        setSitemapStatus(`त्रुटी: ${data.error || 'अपडेट अयशस्वी'}`);
      }
    } catch (e: any) {
      setSitemapStatus(`त्रुटी: ${e.message || 'नेटवर्क समस्या'}`);
    } finally {
      setGeneratingSitemap(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSaving(true);

    try {
      await setDoc(doc(db, 'settings', 'general'), {
        siteName,
        tagline,
        contactEmail,
        siteDomain,
        googleVerification,
        monetagVerification,
        monetagZoneId,
        monetagScriptUrl,
        monetagDirectLink,
        enableMonetag,
        enableInPagePush,
        enableVignette,
        enablePopunder,
        enableDirectLink,
        enableAds,
        emergencyBannerText,
        emergencyBannerActive,
        updatedAt: Date.now()
      }, { merge: true });

      // Update local storage configuration
      if (typeof window !== 'undefined') {
        localStorage.setItem('rajyavani_monetag_config', JSON.stringify({
          enabled: enableMonetag,
          multiTagZoneId: monetagZoneId,
          multiTagScriptUrl: monetagScriptUrl,
          directLinkUrl: monetagDirectLink,
          enableInPagePush,
          enableVignette,
          enablePopunder,
          enableDirectLink,
          monetagVerification
        }));
      }

      setStatus({ type: 'success', text: 'सर्व वेबसाइट, मॉनेटाग (Monetag) व SEO सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या!' });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', text: 'सेटिंग्ज सेव्ह करताना त्रुटी आली.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red mb-2" />
        <p className="text-sm font-medium">सेटिंग्ज लोड होत आहेत...</p>
      </div>
    );
  }

  const cleanDomain = siteDomain.replace(/\/+$/, '');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-red" />
            वेबसाइट, SEO व सर्च कन्सोल (Site, SEO & Search Console)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            राज्यवाणी पोर्टलचे नाव, टॅगलाइन, Google Search Console साईटमॅप व जाहिरात व्यवस्थापन
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium ${
            status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.text}</span>
          </div>
        )}

        {/* Dedicated Section: Google Search Console & Sitemap Central */}
        <div className="p-5 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border border-blue-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  Google Search Console & XML Sitemap
                </h4>
                <p className="text-[11px] text-gray-600">
                  Google Search Console मध्ये सबमिट करण्यासाठी वैध URL आणि लाईव्ह साईटमॅप
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateSitemap}
              disabled={generatingSitemap}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              {generatingSitemap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{generatingSitemap ? 'जनरेट होत आहे...' : 'लाईव्ह साईटमॅप Sync करा'}</span>
            </button>
          </div>

          {sitemapStatus && (
            <div className="p-3 bg-blue-100/70 text-blue-900 border border-blue-200 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-700" />
              <span>{sitemapStatus}</span>
            </div>
          )}

          {/* Quick Copy Rows for Google Search Console */}
          <div className="grid grid-cols-1 gap-3">
            {/* Primary Sitemap */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div>
                <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  मुख्य वेबसाइट साईटमॅप (Main Sitemap):
                </span>
                <span className="text-xs font-mono text-blue-700 break-all select-all">
                  {cleanDomain}/sitemap.xml
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Google Search Console मध्ये केवळ <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-bold">sitemap.xml</code> टाका.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleCopy('sitemap.xml', 'sitemap-rel')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy 'sitemap.xml'"
                >
                  {copiedKey === 'sitemap-rel' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sitemap-rel' ? 'कॉपी झाले!' : 'sitemap.xml कॉपी करा'}</span>
                </button>

                <a
                  href={`${cleanDomain}/sitemap.xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Open live XML"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Google News Sitemap */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div>
                <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Google News विशिष्ट साईटमॅप (Google News Sitemap):
                </span>
                <span className="text-xs font-mono text-blue-700 break-all select-all">
                  {cleanDomain}/news-sitemap.xml
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Google News क्रॉलरसाठी <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-bold">news-sitemap.xml</code> टाका.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleCopy('news-sitemap.xml', 'news-sitemap-rel')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy 'news-sitemap.xml'"
                >
                  {copiedKey === 'news-sitemap-rel' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'news-sitemap-rel' ? 'कॉपी झाले!' : 'news-sitemap.xml कॉपी करा'}</span>
                </button>

                <a
                  href={`${cleanDomain}/news-sitemap.xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Open live News XML"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Guide on how to fix 5 errors in Google Search Console */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              Google Search Console मधील 'Errors' कसे सोडवायचे?
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900">
              <li>
                Google Search Console मध्ये तुमच्या प्रॉपर्टीच्या (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{cleanDomain}</code>) <strong>Sitemaps</strong> विभागात जा.
              </li>
              <li>
                आधी सबमिट केलेल्या त्रुटी असलेल्या जुन्या साईटमॅपवर क्लिक करा आणि वर उजवीकडील ३ डॉट्स (⋮) वरून <strong>'Remove sitemap'</strong> करा.
              </li>
              <li>
                वर <strong>'Add a new sitemap'</strong> मधील बॉक्समध्ये फक्त <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">sitemap.xml</code> टाइप करून <strong>SUBMIT</strong> करा.
              </li>
              <li>
                त्याचप्रमाणे बातम्यांसाठी <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">news-sitemap.xml</code> सबमिट करा.
              </li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: General Info & Production Domain */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Globe className="w-4 h-4 text-brand-red" /> सामान्य माहिती व डोमेन (General & Domain)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">पोर्टल नाव (Website Title)</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">लाईव्ह डोमेन URL (Production Domain)</label>
                <input
                  type="url"
                  value={siteDomain}
                  onChange={(e) => setSiteDomain(e.target.value)}
                  placeholder="https://rajyavani.vercel.app"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Google Search Console आणि SEO साठी वापरले जाणारे मुख्य डोमेन
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">संपर्क ईमेल (Support Email)</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">टॅगलाइन (Portal Tagline)</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>
            </div>
          </div>

          {/* Section 2: SEO & Google Search Console Verification */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Shield className="w-4 h-4 text-brand-red" /> Google Site Verification
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Google Site Verification Code / HTML Tag
              </label>
              <input
                type="text"
                value={googleVerification}
                onChange={(e) => setGoogleVerification(e.target.value)}
                placeholder="-zk1qdzl7JP29O_3EHp5nsjwp4Q9G9WOtBXN4YMmuAA"
                className="w-full font-mono text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                हा कोड मुख्यपृष्ठावर `&lt;meta name="google-site-verification"&gt;` टॅगमध्ये समाविष्ट केला जातो.
              </p>
            </div>
          </div>

          {/* Section 3: Emergency Broadcast Banner */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Megaphone className="w-4 h-4 text-brand-red" /> विशेष / आपत्कालीन सूचना पट्टी (Emergency Alert Banner)
            </h4>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">सूचना पट्टी सक्रिय करा (Enable Banner)</span>
                  <span className="text-[11px] text-amber-800">पोर्टलच्या सर्वात वरती हायलाईटेड ब्रेकिंग अलर्ट दिसेल</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emergencyBannerActive} 
                    onChange={(e) => setEmergencyBannerActive(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {emergencyBannerActive && (
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">सूचना मजकूर (Banner Text)</label>
                  <input
                    type="text"
                    value={emergencyBannerText}
                    onChange={(e) => setEmergencyBannerText(e.target.value)}
                    placeholder="उदा. 'सावधान: विदर्भ आणि मराठवाड्यात मुसळधार पावसाचा इशारा!'"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Monetag Ad Network Integration */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Megaphone className="w-4 h-4 text-amber-600" /> मॉनेटाग जाहिरात व्यवस्थापन (Monetag Ad Network Integration)
            </h4>

            <div className="p-4 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white rounded-2xl border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">मॉनेटाग जाहिराती सुरू ठेवा (Enable Monetag Ads)</span>
                  <span className="text-[11px] text-amber-800">MultiTag, In-Page Push, Vignette Banner व Popunder जाहिराती</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enableMonetag} 
                    onChange={(e) => setEnableMonetag(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {enableMonetag && (
                <div className="space-y-4 pt-2 border-t border-amber-200/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        मॉनेटाग MultiTag स्क्रिप्ट URL (Script URL)
                      </label>
                      <input
                        type="url"
                        value={monetagScriptUrl}
                        onChange={(e) => setMonetagScriptUrl(e.target.value)}
                        placeholder="https://alwingulla.com/88/tag.min.js"
                        className="w-full font-mono text-xs px-3.5 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        मॉनेटाग Zone ID / MultiTag ID
                      </label>
                      <input
                        type="text"
                        value={monetagZoneId}
                        onChange={(e) => setMonetagZoneId(e.target.value)}
                        placeholder="88888"
                        className="w-full font-mono text-xs px-3.5 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        मॉनेटाग Direct Link (Smart Link URL)
                      </label>
                      <input
                        type="url"
                        value={monetagDirectLink}
                        onChange={(e) => setMonetagDirectLink(e.target.value)}
                        placeholder="https://omg10.com/4/11630717"
                        className="w-full font-mono text-xs px-3.5 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        डायरेक्ट लिंक (उदा. <code>https://omg10.com/4/11630717</code>) स्पॉन्सर्ड बॅनर्स व क्लिक ॲक्शन्ससाठी वापरली जाते.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        मॉनेटाग Meta Verification Code
                      </label>
                      <input
                        type="text"
                        value={monetagVerification}
                        onChange={(e) => setMonetagVerification(e.target.value)}
                        placeholder="99e0dfa12d1b827e85c2ff507cb728c3"
                        className="w-full font-mono text-xs px-3.5 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        Monetag Publisher Verification साठी `&lt;meta name="monetag" content="..."&gt;` मध्ये हा कोड आपोआप अपडेट होतो.
                      </p>
                    </div>
                  </div>

                  {/* Format toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">In-Page Push</span>
                        <span className="text-[10px] text-gray-500">नेटिव्ह पुश जाहिरात</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableInPagePush}
                        onChange={(e) => setEnableInPagePush(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">Vignette Banner</span>
                        <span className="text-[10px] text-gray-500">इंटरस्टिशियल जाहिरात</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableVignette}
                        onChange={(e) => setEnableVignette(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">Popunder / OnClick</span>
                        <span className="text-[10px] text-gray-500">ऑनक्लिक जाहिरात</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enablePopunder}
                        onChange={(e) => setEnablePopunder(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">Direct Link</span>
                        <span className="text-[10px] text-gray-500">स्मार्ट डायरेक्ट लिंक</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableDirectLink}
                        onChange={(e) => setEnableDirectLink(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: General Ads & AdSense */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <DollarSign className="w-4 h-4 text-brand-red" /> सामान्य जाहिरात नियंत्रण (General Ads & AdSense)
            </h4>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-800 block">वेबसाइट जाहिराती सुरू ठेवा</span>
                <span className="text-[11px] text-gray-500">Google AdSense व बॅनर स्लॉट्स</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableAds} 
                  onChange={(e) => setEnableAds(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-red"></div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-red hover:bg-brand-saffron text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'सेव्ह होत आहे...' : 'सर्व बदल सेव्ह करा'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

