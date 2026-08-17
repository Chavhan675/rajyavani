import fs from 'fs';
import path from 'path';
import { getCategoryFallbackImage } from '../lib/defaultImages.js';

// Setup local cache directory inside public or storage
const CACHE_DIR = path.join(process.cwd(), 'public', 'cached-news-images');
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (e) {
    console.warn('[Image Manager] Could not create image cache directory:', e);
  }
}

/**
 * Verify if a remote image URL is accessible and returns an image content-type.
 */
export async function verifyImageUrl(url: string, timeoutMs: number = 4000): Promise<{ valid: boolean; finalUrl?: string }> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { valid: false };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      return { valid: false };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.startsWith('image/') || contentType.includes('octet-stream')) {
      return { valid: true, finalUrl: response.url || url };
    }

    return { valid: false };
  } catch (e) {
    return { valid: false };
  }
}

/**
 * Ensures an article will have a 100% working image URL.
 * If source URL is valid, returns it; otherwise assigns a high-resolution category editorial fallback.
 */
export async function resolveWorkingArticleImage(
  sourceUrl?: string | null,
  category?: string,
  title?: string
): Promise<string> {
  if (sourceUrl) {
    const check = await verifyImageUrl(sourceUrl);
    if (check.valid && check.finalUrl) {
      return check.finalUrl;
    }
  }

  // Assign high-quality curated category image
  return getCategoryFallbackImage(category, title);
}
