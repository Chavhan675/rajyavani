import React from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import AdUnit from "../components/AdUnit";
import SEO from "../components/SEO";
import { FileText } from 'lucide-react';

interface LegalPageProps {
  title: string;
  content: string;
  lastUpdated?: string;
}

export default function LegalPage({ title, content, lastUpdated = "August 15, 2026" }: LegalPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO title={title} description={`राज्यवाणीचे ${title} पृष्ठ.`} />
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: title }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-6">
          <div className="lg:col-span-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4">{title}</h1>
            <div className="flex items-center text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100 space-x-2">
              <FileText className="w-4 h-4" />
              <span>शेवटचे अद्यतन: {lastUpdated}</span>
            </div>
            
            {/* Simple content renderer for demo purposes */}
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              {content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-8">
            <div className="sticky top-28">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">कायदेशीर पृष्ठे</h3>
              <ul className="space-y-3 border-l-2 border-gray-100 pl-4">
                <li><a href="/about" className="text-gray-700 hover:text-brand-red transition-colors font-medium text-sm">आमच्याबद्दल (About Us)</a></li>
                <li><a href="/privacy-policy" className="text-gray-700 hover:text-brand-red transition-colors font-medium text-sm">गोपनीयता धोरण (Privacy Policy)</a></li>
                <li><a href="/terms" className="text-gray-700 hover:text-brand-red transition-colors font-medium text-sm">अटी आणि शर्ती (Terms)</a></li>
                <li><a href="/editorial-policy" className="text-gray-700 hover:text-brand-red transition-colors font-medium text-sm">संपादकीय धोरण</a></li>
                <li><a href="/fact-checking" className="text-gray-700 hover:text-brand-red transition-colors font-medium text-sm">फॅक्ट-चेकिंग धोरण</a></li>
                <li><a href="/disclaimer" className="text-gray-700 hover:text-brand-red transition-colors font-medium text-sm">अस्वीकरण (Disclaimer)</a></li>
              </ul>
              <div className="mt-8">
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
