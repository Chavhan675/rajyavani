import React from 'react';
import { Link } from 'react-router-dom';

export interface LogoProps {
  variant?: 'header' | 'compact' | 'badge' | 'hero' | 'watermark' | 'card-watermark' | 'icon-only' | 'footer';
  className?: string;
  showTagline?: boolean;
  linkToHome?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  pulse?: boolean;
}

/**
 * High-definition, beautifully crafted Rajyavani Vector Emblem and Typography Logo.
 * Designed with authentic Maharashtra journalism aesthetics: Royal Crimson, Saffron-Gold accents,
 * and crisp retina-ready SVG geometry.
 */
export default function Logo({
  variant = 'header',
  className = '',
  showTagline = true,
  linkToHome = true,
  theme = 'light',
  pulse = true
}: LogoProps) {

  // SVG Icon Seal / Emblem
  const renderEmblem = (size: number = 44) => (
    <div 
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-red via-orange-500 to-amber-400 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

      {/* Main Vector SVG */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-md transform transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Radial Golden Shield Gradient */}
          <radialGradient id="shieldGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="25%" stopColor="#FEF3C7" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>

          {/* Deep Crimson Center Gradient */}
          <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="35%" stopColor="#DC2626" />
            <stop offset="75%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          {/* Golden Ring Gradient */}
          <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Feather Pen / Torch Saffron Gradient */}
          <linearGradient id="torchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Shield / Seal Base */}
        <rect x="6" y="6" width="108" height="108" rx="30" fill="url(#crimsonGrad)" stroke="url(#goldRing)" strokeWidth="3.5" />
        
        {/* Inner Gold Decorative Ring */}
        <circle cx="60" cy="60" r="46" stroke="url(#goldRing)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.65" />
        
        {/* Inner Shield Backdrop */}
        <circle cx="60" cy="60" r="40" fill="#1C1917" opacity="0.45" />

        {/* Traditional Marathi Broadcast / Quill & Flame Emblem */}
        {/* Flame / Sunburst Petals */}
        <path d="M60 20 L64 34 L60 30 L56 34 Z" fill="url(#torchGrad)" />
        <path d="M42 26 L52 38 L48 35 L40 31 Z" fill="url(#torchGrad)" opacity="0.85" />
        <path d="M78 26 L80 31 L72 35 L68 38 Z" fill="url(#torchGrad)" opacity="0.85" />

        {/* News Quill & Broadcast Beacon */}
        <path 
          d="M60 32 C65 42 74 54 74 68 C74 76 68 82 60 82 C52 82 46 76 46 68 C46 54 55 42 60 32 Z" 
          fill="url(#shieldGrad)" 
          stroke="#78350F" 
          strokeWidth="1"
        />

        {/* Center Golden Star / Diamond of Truth (सत्य) */}
        <path d="M60 48 L63 56 L71 60 L63 64 L60 72 L57 64 L49 60 L57 56 Z" fill="#991B1B" />
        <circle cx="60" cy="60" r="3" fill="#FEF3C7" />

        {/* Dynamic Broadcast Waves (राज्यवाणी प्रसार) */}
        <path d="M30 60 C30 46 38 34 50 30" stroke="url(#goldRing)" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
        <path d="M22 60 C22 41 33 24 50 18" stroke="url(#goldRing)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <path d="M90 60 C90 46 82 34 70 30" stroke="url(#goldRing)" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
        <path d="M98 60 C98 41 87 24 70 18" stroke="url(#goldRing)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />

        {/* Devanagari Base Scroll (पाया) */}
        <path d="M36 88 C44 94 76 94 84 88 L80 94 C72 98 48 98 40 94 Z" fill="url(#shieldGrad)" />
        
        {/* Micro Seal Accent Dots */}
        <circle cx="60" cy="98" r="2.5" fill="#FBBF24" />
        <circle cx="50" cy="97" r="1.5" fill="#FBBF24" opacity="0.8" />
        <circle cx="70" cy="97" r="1.5" fill="#FBBF24" opacity="0.8" />
      </svg>

      {/* Live Pulsing Beacon */}
      {pulse && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-r from-amber-400 to-orange-500 border border-white shadow-xs" />
        </span>
      )}
    </div>
  );

  // 1. Icon Only
  if (variant === 'icon-only') {
    return renderEmblem(48);
  }

  // 2. Watermark overlay for news thumbnails / social cards
  if (variant === 'watermark' || variant === 'card-watermark') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-white shadow-lg select-none ${className}`}>
        {renderEmblem(18)}
        <span className="text-[11px] font-black tracking-wide font-serif text-amber-200">
          राज्यवाणी
        </span>
        <span className="text-[9px] font-bold text-amber-400/90 border-l border-amber-400/30 pl-1.5">
          पडताळणीकृत
        </span>
      </div>
    );
  }

  // 3. Compact Navbar Logo
  if (variant === 'compact') {
    const content = (
      <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
        {renderEmblem(36)}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight font-serif text-brand-red group-hover:text-red-700 transition-colors">
              राज्यवाणी
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-brand-red text-white uppercase tracking-wider">
              LIVE
            </span>
          </div>
          {showTagline && (
            <span className="text-[9px] font-extrabold text-slate-600 tracking-wider uppercase">
              महाराष्ट्राचा बुलंद आवाज
            </span>
          )}
        </div>
      </div>
    );

    return linkToHome ? <Link to="/">{content}</Link> : content;
  }

  // 4. Hero / Grand Editorial Masthead
  if (variant === 'hero') {
    const content = (
      <div className={`flex flex-col items-center text-center group cursor-pointer select-none ${className}`}>
        <div className="mb-2">
          {renderEmblem(64)}
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-serif bg-gradient-to-r from-red-700 via-brand-red to-orange-600 bg-clip-text text-transparent drop-shadow-xs">
          राज्यवाणी
        </h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 tracking-widest uppercase">
          <span className="h-[1px] w-8 bg-amber-400" />
          <span>महाराष्ट्राचे अग्रगण्य डिजिटल वृत्तपत्र</span>
          <span className="h-[1px] w-8 bg-amber-400" />
        </div>
        <p className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">
          सत्य • अचूक • निष्पक्ष | ३६ जिल्हे, ३५८ तालुके
        </p>
      </div>
    );

    return linkToHome ? <Link to="/">{content}</Link> : content;
  }

  // 5. Footer Variant
  if (variant === 'footer') {
    const content = (
      <div className={`flex items-center gap-3.5 group cursor-pointer select-none ${className}`}>
        {renderEmblem(44)}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-serif text-white group-hover:text-amber-300 transition-colors">
              राज्यवाणी
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest">
              DIGITAL
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-widest uppercase mt-0.5">
            महाराष्ट्राचा बुलंद आवाज • स्वतंत्र पत्रकारिता
          </span>
        </div>
      </div>
    );

    return linkToHome ? <Link to="/">{content}</Link> : content;
  }

  // 6. Default Header Logo
  const headerContent = (
    <div className={`flex items-center gap-3 sm:gap-4 group cursor-pointer select-none ${className}`}>
      {renderEmblem(46)}
      
      <div className="flex flex-col text-left">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-4xl md:text-5xl font-black text-brand-red tracking-tight font-serif group-hover:text-red-700 transition-colors">
            राज्यवाणी
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
            DIGITAL
          </span>
        </div>
        
        {showTagline && (
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] font-black text-slate-800 tracking-wider uppercase mt-0.5">
            <span className="text-brand-red font-black">●</span>
            <span>महाराष्ट्राचा बुलंद आवाज</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-600 hidden sm:inline">सत्य, अचूक, निष्पक्ष</span>
          </div>
        )}
      </div>
    </div>
  );

  return linkToHome ? <Link to="/">{headerContent}</Link> : headerContent;
}
