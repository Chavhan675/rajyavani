import { Globe, Menu, Search, User, X, MapPin, ChevronDown, LogIn, LogOut, Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { MAHARASHTRA_DISTRICTS } from "../data/maharashtraDistricts";
import { useAuth } from "../lib/AuthContext";

const languages = ["मराठी", "English", "हिंदी", "বাংলা", "ਪੰਜਾਬੀ", "ગુજરાती", "தமிழ்", "తెలుగు"];

const navItems = [
  { name: "मुख्यपृष्ठ", path: "/" },
  { name: "महाराष्ट्र", path: "/category/महाराष्ट्र" },
  { name: "राष्ट्रीय", path: "/category/राष्ट्रीय" },
  { name: "राजकारण", path: "/category/राजकारण" },
  { name: "शेती", path: "/category/शेती" },
  { name: "गुन्हेगारी", path: "/category/गुन्हेगारी" },
  { name: "क्रीडा", path: "/category/क्रीडा" },
  { name: "मनोरंजन", path: "/category/मनोरंजन" },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, userRole, signIn, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleDistrictSelect = (slug: string) => {
    setIsDistrictDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/district/${slug}`);
  };

  const hasAdminAccess = userRole && ['ADMIN', 'EDITOR', 'REPORTER'].includes(userRole.role);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-brand-red text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <span className="font-semibold tracking-wider">MARATHI NEWS</span>
            <span className="hidden sm:inline-block">|</span>
            <span className="hidden sm:inline-block text-gray-200">
              {new Date().toLocaleDateString("mr-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick District Selector in Top Bar */}
            <div className="relative">
              <button
                onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                className="flex items-center space-x-1 bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer border border-white/20"
              >
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>३६ जिल्हे निवडा</span>
                <ChevronDown className="w-3 h-3 text-white/80" />
              </button>

              {isDistrictDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 max-h-96 overflow-y-auto">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1 border-b border-gray-100 mb-2 flex justify-between items-center">
                    <span>महाराष्ट्र ३६ जिल्हे</span>
                    <span className="text-[10px] text-brand-red font-semibold">निवडा व बातम्या वाचा</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <button
                        key={d.slug}
                        onClick={() => handleDistrictSelect(d.slug)}
                        className="text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 hover:text-brand-red transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">{d.nameMarathi}</span>
                        <span className="text-[9px] text-gray-400 group-hover:text-brand-red">#{d.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1 hover:text-gray-200 cursor-pointer">
              <Globe className="w-3.5 h-3.5" />
              <select className="bg-transparent border-none outline-none cursor-pointer text-xs font-semibold uppercase tracking-wider" aria-label="Select Language">
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="text-black">
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          {/* Logo area */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 text-gray-600 md:hidden mr-3"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-12 w-12 bg-gradient-to-br from-brand-red to-brand-saffron rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <span className="text-white font-bold text-2xl">रा</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-brand-black tracking-tight" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  राज्यवाणी
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-red -mt-1">
                  सत्य • वेगवान • विश्वासार्ह
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-bold transition-colors hover:text-brand-red ${
                  window.location.pathname === item.path ? "text-brand-red border-b-2 border-brand-red" : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-600 hover:text-brand-red transition-colors p-2 cursor-pointer"
              aria-label="Search"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            
            {hasAdminAccess && (
              <Link to="/admin" className="hidden sm:flex items-center space-x-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border border-gray-200">
                <Bot className="w-4 h-4 text-brand-red" />
                <span>AI डेस्क</span>
              </Link>
            )}

            {/* User Login/Profile */}
            <div className="relative">
              {user ? (
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-red text-white font-bold text-sm shadow-sm cursor-pointer border border-brand-red/20"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <span>{user.email?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </button>
              ) : (
                <button 
                  onClick={signIn}
                  className="hidden sm:flex items-center space-x-1 bg-brand-red text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-brand-saffron transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>लॉगिन</span>
                </button>
              )}

              {/* Profile Dropdown */}
              {isProfileOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  {hasAdminAccess && (
                    <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex sm:hidden items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Bot className="w-4 h-4 mr-2 text-brand-red" /> AI डेस्क (Admin)
                    </Link>
                  )}

                  <button 
                    onClick={() => { signOut(); setIsProfileOpen(false); }}
                    className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    बाहेर पडा (Logout)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-4 shadow-lg animate-in slide-in-from-top-4 z-40">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-2">
              <input 
                type="text" 
                placeholder="बातम्या, जिल्हा, विषय किंवा लेखक शोधा..." 
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="bg-brand-red text-white px-6 py-2 rounded-md font-bold hover:bg-brand-saffron transition-colors cursor-pointer">
                शोधा
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white">
            <div className="flex flex-col space-y-2 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-bold text-gray-800 hover:bg-red-50 hover:text-brand-red rounded-lg"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Login Button (if not logged in) */}
              {!user && (
                <button
                  onClick={() => { signIn(); setIsMobileMenuOpen(false); }}
                  className="flex items-center px-3 py-2 text-sm font-bold text-brand-red hover:bg-red-50 rounded-lg text-left"
                >
                  <LogIn className="w-4 h-4 mr-2" /> लॉगिन / नोंदणी
                </button>
              )}
            </div>

            {/* Mobile District Selector */}
            <div className="border-t border-gray-100 pt-3">
              <span className="text-xs font-extrabold text-gray-500 uppercase px-3 block mb-2">
                महाराष्ट्र ३६ जिल्हे (थेट बातम्या):
              </span>
              <div className="grid grid-cols-2 gap-1 px-2 max-h-56 overflow-y-auto">
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <button
                    key={d.slug}
                    onClick={() => handleDistrictSelect(d.slug)}
                    className="text-left px-2 py-1.5 text-xs font-semibold text-gray-700 hover:text-brand-red hover:bg-red-50 rounded"
                  >
                    {d.nameMarathi}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
