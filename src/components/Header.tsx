import { Globe, Menu, Search, User, X, MapPin, ChevronDown, LogIn, LogOut, Bot, Bookmark, Settings, Sparkles, PhoneCall, ChevronRight } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState } from "react";
import { MAHARASHTRA_DISTRICTS } from "../data/maharashtraDistricts";
import { useAuth } from "../lib/AuthContext";
import AuthModal from "./AuthModal";
import UserProfileModal from "./UserProfileModal";
import BookmarksModal from "./BookmarksModal";

const languages = ["मराठी", "English", "हिंदी"];

// Primary Main Categories as requested
const primaryNavItems = [
  { name: "मुख्यपृष्ठ", path: "/" },
  { name: "महाराष्ट्र", path: "/category/महाराष्ट्र" },
  { name: "राजकारण", path: "/category/राजकारण" },
  { name: "शेती", path: "/category/शेती" },
  { name: "गुन्हेगारी", path: "/category/गुन्हेगारी" },
  { name: "शिक्षण", path: "/category/शिक्षण" },
  { name: "नोकरी", path: "/category/नोकरी" },
  { name: "व्यापार", path: "/category/व्यापार" },
  { name: "क्रीडा", path: "/category/क्रीडा" },
  { name: "मनोरंजन", path: "/category/मनोरंजन" },
  { name: "तंत्रज्ञान", path: "/category/तंत्रज्ञान" },
  { name: "आरोग्य", path: "/category/आरोग्य" },
  { name: "हवामान", path: "/category/हवामान" },
];

