import React, { useState, useEffect } from 'react';
import { getCategoryFallbackImage, getSvgEditorialPlaceholder } from '../lib/defaultImages';

/**
 * Optimizes image URLs (e.g. Unsplash) with compression factor and appropriate width.
 */
export function optimizeImageUrl(url: string, targetWidth: number = 800, quality: number = 65): string {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('q', quality.toString());
    parsed.searchParams.set('w', targetWidth.toString());
    return parsed.toString();
  } catch {
    let optimized = url
      .replace(/([?&])q=\d+/, '$1q=' + quality)
      .replace(/([?&])w=\d+/, '$1w=' + targetWidth);
    if (!optimized.includes('q=')) {
      optimized += (optimized.includes('?') ? '&' : '?') + `q=${quality}`;
    }
    if (!optimized.includes('w=')) {
      optimized += `&w=${targetWidth}`;
    }
    return optimized;
  }
}

/**
 * Generates responsive srcset for Unsplash images.
 */
export function getResponsiveSrcSet(url: string, quality: number = 65): string | undefined {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return undefined;
  }
  const widths = [360, 600, 800, 1000, 1200];
  return widths.map(w => `${optimizeImageUrl(url, w, quality)} ${w}w`).join(', ');
}

/**
 * Returns optimal sizes attribute based on display archetype.
 */
export function getResponsiveSizes(size: 'thumbnail' | 'card' | 'featured' | 'social'): string {
  switch (size) {
    case 'thumbnail':
      return '(max-width: 640px) 120px, 240px';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px';
    case 'featured':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px';
    case 'social':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, 600px';
  }
}

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  category?: string;
  fallbackPrompt?: string;
  alt: string;
  size?: 'thumbnail' | 'card' | 'featured' | 'social';
  className?: string;
  priority?: boolean;
}

export default function Image({
  src,
  category,
  fallbackPrompt,
  alt,
  size = 'card',
  className = '',
  priority = false,
  ...props
}: ImageProps) {
  // Fallback stages:
  // 0: direct src (if given)
  // 1: curated high-resolution category image
  // 2: zero-network SVG editorial placeholder
  const getInitialSrc = () => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      return src.trim();
    }
    return getCategoryFallbackImage(category, alt);
  };

  const [stage, setStage] = useState<number>(() => (src && typeof src === 'string' && src.trim() !== '' ? 0 : 1));
  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(priority);

  useEffect(() => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      setStage(0);
      setCurrentSrc(src.trim());
    } else {
      setStage(1);
      setCurrentSrc(getCategoryFallbackImage(category, alt));
    }
    if (!priority) {
      setIsLoaded(false);
    }
  }, [src, category, alt, priority]);

  const handleError = () => {
    if (stage === 0) {
      // Try stage 1: Curated category editorial image
      setStage(1);
      const fallback = getCategoryFallbackImage(category, alt);
      setCurrentSrc(fallback);
      setIsLoaded(false);
    } else if (stage === 1) {
      // Try stage 2: Standalone SVG placeholder (always renders instantly, zero network roundtrip)
      setStage(2);
      const svgPlaceholder = getSvgEditorialPlaceholder(alt, category);
      setCurrentSrc(svgPlaceholder);
      setIsLoaded(true);
    }
  };

  const rawSrc = (currentSrc && currentSrc.trim() !== '')
    ? currentSrc 
    : getCategoryFallbackImage(category, alt);

  if (!rawSrc || rawSrc.trim() === '') {
    return (
      <div className={`relative overflow-hidden bg-gray-900 ${className}`}>
        <img
          src={getSvgEditorialPlaceholder(alt, category)}
          alt={alt || "बातमी चित्र"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Determine target width & quality
  const isSvg = rawSrc.startsWith('data:image/svg+xml');
  const targetWidth = size === 'thumbnail' ? 240 : size === 'card' ? 600 : size === 'featured' ? 800 : 1200;
  const quality = size === 'featured' ? 70 : 65;
  const optimizedSrc = isSvg ? rawSrc : optimizeImageUrl(rawSrc, targetWidth, quality);
  const srcSet = isSvg ? undefined : getResponsiveSrcSet(rawSrc, quality);
  const sizes = getResponsiveSizes(size);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Loading Skeleton Shimmer */}
      {!isLoaded && !priority && stage !== 2 && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt || "बातमी चित्र"}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover ${
          priority || isLoaded || stage === 2
            ? 'opacity-100' 
            : 'opacity-0 transition-opacity duration-300'
        }`}
        {...props}
      />
    </div>
  );
}
