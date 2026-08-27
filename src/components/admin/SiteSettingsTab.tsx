import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Settings, Save, CheckCircle2, AlertCircle, Loader2, Globe, Shield, Radio, DollarSign, FileCode2, Copy, ExternalLink, RefreshCw, Check } from 'lucide-react';

export default function SiteSettingsTab() {
  const { getToken } = useAuth();
  const [siteName, setSiteName] = useState('राज्यवाणी');
  const [tagline, setTagline] = useState('महाराष्ट्राचा बुलंद आवाज • सत्य, अचूक, निष्पक्ष');
  const [contactEmail, setContactEmail] = useState('contact@rajyavani.com');
  const [siteDomain, setSiteDomain] = useState('https://rajyavani.vercel.app');
  const [googleVerification, setGoogleVerification] = useState('-zk1qdzl7JP29O_3EHp5nsjwp4Q9G9WOtBXN4YMmuAA');
  const [googleAdSensePubId, setGoogleAdSensePubId] = useState('ca-pub-5135667808606813');
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
          if (d.googleAdSensePubId) setGoogleAdSensePubId(d.googleAdSensePubId);
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
        googleAdSensePubId,
        enableAds,
        emergencyBannerText,
        emergencyBannerActive,
        updatedAt: Date.now()
      }, { merge: true });

      setStatus({ type: 'success', text: 'सर्व सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या!' });
    } catch (e: any) {
      console.error('Save settings error:', e);
      setStatus({ type: 'error', text: 'सेटिंग्ज सेव्ह करण्यात अडचण आली: ' + (e.message || '') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-red" /> पोर्टल सेटिंग्ज व जाहिरात व्यवस्थापन
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            वेबसाइट माहिती, Google AdSense, SEO इंडेक्सिंग व आणीबाणी अलर्ट्स व्यवस्थापित करा
          </p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{status.text}</span>
        </div>
      )}

      {/* SEO & Sitemap Auto-Sync Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-600" /> Google Search Console & XML Sitemap
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Google वर बातम्या त्वरित रँक होण्यासाठी लाईव्ह XML साईटमॅप आणि robots.txt
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateSitemap}
            disabled={generatingSitemap}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            {generatingSitemap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{generatingSitemap ? 'अपडेट होत आहे...' : 'लाईव्ह साईटमॅप अपडेट करा'}</span>
          </button>
        </div>

        {sitemapStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            {sitemapStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Sitemap URL Box */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">XML Sitemap URL (Google ला सबमिट करा)</span>
              <code className="text-xs font-mono text-gray-800 break-all font-semibold select-all">
                {siteDomain.replace(/\/+$/, '')}/sitemap.xml
              </code>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(`${siteDomain.replace(/\/+$/, '')}/sitemap.xml`, 'sitemap')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 transition"
              >
                {copiedKey === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copiedKey === 'sitemap' ? 'कॉपी झाले!' : 'URL कॉपी करा'}</span>
              </button>
              <a
                href={`${siteDomain.replace(/\/+$/, '')}/sitemap.xml`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                <span>उघडून पहा</span>
              </a>
            </div>
          </div>

          {/* RSS Feed URL Box */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">RSS Feed URL (Google News साठी)</span>
              <code className="text-xs font-mono text-gray-800 break-all font-semibold select-all">
                {siteDomain.replace(/\/+$/, '')}/rss.xml
              </code>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(`${siteDomain.replace(/\/+$/, '')}/rss.xml`, 'rss')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 transition"
              >
                {copiedKey === 'rss' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copiedKey === 'rss' ? 'कॉपी झाले!' : 'URL कॉपी करा'}</span>
              </button>
              <a
                href={`${siteDomain.replace(/\/+$/, '')}/rss.xml`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                <span>उघडून पहा</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Globe className="w-4 h-4 text-brand-red" /> मुख्य माहिती (General Information)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">वृत्तपत्र नाव (Site Name)</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">अधिकृत संपर्क ईमेल (Contact Email)</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">टॅगलाइन (Tagline)</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  अधिकृत मुख्य डोमेन URL (Production Domain)
                </label>
                <input
                  type="url"
                  value={siteDomain}
                  onChange={(e) => setSiteDomain(e.target.value)}
                  placeholder="https://rajyavani.vercel.app"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red font-mono"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  XML Sitemap, RSS Feed व Google Canonical Meta Tags या डोमेननुसार अपडेट होतात.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Google Verification & AdSense */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Shield className="w-4 h-4 text-brand-red" /> Google Search Console & AdSense
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  value={googleVerification}
                  onChange={(e) => setGoogleVerification(e.target.value)}
                  placeholder="-zk1qdzl7JP29O_3EHp5nsjwp4Q9G9WOtBXN4YMmuAA"
                  className="w-full font-mono text-xs px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  `&lt;meta name="google-site-verification" content="..."&gt;` टॅगमध्ये वापरला जातो.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={googleAdSensePubId}
                  onChange={(e) => setGoogleAdSensePubId(e.target.value)}
                  placeholder="ca-pub-5135667808606813"
                  className="w-full font-mono text-xs px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Broadcast Banner */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Radio className="w-4 h-4 text-brand-red" /> आणीबाणी / विशेष सूचना बॅनर (Emergency Banner)
            </h4>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">वेबसाईटवर लाल सूचना पट्टी दाखवा</span>
                  <span className="text-[11px] text-amber-800">सर्व पानांवर सर्वात वर मोठी लाल अलर्ट पट्टी दिसेल</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emergencyBannerActive} 
                    onChange={(e) => setEmergencyBannerActive(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-red"></div>
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

          {/* Section 4: General Ads & AdSense */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <DollarSign className="w-4 h-4 text-brand-red" /> सामान्य जाहिरात नियंत्रण (Google AdSense & Banners)
            </h4>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-800 block">वेबसाइट जाहिराती सुरू ठेवा</span>
                <span className="text-[11px] text-gray-500">Google AdSense व अधिकृत बॅनर स्लॉट्स</span>
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
