import React, { useState, useEffect } from 'react';
import { getCategoryFallbackImage, getSvgEditorialPlaceholder } from '../lib/defaultImages';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  category?: string;
  fallbackPrompt?: string;
  alt: string;
  size?: 'thumbnail' | 'card' | 'featured' | 'social';
  className?: string;
}

export default function Image({
  src,
  category,
  fallbackPrompt,
  alt,
  size = 'card',
  className = '',
  ...props
}: ImageProps) {
  // Fallback stages:
  // 0: direct src (if given)
  // 1: proxy endpoint /api/images/proxy?url=...
  // 2: curated high-resolution category image
  // 3: zero-network SVG editorial placeholder
  const [stage, setStage] = useState<number>(() => (src ? 0 : 2));
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Whenever src changes, reset stage to 0 or 2
    if (src && src.trim() !== '') {
      setStage(0);
      setCurrentSrc(src);
    } else {
      setStage(2);
      setCurrentSrc(getCategoryFallbackImage(category, alt));
    }
    setIsLoaded(false);
  }, [src, category, alt]);

  const handleError = () => {
    if (stage === 0 && src && src.startsWith('http')) {
      // Try stage 1: Backend proxy bypass
      setStage(1);
      const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(src)}&category=${encodeURIComponent(category || '')}&title=${encodeURIComponent(alt || '')}`;
      setCurrentSrc(proxyUrl);
    } else if (stage <= 1) {
      // Try stage 2: High-res category editorial image
      setStage(2);
      const fallback = getCategoryFallbackImage(category, alt);
      setCurrentSrc(fallback);
    } else if (stage === 2) {
      // Try stage 3: Standalone SVG placeholder (always renders, no network needed)
      setStage(3);
      const svgPlaceholder = getSvgEditorialPlaceholder(alt, category);
      setCurrentSrc(svgPlaceholder);
      setIsLoaded(true);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Loading Skeleton Shimmer */}
      {!isLoaded && stage !== 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      <img
        src={currentSrc || getCategoryFallbackImage(category, alt)}
        alt={alt || "बातमी चित्र"}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
