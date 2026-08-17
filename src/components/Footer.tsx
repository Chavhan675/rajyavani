import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white pt-16 pb-8 border-t-4 border-brand-red mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-brand-red to-brand-saffron rounded-full flex items-center justify-center shadow-md border border-white/20">
                <span className="text-white font-bold text-xl">रा</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  राज्यवाणी
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              राज्यवाणी हे महाराष्ट्राचे क्रमांक १ चे AI-सक्षम डिजिटल न्यूज प्लॅटफॉर्म आहे. गाव, तालुका, जिल्हा ते राज्यभरातील प्रत्येक महत्त्वाची बातमी सर्वात आधी तुमच्यापर्यंत पोहोचवणे हे आमचे ध्येय आहे.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              महत्वाचे विभाग
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-brand-red"></span>
            </h3>
            <ul className="space-y-3">
              {["महाराष्ट्र", "राजकारण", "क्राईम", "शेती", "शिक्षण", "व्यापार"].map((item) => (
                <li key={item}>
                  <Link to={`/category/${item}`} className="text-gray-400 hover:text-brand-saffron transition-colors text-sm flex items-center space-x-2">
                    <span className="w-1 h-1 bg-brand-red rounded-full"></span>
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Local News */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              स्थानिक बातम्या
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-brand-red"></span>
            </h3>
            <ul className="space-y-3">
              {["मुंबई", "पुणे", "नागपूर", "नाशिक", "छत्रपती संभाजीनगर", "लातूर"].map((item) => (
                <li key={item}>
                  <Link to={`/location/district/${item}`} className="text-gray-400 hover:text-brand-saffron transition-colors text-sm flex items-center space-x-2">
                    <span className="w-1 h-1 bg-brand-red rounded-full"></span>
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              न्यूजलेटर सबस्क्राईब करा
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-brand-red"></span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              रोजच्या महत्त्वाच्या बातम्या थेट तुमच्या इनबॉक्समध्ये मिळवण्यासाठी सबस्क्राईब करा.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="तुमचा ईमेल आयडी" 
                className="bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-saffron"
              />
              <button className="bg-brand-red hover:bg-brand-saffron text-white font-bold py-2.5 rounded-md transition-colors text-sm">
                सबस्क्राईब करा
              </button>
            </form>
          </div>
        </div>

        {/* Copyright & Legal Links */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} राज्यवाणी (Rajyavani). All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/editorial-policy" className="hover:text-white transition-colors">Editorial Policy</Link>
            <Link to="/fact-checking" className="hover:text-white transition-colors">Fact Checking</Link>
            <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