const regionalCategories = [
  { name: "मुंबई", path: "/location/district/मुंबई" },
  { name: "पुणे", path: "/location/district/पुणे" },
  { name: "मराठवाडा", path: "/category/मराठवाडा" },
  { name: "विदर्भ", path: "/category/विदर्भ" },
  { name: "उत्तर महाराष्ट्र", path: "/category/उत्तर महाराष्ट्र" },
  { name: "कोकण", path: "/category/कोकण" },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    user, 
    isSuperAdmin,
    setAuthModalOpen, 
    setAuthModalTab, 
    setProfileModalOpen, 
    setBookmarksModalOpen, 
    bookmarks,
    signOut 
  } = useAuth();

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

  const hasAdminAccess = isSuperAdmin;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs border-b border-gray-100">
      {/* Modals */}
      <AuthModal />
      <UserProfileModal />
      <BookmarksModal />

      {/* Top utility bar */}
      <div className="bg-brand-red text-white text-xs py-1.5 border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex space-x-3 items-center">
            <span className="font-bold tracking-wider uppercase text-[11px] bg-red-900/60 px-2 py-0.5 rounded">
              महाराष्ट्र न्यूज नेटवर्क
            </span>
            <span className="hidden sm:inline-block text-red-200">|</span>
            <span className="hidden sm:inline-block text-gray-100 text-[11px]">
              {new Date().toLocaleDateString("mr-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Quick 36 Districts Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                className="flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 px-3 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer border border-white/30"
                aria-label="Select District"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>३६ जिल्हे</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isDistrictDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
                  <div className="text-xs font-black text-brand-red border-b border-gray-100 pb-2 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>महाराष्ट्रातील ३६ जिल्हे (Live News)</span>
                    <span className="text-gray-400 font-normal">३६ जिल्हे</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {MAHARASHTRA_DISTRICTS.map((district) => (
                      <button
                        key={district.slug}
                        onClick={() => handleDistrictSelect(district.slug)}
                        className="text-left px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-brand-red rounded-lg transition-colors truncate"
                      >
                        {district.nameMarathi}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Contact link in top bar */}
            <Link 
              to="/contact" 
              className="text-[11px] font-bold text-white hover:text-yellow-200 transition-colors flex items-center gap-1 hidden md:flex"
            >
              <PhoneCall className="w-3 h-3" />
              <span>संपर्क (8459675917)</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-1 text-[11px] text-white/90">
              <Globe className="w-3.5 h-3.5 mr-0.5" />
              <span>मराठी आवृत्ती</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header / Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          
          {/* Mobile menu toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-brand-red p-1.5 cursor-pointer rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo & Tagline */}
          <Link to="/" className="flex flex-col items-center md:items-start group">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-red tracking-tight font-serif group-hover:opacity-95 transition-opacity">
              राज्यवाणी
            </h1>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-widest uppercase mt-0.5">
              महाराष्ट्राचा बुलंद आवाज • सत्य, अचूक, निष्पक्ष
            </span>
          </Link>

          {/* Actions: Search, Admin, Bookmarks, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Bookmarks */}
            {user && (
              <button
                onClick={() => setBookmarksModalOpen(true)}
                className="text-gray-600 hover:text-brand-red transition-colors p-2 rounded-full hover:bg-gray-100 relative cursor-pointer"
                title="जतन केलेल्या बातम्या"
                aria-label="Saved Bookmarks"
              >
                <Bookmark className="w-5 h-5" />
                {bookmarks.length > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-red text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {bookmarks.length}
                  </span>
                )}
              </button>
            )}

            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-600 hover:text-brand-red transition-colors p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              aria-label="Search"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            
            {/* Super Admin Desk */}
            {hasAdminAccess && (
              <Link to="/admin" className="hidden sm:flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-brand-red px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-red-200">
                <Bot className="w-4 h-4 text-brand-red" />
                <span>AI डेस्क</span>
              </Link>
            )}

            {/* User Auth / Profile */}
            <div className="relative">
              {user ? (
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-red text-white font-bold text-sm shadow-sm cursor-pointer border-2 border-white hover:opacity-90 transition-opacity"
                  aria-label="User Profile"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{(user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}</span>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setAuthModalTab('login');
                    setAuthModalOpen(true);
                  }}
                  type="button"
                  className="flex items-center space-x-1.5 bg-brand-red text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold hover:bg-brand-saffron transition-colors cursor-pointer shadow-sm"
                  aria-label="Login"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>लॉगिन</span>
                </button>
              )}

              {/* Profile Dropdown */}
              {isProfileOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 border-b border-gray-100 mb-1 bg-gray-50/70 rounded-xl">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'वापरकर्ता'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {isSuperAdmin ? (
                        <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" /> सुपर अ‍ॅडमीन (Owner)
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          वाचक (Reader)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {hasAdminAccess && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsProfileOpen(false)} 
                      className="flex items-center w-full text-left px-3 py-2 text-xs font-bold text-brand-red hover:bg-red-50 rounded-xl transition-colors mb-0.5"
                    >
                      <Bot className="w-4 h-4 mr-2 text-brand-red" />
                      <span>AI डेस्क व अ‍ॅडमीन</span>
                    </Link>
                  )}

                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      setProfileModalOpen(true);
                    }}
                    type="button"
                    className="flex items-center w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2 text-gray-500" />
                    <span>प्रोफाइल सेटिंग्ज</span>
                  </button>

                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      setBookmarksModalOpen(true);
                    }}
                    type="button"
                    className="flex items-center w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 mr-2 text-gray-500" />
                    <span>सेव्ह केलेल्या बातम्या ({bookmarks.length})</span>
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button 
                    onClick={() => { signOut(); setIsProfileOpen(false); }}
                    type="button"
                    className="flex items-center w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>बाहेर पडा (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Desktop Category Navigation */}
        <nav className="hidden md:flex items-center justify-between border-t border-b border-gray-200 mt-3 py-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1 lg:space-x-1.5 shrink-0">
            {primaryNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-2.5 py-1 text-xs sm:text-sm font-bold rounded-md transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'bg-brand-red text-white' 
                      : 'text-gray-800 hover:text-brand-red hover:bg-red-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Regional Quick Links in Secondary Strip */}
          <div className="hidden xl:flex items-center space-x-1 border-l border-gray-200 pl-3 shrink-0">
            {regionalCategories.map((r) => (
              <Link
                key={r.name}
                to={r.path}
                className="px-2 py-0.5 text-xs font-semibold text-gray-600 hover:text-brand-red hover:bg-gray-100 rounded transition-colors whitespace-nowrap"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </nav>
        
        {/* Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 shadow-lg animate-in slide-in-from-top-4 z-40">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-2">
              <input 
                type="text" 
                placeholder="बातम्या, जिल्हा, विषय, शेती किंवा क्राईम शोधा..." 
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-brand-red hover:bg-brand-saffron text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                शोधा
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white">
            <div className="flex flex-col space-y-1 mb-4">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-bold text-gray-800 hover:bg-red-50 hover:text-brand-red rounded-lg"
                >
                  {item.name}
                </Link>
              ))}

              {/* Regional categories on mobile */}
              <div className="border-t border-gray-100 my-2 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase px-3 block mb-1">
                  प्रादेशिक विभाग
                </span>
                <div className="grid grid-cols-2 gap-1 px-2">
                  {regionalCategories.map((r) => (
                    <Link
                      key={r.name}
                      to={r.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-red-50 rounded"
                    >
                      {r.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact Link */}
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-brand-red bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-between"
              >
                <span>📞 संपर्क (Contact Us)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              
              {/* Mobile Login / Profile */}
              {!user ? (
                <button
                  onClick={() => { 
                    setAuthModalTab('login');
                    setAuthModalOpen(true); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className="flex items-center px-3 py-2 text-sm font-bold text-brand-red hover:bg-red-50 rounded-lg text-left cursor-pointer"
                >
                  <LogIn className="w-4 h-4 mr-2" /> लॉगिन / नवीन खाते
                </button>
              ) : (
                <button
                  onClick={() => { 
                    setProfileModalOpen(true); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className="flex items-center px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 rounded-lg text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2 text-brand-red" /> माझी प्रोफाइल व सुरक्षा
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
