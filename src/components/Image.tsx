import React, { useState, useEffect } from 'react';
import { getCategoryFallbackImage, getSvgEditorialPlaceholder } from '../lib/defaultImages';

/**
 * Optimizes image URLs (e.g. Unsplash) with compression factor, modern web format auto-negotiation, and width.
 */
export function optimizeImageUrl(url: string, targetWidth: number = 800, quality: number = 70): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Unsplash dynamic image optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'format,compress');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('w', targetWidth.toString());
      return parsed.toString();
    } catch {
      let optimized = url
        .replace(/([?&])q=\d+/, '$1q=' + quality)
        .replace(/([?&])w=\d+/, '$1w=' + targetWidth);
      if (!optimized.includes('auto=')) {
        optimized += (optimized.includes('?') ? '&' : '?') + 'auto=format,compress';
      }
      if (!optimized.includes('q=')) {
        optimized += (optimized.includes('?') ? '&' : '?') + `q=${quality}`;
      }
      if (!optimized.includes('w=')) {
        optimized += `&w=${targetWidth}`;
      }
      return optimized;
    }
  }

  return url;
}

/**
 * Generates responsive srcset for dynamic CDN images (Unsplash).
 */
export function getResponsiveSrcSet(url: string, quality: number = 70): string | undefined {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return undefined;
  }
  const widths = [360, 480, 640, 800, 1024, 1280];
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
      return '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 1200px';
    case 'social':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, 600px';
  }
}

/**
 * Gets standard intrinsic dimensions to prevent Cumulative Layout Shift (CLS)
 */
export function getIntrinsicDimensions(size: 'thumbnail' | 'card' | 'featured' | 'social') {
  switch (size) {
    case 'thumbnail':
      return { width: 240, height: 160 };
    case 'card':
      return { width: 600, height: 338 };
    case 'featured':
      return { width: 1200, height: 675 };
    case 'social':
      return { width: 1200, height: 630 };
    default:
      return { width: 800, height: 450 };
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
  const targetWidth = size === 'thumbnail' ? 240 : size === 'card' ? 600 : size === 'featured' ? 1200 : 800;
  const quality = size === 'featured' ? 75 : 68;
  const optimizedSrc = isSvg ? rawSrc : optimizeImageUrl(rawSrc, targetWidth, quality);
  const srcSet = isSvg ? undefined : getResponsiveSrcSet(rawSrc, quality);
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
    </div>
  );
}
