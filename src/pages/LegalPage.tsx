import React from 'react';
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import AdUnit from "../components/AdUnit";
import SEO from "../components/SEO";
import { 
  FileText, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  AlertCircle,
  FileEdit,
  Cookie
} from 'lucide-react';
import { legalPagesData, LegalDocument } from '../data/legalContents';

interface LegalPageProps {
  pageKey?: string;
  title?: string;
  content?: string;
  lastUpdated?: string;
}

export default function LegalPage({ pageKey, title: propTitle, content: propContent, lastUpdated: propUpdated }: LegalPageProps) {
  const location = useLocation();

  // Determine doc by pageKey or path
  let currentKey = pageKey;
  if (!currentKey) {
    const path = location.pathname.replace(/^\//, '');
    if (path.includes('privacy')) currentKey = 'privacy';
    else if (path.includes('about')) currentKey = 'about';
    else if (path.includes('terms')) currentKey = 'terms';
    else if (path.includes('disclaimer')) currentKey = 'disclaimer';
    else if (path.includes('editorial')) currentKey = 'editorial';
    else if (path.includes('correction')) currentKey = 'correction';
    else if (path.includes('cookie')) currentKey = 'cookie';
    else if (path.includes('fact')) currentKey = 'factchecking';
    else currentKey = 'about';
  }

  const doc: LegalDocument | undefined = legalPagesData[currentKey || 'about'];
  const title = doc ? doc.title : (propTitle || "माहिती पृष्ठ");
  const subtitle = doc ? doc.subtitle : "राज्यवाणी अधिकृत धोरण व माहिती";
  const lastUpdated = doc ? doc.lastUpdated : (propUpdated || "१८ ऑगस्ट २०२६");

  const navLinks = [
    { label: "आमच्याबद्दल (About Us)", path: "/about", key: "about", icon: ShieldCheck },
    { label: "गोपनीयता धोरण (Privacy Policy)", path: "/privacy-policy", key: "privacy", icon: FileText },
    { label: "अटी आणि शर्ती (Terms)", path: "/terms", key: "terms", icon: Scale },
    { label: "अस्वीकरण (Disclaimer)", path: "/disclaimer", key: "disclaimer", icon: AlertCircle },
    { label: "संपादकीय धोरण (Editorial Policy)", path: "/editorial-policy", key: "editorial", icon: FileEdit },
    { label: "दुरुस्ती धोरण (Correction Policy)", path: "/correction-policy", key: "correction", icon: HelpCircle },
    { label: "कुकी धोरण (Cookie Policy)", path: "/cookie-policy", key: "cookie", icon: Cookie },
    { label: "फॅक्ट-चेकिंग धोरण", path: "/fact-checking", key: "factchecking", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/40">
      <SEO 
        title={`${title} | राज्यवाणी (Rajyavani)`} 
        description={`राज्यवाणीचे अधिकृत ${title}. ${subtitle}`}
        canonical={`https://rajyavani.vercel.app${location.pathname}`}
      />
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: "मुख्यपृष्ठ", href: "/" },
          { label: title }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
            
            {/* Header section */}
            <div className="border-b border-gray-100 pb-6 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-brand-red rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> अधिकृत धोरण व पारदर्शकता
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-serif mt-1">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium mt-2 leading-relaxed">
                {subtitle}
              </p>
              <div className="flex items-center text-xs text-gray-600 font-medium mt-4 space-x-2">
                <FileText className="w-3.5 h-3.5 text-gray-700" />
                <span>शेवटचे अद्यतन: {lastUpdated} | राज्यवाणी संपादकीय मंडळ</span>
              </div>
            </div>

            {/* Document Body */}
            {doc ? (
              <div className="space-y-8 text-gray-800 leading-relaxed text-sm sm:text-base">
                {doc.sections.map((sec, idx) => (
                  <section key={idx} className="space-y-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <span className="w-1.5 h-5 bg-brand-red rounded-full"></span>
                      {sec.heading}
                    </h2>
                    
                    {Array.isArray(sec.body) ? (
                      sec.body.map((p, pIdx) => (
                        <p key={pIdx} className="text-gray-700 leading-relaxed">{p}</p>
                      ))
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{sec.body}</p>
                    )}

                    {sec.subpoints && sec.subpoints.length > 0 && (
                      <ul className="space-y-2 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 mt-3">
                        {sec.subpoints.map((sub, sIdx) => (
                          <li key={sIdx} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0"></span>
                            <span className="leading-relaxed">{sub}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <div className="prose max-w-none text-gray-700 space-y-4">
                {propContent?.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="leading-relaxed">{paragraph}</p>
                ))}
              </div>
            )}

            {/* Official Contact Box */}
            <div className="mt-12 pt-8 border-t border-gray-100 bg-gradient-to-r from-red-50/50 to-orange-50/50 p-6 rounded-2xl border border-red-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">काही प्रश्न अथवा मदत हवी आहे का?</h3>
              <p className="text-xs text-gray-600 mb-4">
                आमच्या संपादकीय टीमशी किंवा तक्रार निवारण अधिकाऱ्याशी थेट संपर्क साधा.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <a href="tel:8459675917" className="flex items-center gap-1.5 text-brand-red hover:underline">
                  <Phone className="w-3.5 h-3.5" /> 8459675917
                </a>
                <a href="mailto:chavhanakash675@gmail.com" className="flex items-center gap-1.5 text-blue-700 hover:underline">
                  <Mail className="w-3.5 h-3.5" /> chavhanakash675@gmail.com
                </a>
                <Link to="/contact" className="flex items-center gap-1 text-gray-800 hover:text-brand-red ml-auto">
                  ऑनलाइन संपर्क फॉर्म →
                </Link>
              </div>
            </div>

          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm sticky top-24">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
                कायदेशीर व संपादकीय धोरणे
              </h3>
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentKey === item.key;
                  return (
                    <Link
                      key={item.key}
                      to={item.path}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-red-50 text-brand-red border border-red-200/60 shadow-xs'
                          : 'text-gray-800 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-red' : 'text-gray-700'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 mb-2">थेट संपर्क साधा</h4>
                <p className="text-xs text-gray-700 font-medium mb-3 leading-relaxed">
                  आपल्या परिसरातील बातमी पाठवण्यासाठी किंवा दुरुस्ती सुचवण्यासाठी संपर्क कक्ष वापरा.
                </p>
                <Link
                  to="/contact"
                  className="block w-full text-center py-2.5 bg-brand-red hover:bg-brand-saffron text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  संपर्क कक्ष (Contact Us)
                </Link>
              </div>

              {/* Advertisement placeholder */}
              <div className="mt-6">
                <AdUnit format="rectangle" />
              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
