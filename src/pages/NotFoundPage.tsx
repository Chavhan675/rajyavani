import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Home, Search, AlertOctagon, ArrowLeft, MapPin } from 'lucide-react';
import { MAHARASHTRA_DISTRICTS } from '../data/maharashtraDistricts';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/50">
      <SEO 
        title="पृष्ठ आढळले नाही (404 Page Not Found) | राज्यवाणी" 
        description="तुम्ही शोधत असलेले बातमी पृष्ठ किंवा विभाग उपलब्ध नाही." 
        noindex={true}
      />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-red-100 text-brand-red rounded-full flex items-center justify-center mb-6 shadow-inner">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <span className="text-sm font-black text-brand-red tracking-widest uppercase">४०४ - पृष्ठ आढळले नाही</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4 font-serif">
          तुम्ही शोधत असलेले पृष्ठ उपलब्ध नाही
        </h1>
        
        <p className="text-gray-600 max-w-lg mb-8 text-sm sm:text-base leading-relaxed">
          हे पृष्ठ काढून टाकण्यात आले असू शकते, त्याचे नाव बदलले गेले आहे किंवा ते तात्पुरते अनुपलब्ध आहे. कृपया खालील प्रमुख विभागांमधून बातमी निवडा किंवा मुख्यपृष्ठावर परत जा.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-saffron text-white rounded-xl text-sm font-bold transition-all shadow-md"
          >
            <Home className="w-4 h-4" /> मुख्यपृष्ठावर जा
          </Link>

          <Link 
            to="/contact" 
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:text-brand-red hover:bg-gray-50 rounded-xl text-sm font-bold transition-all shadow-xs"
          >
            मदत व संपर्क
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm text-left">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            लोकप्रिय बातम्यांचे विभाग
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {["महाराष्ट्र", "राजकारण", "शेती", "गुन्हेगारी", "शिक्षण", "क्रीडा", "व्यापार", "हवामान"].map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat}`}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-50 hover:bg-red-50 hover:text-brand-red rounded-lg transition-colors text-gray-700 border border-gray-100 flex items-center justify-between"
              >
                <span>{cat}</span>
                <span className="text-gray-400 text-[10px]">→</span>
              </Link>
            ))}
          </div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-3">
            प्रमुख ३६ जिल्हे
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {MAHARASHTRA_DISTRICTS.slice(0, 16).map((d) => (
              <Link
                key={d.slug}
                to={`/district/${d.slug}`}
                className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 hover:bg-brand-red hover:text-white rounded-md transition-colors text-gray-600"
              >
                {d.nameMarathi}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
