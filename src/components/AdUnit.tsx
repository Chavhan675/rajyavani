import React from 'react';
import { ExternalLink, Sparkles, Megaphone, ArrowUpRight, Flame, ShieldCheck, Newspaper, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Image from './Image';

export interface AdUnitProps {
  format?: 'horizontal' | 'rectangle' | 'vertical' | 'in-article' | 'billboard';
  className?: string;
  href?: string;
  title?: string;
  subtitle?: string;
  article?: any; // Related or featured news article
}

export default function AdUnit({ 
  format = 'horizontal', 
  className = '',
  href = '/contact',
  title,
  subtitle,
  article
}: AdUnitProps) {
  const isExternal = Boolean(href && (href.startsWith('http://') || href.startsWith('https://')));

  // 1. In-Article Format
  if (format === 'in-article') {
    return (
      <div className={`my-10 sm:my-12 w-full ${className}`}>
        {/* Top Header Label */}
        <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-2.5">
          <span className="flex items-center gap-1.5 text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
            {article ? 'संबंधित विशेष बातमी • FEATURED STORY' : 'विशेष जाहिरात व संधी • SPONSORED'}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            पडताळणीकृत (VERIFIED)
          </span>
        </div>

        {article ? (
          /* When related article is provided */
          <div className="group relative overflow-hidden rounded-3xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 p-5 sm:p-7 shadow-md hover:shadow-xl hover:border-amber-500 transition-all duration-300 backdrop-blur-xs">
            <div className="absolute -right-16 -bottom-16 w-52 h-52 bg-amber-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/30 transition-all" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-5 sm:gap-6">
              {/* Thumbnail Image */}
              <div className="w-full md:w-56 h-40 md:h-36 shrink-0 rounded-2xl overflow-hidden shadow-md relative bg-slate-100">
                <Image 
                  src={article.imageUrl}
                  alt={article.title}
                  category={article.category?.name || article.category || 'महाराष्ट्र'}
                  size="card"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                  {article.category?.name || article.category || 'विशेष'}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg mb-2">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>{title || "ट्रेंडिंग घडामोडी / RELATED STORY"}</span>
                </div>
                
                <h4 className="text-base sm:text-xl font-black text-slate-900 group-hover:text-brand-red transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                  {article.summary || subtitle || "वाचकांसाठी महत्त्वाची घडामोड आणि सविस्तर माहिती वाचण्यासाठी येथे क्लिक करा."}
                </p>

                {/* Bottom Call to Action */}
                <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    to={`/article/${article.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-red-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Newspaper className="w-4 h-4" />
                    <span>सविस्तर बातमी वाचा</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {href && isExternal && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border border-amber-400/60 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>अधिक माहिती</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isExternal ? (
          /* Standard Direct Sponsor Banner (External) */
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative overflow-hidden rounded-3xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 p-6 sm:p-8 shadow-md hover:shadow-xl hover:border-amber-500 transition-all duration-300 cursor-pointer backdrop-blur-xs"
          >
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/30 transition-all" />

            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Flame className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md mb-1.5">
                    HIGHLIGHT & OPPORTUNITIES
                  </div>
                  <h4 className="text-base sm:text-xl font-black text-slate-900 group-hover:text-amber-900 transition-colors leading-tight">
                    {title || "विशेष संधी आणि घडामोडी (Exclusive Updates)"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                    {subtitle || "आजच्या सर्वोत्तम संधी, योजना व विशेष माहिती जाणून घेण्यासाठी येथे भेट द्या."}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md group-hover:shadow-lg group-hover:from-amber-700 group-hover:to-orange-700 transition-all duration-300">
                <span>सविस्तर माहिती</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        ) : (
          /* Standard Direct Sponsor Banner */
          <Link
            to={href || "/contact"}
            className="group block relative overflow-hidden rounded-3xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 p-6 sm:p-8 shadow-md hover:shadow-xl hover:border-amber-500 transition-all duration-300 cursor-pointer backdrop-blur-xs"
          >
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/30 transition-all" />

            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Flame className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md mb-1.5">
                    HIGHLIGHT & OPPORTUNITIES
                  </div>
                  <h4 className="text-base sm:text-xl font-black text-slate-900 group-hover:text-amber-900 transition-colors leading-tight">
                    {title || "विशेष संधी आणि घडामोडी (Exclusive Updates)"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                    {subtitle || "आजच्या सर्वोत्तम संधी, योजना व विशेष माहिती जाणून घेण्यासाठी येथे भेट द्या."}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md group-hover:shadow-lg group-hover:from-amber-700 group-hover:to-orange-700 transition-all duration-300">
                <span>सविस्तर माहिती</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        )}
      </div>
    );
  }

  // 2. Rectangle Format
  if (format === 'rectangle') {
    return (
      <div className={`my-8 flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center justify-between w-full max-w-[360px] px-2 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            {article ? 'विशेष वृत्त / FEATURED' : 'जाहिरात / SPONSORED'}
          </span>
          <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">TRENDING</span>
        </div>

        {article ? (
          <div className="group relative w-full max-w-[360px] min-h-[320px] bg-white border-2 border-amber-200 hover:border-amber-400 rounded-3xl flex flex-col justify-between p-5 text-left shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-100">
              <Image 
                src={article.imageUrl}
                alt={article.title}
                category={article.category?.name || article.category || 'विशेष'}
                size="card"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white rounded-md text-[10px] font-black tracking-wide shadow-xs">
                FEATURED
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <h4 className="text-sm font-black text-slate-900 group-hover:text-brand-red transition-colors line-clamp-2 leading-snug mb-1.5">
                {article.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                {article.summary}
              </p>

              <Link
                to={`/article/${article.id}`}
                className="w-full py-2.5 px-4 bg-brand-red hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md cursor-pointer"
              >
                <span>सविस्तर वाचा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full max-w-[360px] min-h-[300px] bg-gradient-to-b from-white via-amber-50/40 to-orange-50/50 border-2 border-amber-200 hover:border-amber-400 rounded-3xl flex flex-col items-center justify-between p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black tracking-wide shadow-xs">
                EXCLUSIVE
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>

            <div className="my-auto flex flex-col items-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Megaphone className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                {title || "विशेष जाहिरात व ताज्या संधी"}
              </h4>
              <p className="text-xs text-slate-700 font-medium mt-1.5 max-w-[280px] leading-relaxed">
                {subtitle || "सर्वोत्कृष्ट संधी, नवीन योजना व माहितीसाठी येथे संपर्क करा"}
              </p>
            </div>

            <span className="w-full py-3 px-4 bg-slate-900 group-hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow-md">
              <span>अधिक माहिती</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        ) : (
          <Link
            to={href || "/contact"}
            className="group relative w-full max-w-[360px] min-h-[300px] bg-gradient-to-b from-white via-amber-50/40 to-orange-50/50 border-2 border-amber-200 hover:border-amber-400 rounded-3xl flex flex-col items-center justify-between p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black tracking-wide shadow-xs">
                EXCLUSIVE
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>

            <div className="my-auto flex flex-col items-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Megaphone className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                {title || "विशेष जाहिरात व ताज्या संधी"}
              </h4>
              <p className="text-xs text-slate-700 font-medium mt-1.5 max-w-[280px] leading-relaxed">
                {subtitle || "सर्वोत्कृष्ट संधी, नवीन योजना व माहितीसाठी येथे संपर्क करा"}
              </p>
            </div>

            <span className="w-full py-3 px-4 bg-slate-900 group-hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow-md">
              <span>अधिक माहिती</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        )}
      </div>
    );
  }

  // 3. Default 'horizontal' & 'billboard'
  return (
    <div className={`w-full my-8 sm:my-10 ${className}`}>
      {/* Top Tag & Verified Partner Bar */}
      <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span className="flex items-center gap-2 font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          {article ? 'विशेष बातमी • FEATURED ARTICLE' : 'विशेष संधी व घडामोडी • HIGHLIGHT'}
        </span>
        <span className="text-[9px] text-slate-400 font-bold">RAJYAVANI DIGITAL</span>
      </div>

      {article ? (
        /* Horizontal Banner with Article Connection */
        <div className="group relative w-full min-h-[110px] bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90 hover:from-amber-100 hover:via-amber-50 hover:to-orange-100 border-2 border-amber-200/90 hover:border-amber-400 flex flex-col md:flex-row items-center justify-between p-4 sm:p-5 overflow-hidden rounded-3xl transition-all duration-300 shadow-sm hover:shadow-lg gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left w-full md:w-auto">
            {/* Thumbnail */}
            <div className="w-20 h-20 sm:w-24 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-slate-100 relative">
              <Image 
                src={article.imageUrl}
                alt={article.title}
                category={article.category?.name || article.category || 'महाराष्ट्र'}
                size="card"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Text details */}
            <div className="flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2 py-0.5 bg-brand-red text-white text-[9px] font-black rounded-md uppercase">
                  {article.category?.name || article.category || 'FEATURED'}
                </span>
                <span className="text-[10px] text-amber-800 font-bold">
                  {title || "विशेष घडामोडी"}
                </span>
              </div>
              
              <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-brand-red transition-colors line-clamp-2 leading-tight">
                {article.title}
              </h4>
              
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">
                {article.summary || subtitle || "वाचकांसाठी विशेष पडताळलेले वृत्त - अधिक वाचण्यासाठी क्लिक करा"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end">
            <Link
              to={`/article/${article.id}`}
              className="px-5 py-2.5 bg-brand-red hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xs group-hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>सविस्तर बातमी वाचा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {href && isExternal && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="लिंक उघडा"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      ) : isExternal ? (
        /* Standard Horizontal Ad Unit (External) */
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-full min-h-[100px] bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90 hover:from-amber-100 hover:via-amber-50 hover:to-orange-100 border-2 border-amber-200/90 hover:border-amber-400 flex flex-col sm:flex-row items-center justify-between px-6 py-5 overflow-hidden rounded-3xl transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer gap-4"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md">FEATURED HIGHLIGHT</span>
                <h4 className="text-xs sm:text-base font-black text-slate-900 group-hover:text-amber-900 transition-colors">
                  {title || "विशेष संधी / Trending Opportunities"}
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
                {subtitle || "सर्वोत्कृष्ट संधी, नवीन योजना व महत्त्वाच्या माहितीसाठी येथे संपर्क करा"}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 group-hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs group-hover:shadow-md transition-all duration-300">
            <span>अधिक माहिती</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
      ) : (
        /* Standard Horizontal Ad Unit */
        <Link
          to={href || "/contact"}
          className="group relative w-full min-h-[100px] bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90 hover:from-amber-100 hover:via-amber-50 hover:to-orange-100 border-2 border-amber-200/90 hover:border-amber-400 flex flex-col sm:flex-row items-center justify-between px-6 py-5 overflow-hidden rounded-3xl transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer gap-4"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md">FEATURED HIGHLIGHT</span>
                <h4 className="text-xs sm:text-base font-black text-slate-900 group-hover:text-amber-900 transition-colors">
                  {title || "विशेष संधी / Trending Opportunities"}
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
                {subtitle || "सर्वोत्कृष्ट संधी, नवीन योजना व महत्त्वाच्या माहितीसाठी येथे संपर्क करा"}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 group-hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs group-hover:shadow-md transition-all duration-300">
            <span>अधिक माहिती</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}
    </div>
  );
}
