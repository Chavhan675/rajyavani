import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import Logo from "./Logo";
import { MAHARASHTRA_DISTRICTS } from "../data/maharashtraDistricts";

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white pt-16 pb-8 border-t-4 border-brand-red mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand & About Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="footer" className="mb-4" />
            
            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-normal">
              राज्यवाणी हे महाराष्ट्राचे आघाडीचे स्वतंत्र डिजिटल वृत्तपत्र आहे. गाव, तालुका, जिल्हा ते राज्यभरातील प्रत्येक घडामोडीची सविस्तर, पडताळलेली आणि निष्पक्ष बातमी वाचकांपर्यंत पोहोचवणे हे आमचे ध्येय आहे.
            </p>

            {/* Official Contact Info Box */}
            <div className="pt-3 space-y-2 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex items-center space-x-2 text-gray-200 min-h-[36px]">
                <Phone className="w-4 h-4 text-brand-red shrink-0" />
                <span className="text-gray-300">संपर्क:</span>
                <a href="tel:8459675917" className="text-white font-bold hover:text-amber-400 transition-colors font-mono py-1.5 px-1 inline-block min-h-[44px] flex items-center">
                  8459675917
                </a>
              </div>

              <div className="flex items-center space-x-2 text-gray-200 min-h-[36px]">
                <Mail className="w-4 h-4 text-brand-red shrink-0" />
                <span className="text-gray-300">ईमेल:</span>
                <a href="mailto:chavhanakash675@gmail.com" className="text-white font-bold hover:text-amber-400 transition-colors py-1.5 px-1 inline-block min-h-[44px] flex items-center truncate">
                  chavhanakash675@gmail.com
                </a>
              </div>

              <div className="flex items-center space-x-2 text-gray-200 min-h-[36px]">
                <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                <span className="text-gray-300">कार्यक्षेत्र:</span>
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
            <ul className="space-y-1 text-xs sm:text-sm">
              {[
                { name: "📚 बातमी संग्रह (Archive)", path: "/archive" },
                { name: "महाराष्ट्र", path: "/category/महाराष्ट्र" },
                { name: "राजकारण", path: "/category/राजकारण" },
                { name: "गुन्हेगारी (क्राईम)", path: "/category/गुन्हेगारी" },
                { name: "शेती व हवामान", path: "/category/शेती" },
                { name: "व्यापार व अर्थकारण", path: "/category/व्यापार" },
                { name: "क्रीडा", path: "/category/क्रीडा" },
                { name: "मनोरंजन", path: "/category/मनोरंजन" },
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-gray-200 hover:text-white transition-colors flex items-center space-x-2 py-2 px-2 rounded-lg hover:bg-white/10 min-h-[44px]"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-red rounded-full shrink-0"></span>
                    <span className="truncate">{item.name}</span>
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
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {MAHARASHTRA_DISTRICTS.slice(0, 14).map((district) => (
                <Link
                  key={district.slug}
                  to={`/district/${district.slug}`}
                  className="min-h-[44px] flex items-center px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/15 hover:text-amber-400 text-gray-200 transition-colors truncate border border-white/5"
                >
                  <span className="truncate">• {district.nameMarathi}</span>
                </Link>
              ))}
            </div>
            <Link 
              to="/location/district/महाराष्ट्र" 
              className="inline-flex items-center min-h-[44px] mt-3 py-2 px-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 hover:underline"
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
            
            <ul className="space-y-1 text-xs sm:text-sm">
              {[
                { name: "आमच्याबद्दल (About Us)", path: "/about" },
                { name: "संपर्क करा (Contact Us)", path: "/contact", isHighlight: true },
                { name: "गोपनीयता धोरण (Privacy Policy)", path: "/privacy-policy" },
                { name: "अटी आणि शर्ती (Terms & Conditions)", path: "/terms" },
                { name: "संपादकीय धोरण (Editorial Policy)", path: "/editorial-policy" },
                { name: "दुरुस्ती धोरण (Correction Policy)", path: "/correction-policy" },
                { name: "कुकी धोरण (Cookie Policy)", path: "/cookie-policy" },
                { name: "अस्वीकरण (Disclaimer)", path: "/disclaimer" },
                { name: "साइटमॅप (XML Sitemap)", path: "/sitemap.xml", isExternal: true },
              ].map((policy) => (
                <li key={policy.path}>
                  {policy.isExternal ? (
                    <a 
                      href={policy.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-white transition-colors flex items-center space-x-2 py-2 px-2 rounded-lg hover:bg-white/10 min-h-[44px]"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      <span className="truncate">{policy.name}</span>
                    </a>
                  ) : (
                    <Link 
                      to={policy.path} 
                      className="text-gray-200 hover:text-white transition-colors flex items-center space-x-2 py-2 px-2 rounded-lg hover:bg-white/10 min-h-[44px]"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      <span className={policy.isHighlight ? "font-bold text-amber-400 truncate" : "truncate"}>
                        {policy.name}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link 
                to="/contact?type=news_tip" 
                className="inline-flex items-center justify-center min-h-[44px] gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-brand-red text-white text-xs sm:text-sm font-bold rounded-xl transition-colors border border-white/15 w-full sm:w-auto"
              >
                <span>📢 बातमी पाठवा (Submit News Tip)</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Legal Strip & Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-200 gap-4 text-center md:text-left">
          <div>
            <p>&copy; {new Date().getFullYear()} <strong className="text-white">राज्यवाणी (Rajyavani)</strong>. सर्व हक्क राखीव. (All rights reserved).</p>
            <p className="text-[11px] text-gray-300 font-medium mt-1">
              महाराष्ट्राचे विश्वासार्ह डिजिटल वृत्तपत्र | संपादक: आकाश चव्हाण | संपर्क: 8459675917
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 text-xs text-gray-200">
            <Link to="/about" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">About Us</Link>
            <Link to="/contact" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">Contact Us</Link>
            <Link to="/privacy-policy" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">Terms</Link>
            <Link to="/disclaimer" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">Disclaimer</Link>
            <Link to="/editorial-policy" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">Editorial Policy</Link>
            <Link to="/correction-policy" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">Correction Policy</Link>
            <Link to="/cookie-policy" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-white rounded-md hover:bg-white/10 transition-colors">Cookie Policy</Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="px-2.5 py-2 min-h-[44px] inline-flex items-center hover:text-amber-400 rounded-md hover:bg-white/10 transition-colors font-medium">Sitemap (XML)</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
