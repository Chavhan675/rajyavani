import React, { useState, useEffect } from 'react';
import { getCategoryFallbackImage, getSvgEditorialPlaceholder } from '../lib/defaultImages';

/**
 * Optimizes image URLs (e.g. Unsplash) with WebP modern format, compression factor, and dimensions.
 */
export function optimizeImageUrl(url: string, targetWidth: number = 360, quality: number = 42): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Unsplash dynamic image optimization: Force WebP format and strict target width & compression
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'format,compress');
      parsed.searchParams.set('fm', 'webp');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('w', targetWidth.toString());
      return parsed.toString();
    } catch {
      let cleanUrl = url
        .replace(/([?&])q=\d+/g, '')
        .replace(/([?&])w=\d+/g, '')
        .replace(/([?&])fm=[^&]*/g, '')
        .replace(/([?&])auto=[^&]*/g, '')
        .replace(/([?&])fit=[^&]*/g, '');
      
      const delimiter = cleanUrl.includes('?') ? '&' : '?';
      return `${cleanUrl}${delimiter}auto=format,compress&fm=webp&fit=crop&q=${quality}&w=${targetWidth}`;
    }
  }

  return url;
}

/**
 * Generates compact, optimized responsive srcset for dynamic CDN images (Unsplash).
 */
export function getResponsiveSrcSet(url: string, size: 'thumbnail' | 'card' | 'featured' | 'social' = 'card', quality: number = 38): string | undefined {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return undefined;
  }
  const widths = size === 'thumbnail' 
    ? [100, 160] 
    : size === 'card' 
      ? [180, 300, 400] 
      : [360, 480, 720];
  return widths.map(w => `${optimizeImageUrl(url, w, quality)} ${w}w`).join(', ');
}

/**
 * Returns optimal sizes attribute based on display archetype.
 */
export function getResponsiveSizes(size: 'thumbnail' | 'card' | 'featured' | 'social'): string {
  switch (size) {
    case 'thumbnail':
      return '(max-width: 640px) 120px, 180px';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px';
    case 'featured':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 720px';
    case 'social':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, 360px';
  }
}

/**
 * Gets standard intrinsic dimensions to prevent Cumulative Layout Shift (CLS)
 */
export function getIntrinsicDimensions(size: 'thumbnail' | 'card' | 'featured' | 'social') {
  switch (size) {
    case 'thumbnail':
      return { width: 180, height: 120 };
    case 'card':
      return { width: 360, height: 202 };
    case 'featured':
      return { width: 720, height: 405 };
    case 'social':
      return { width: 720, height: 378 };
    default:
      return { width: 360, height: 202 };
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
  showLogoBadge?: boolean;
}

export default function Image({
  src,
  category,
  fallbackPrompt,
  alt,
  size = 'card',
  className = '',
  priority = false,
  showLogoBadge = false,
  ...props
}: ImageProps) {
  // Fallback stages:
  // Stage 0: direct src (if given)
  // Stage 1: server proxy for external 3rd-party images that might be CORS/hotlink blocked
  // Stage 2: curated high-resolution category editorial image
  // Stage 3: zero-network SVG editorial placeholder
  const initialUrl = (src && typeof src === 'string' && src.trim() !== '') ? src.trim() : null;

  const [stage, setStage] = useState<number>(() => (initialUrl ? 0 : 2));
  const [currentSrc, setCurrentSrc] = useState<string>(() => initialUrl || getCategoryFallbackImage(category, alt));
  const [isLoaded, setIsLoaded] = useState<boolean>(priority);

  useEffect(() => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      setStage(0);
      setCurrentSrc(src.trim());
    } else {
      setStage(2);
      setCurrentSrc(getCategoryFallbackImage(category, alt));
    }
    if (!priority) {
      setIsLoaded(false);
    }
  }, [src, category, alt, priority]);

  const handleError = () => {
    if (stage === 0) {
      // If original src was a non-unsplash external URL, try proxy first to bypass hotlinking blocks
      if (initialUrl && !initialUrl.includes('images.unsplash.com') && !initialUrl.startsWith('data:') && !initialUrl.startsWith('/')) {
        setStage(1);
        setCurrentSrc(`/api/images/proxy?url=${encodeURIComponent(initialUrl)}&category=${encodeURIComponent(category || '')}&title=${encodeURIComponent(alt || '')}`);
        setIsLoaded(false);
        return;
      }
      // Otherwise skip directly to curated category image
      setStage(2);
      setCurrentSrc(getCategoryFallbackImage(category, alt));
      setIsLoaded(false);
    } else if (stage === 1) {
      // Proxy failed -> Try stage 2: Curated category editorial image
      setStage(2);
      setCurrentSrc(getCategoryFallbackImage(category, alt));
      setIsLoaded(false);
    } else if (stage === 2) {
      // Curated CDN failed -> Try stage 3: Standalone SVG placeholder (guaranteed zero network roundtrip)
      setStage(3);
      setCurrentSrc(getSvgEditorialPlaceholder(alt, category));
      setIsLoaded(true);
    }
  };

  const rawSrc = (currentSrc && currentSrc.trim() !== '')
    ? currentSrc 
    : getCategoryFallbackImage(category, alt);

  if (!rawSrc || rawSrc.trim() === '') {
    return (
      <div className={`relative overflow-hidden bg-gray-950 ${className}`}>
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
  const targetWidth = size === 'thumbnail' ? 140 : size === 'card' ? 320 : size === 'featured' ? 480 : 360;
  const quality = 38;
  const optimizedSrc = isSvg ? rawSrc : optimizeImageUrl(rawSrc, targetWidth, quality);
  const srcSet = isSvg ? undefined : getResponsiveSrcSet(rawSrc, size, quality);
  const sizes = getResponsiveSizes(size);
  const dimensions = getIntrinsicDimensions(size);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Skeleton Shimmer when loading non-SVG */}
      {!isLoaded && !priority && stage !== 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-0" />
      )}

      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        width={dimensions.width}
        height={dimensions.height}
        alt={alt || "बातमी चित्र"}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover relative z-10 transition-opacity duration-300 ${
          priority || isLoaded || stage === 3
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
        {...props}
      />

      {/* Optional Beautiful Brand Watermark Pill Overlay */}
      {showLogoBadge && isLoaded && (
        <div className="absolute top-2 right-2 z-20 pointer-events-none select-none">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
            <span className="text-[10px] font-black font-serif text-amber-200">
              राज्यवाणी
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
