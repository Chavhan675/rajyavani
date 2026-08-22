import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdUnitProps {
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  href?: string;
}

export default function AdUnit({ 
  format = 'horizontal', 
  className = '',
  href = 'https://omg10.com/4/11630717'
}: AdUnitProps) {
  let sizeClasses = 'w-full h-[90px] min-h-[90px]';
  if (format === 'rectangle') sizeClasses = 'w-[300px] h-[250px] min-h-[250px] mx-auto';
  if (format === 'vertical') sizeClasses = 'w-[160px] h-[600px] min-h-[600px] mx-auto';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      style={{ contain: 'layout size' }}
      className={`group relative bg-gradient-to-r from-gray-50 via-slate-100 to-gray-50 hover:from-amber-50/50 hover:to-orange-50/50 border border-gray-200 hover:border-amber-300 text-gray-700 flex flex-col items-center justify-center overflow-hidden rounded-xl transition-all duration-300 shadow-xs hover:shadow-sm cursor-pointer ${sizeClasses} ${className}`}
    >
      <div className="absolute top-1.5 right-2 flex items-center gap-1 text-[9px] font-semibold text-gray-400 group-hover:text-amber-600 uppercase tracking-wider">
        <span>Sponsored</span>
        <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
      </div>

      <div className="flex flex-col items-center justify-center px-4 text-center">
        <span className="text-xs font-bold text-gray-800 group-hover:text-red-700 transition-colors">
          विशेष जाहिरात / Trending Deals
        </span>
        <span className="text-[11px] text-gray-500 group-hover:text-gray-700 font-medium mt-0.5 flex items-center gap-1">
          अधिक माहितीसाठी येथे क्लिक करा &rarr;
        </span>
      </div>
    </a>
  );
}

