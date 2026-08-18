import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ShieldCheck, FileText, ChevronRight } from "lucide-react";
import { MAHARASHTRA_DISTRICTS } from "../data/maharashtraDistricts";

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white pt-16 pb-8 border-t-4 border-brand-red mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand & About Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-brand-red to-brand-saffron rounded-full flex items-center justify-center shadow-md border border-white/20">
                <span className="text-white font-bold text-xl">रा</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  राज्यवाणी
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                  महाराष्ट्राचा बुलंद डिजिटल आवाज
                </span>
              </div>
            </Link>
            
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              राज्यवाणी हे महाराष्ट्राचे आघाडीचे स्वतंत्र डिजिटल वृत्तपत्र आहे. गाव, तालुका, जिल्हा ते राज्यभरातील प्रत्येक घडामोडीची सविस्तर, पडताळलेली आणि निष्पक्ष बातमी वाचकांपर्यंत पोहोचवणे हे आमचे ध्येय आहे.
            </p>

            {/* Official Contact Info Box */}
            <div className="pt-3 space-y-2 border-t border-white/10 text-xs">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4 text-brand-red shrink-0" />
                <span className="text-gray-400">संपर्क:</span>
                <a href="tel:8459675917" className="text-white font-bold hover:text-brand-saffron transition-colors font-mono">
                  8459675917
                </a>
              </div>

              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4 text-brand-red shrink-0" />
                <span className="text-gray-400">ईमेल:</span>
                <a href="mailto:chavhanakash675@gmail.com" className="text-white font-bold hover:text-brand-saffron transition-colors">
                  chavhanakash675@gmail.com
                </a>
              </div>

              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                <span className="text-gray-400">कार्यक्षेत्र:</span>
                <span className="text-white font-medium">महाराष्ट्र (३६ जिल्हे)</span>
              </div>
            </div>
          </div>

          {/* Quick Categories Column (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-wider relative inline-block">
              प्रमुख विभाग
              <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-brand-red"></span>
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { name: "📚 बातमी संग्रह (Archive)", path: "/archive" },
                { name: "🎓 विद्यार्थी व नोकरी", path: "/jobs" },
                { name: "महाराष्ट्र", path: "/category/महाराष्ट्र" },
                { name: "राजकारण", path: "/category/राजकारण" },
                { name: "गुन्हेगारी (क्राईम)", path: "/category/गुन्हेगारी" },
                { name: "शेती व हवामान", path: "/category/शेती" },
                { name: "शिक्षण व नोकरी", path: "/jobs" },
                { name: "व्यापार व अर्थकारण", path: "/category/व्यापार" },
                { name: "क्रीडा", path: "/category/क्रीडा" },
                { name: "मनोरंजन", path: "/category/मनोरंजन" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1.5 py-0.5">
                    <span className="w-1 h-1 bg-brand-red rounded-full"></span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regional & District News (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-wider relative inline-block">
              स्थानिक ३६ जिल्हे
              <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-brand-red"></span>
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-gray-400">
              {MAHARASHTRA_DISTRICTS.slice(0, 14).map((district) => (
                <Link
                  key={district.slug}
                  to={`/district/${district.slug}`}
                  className="hover:text-brand-saffron transition-colors truncate py-0.5"
                >
                  • {district.nameMarathi}
                </Link>
              ))}
            </div>
            <Link 
              to="/location/district/महाराष्ट्र" 
              className="inline-block mt-3 text-xs font-bold text-brand-saffron hover:underline"
            >
              सर्व ३६ जिल्ह्यांच्या बातम्या पहा →
            </Link>
          </div>

          {/* Trust, Legal & Editorial Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-wider relative inline-block">
              पारदर्शकता व कायदेशीर धोरणे
              <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-brand-red"></span>
            </h3>
            
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span>आमच्याबद्दल (About Us)</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span className="font-bold text-brand-saffron">संपर्क करा (Contact Us)</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span>गोपनीयता धोरण (Privacy Policy)</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span>अटी आणि शर्ती (Terms & Conditions)</span>
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span>संपादकीय धोरण (Editorial Policy)</span>
                </Link>
              </li>
              <li>
                <Link to="/correction-policy" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span>दुरुस्ती धोरण (Correction Policy)</span>
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span>कुकी धोरण (Cookie Policy)</span>
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-red" />
                  <span>अस्वीकरण (Disclaimer)</span>
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <Link 
                to="/contact?type=news_tip" 
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-brand-red text-white text-xs font-bold rounded-lg transition-colors border border-white/15"
              >
                <span>📢 बातमी पाठवा (Submit News Tip)</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Legal Strip & Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4 text-center md:text-left">
          <div>
            <p>&copy; {new Date().getFullYear()} <strong className="text-white">राज्यवाणी (Rajyavani)</strong>. सर्व हक्क राखीव. (All rights reserved).</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              महाराष्ट्राचे विश्वासार्ह डिजिटल वृत्तपत्र | संपादक: आकाश चव्हाण | संपर्क: 8459675917
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-300">
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <span className="text-gray-600">•</span>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <span className="text-gray-600">•</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-gray-600">•</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span className="text-gray-600">•</span>
            <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            <span className="text-gray-600">•</span>
            <Link to="/editorial-policy" className="hover:text-white transition-colors">Editorial Policy</Link>
            <span className="text-gray-600">•</span>
            <Link to="/correction-policy" className="hover:text-white transition-colors">Correction Policy</Link>
            <span className="text-gray-600">•</span>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
