/**
 * Ultra-Fast In-Memory + Persistent Cache Store for Rajyavani
 * Provides 0ms instant rendering (SWR), link hover prefetching, and asset warm-up.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ArticleCacheStore {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private prefetchedIds: Set<string> = new Set();
  private prefetchedImages: Set<string> = new Set();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Warm up from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const homeCache = localStorage.getItem('rajyavani_homepage_cache_v2');
        if (homeCache) {
          const list = JSON.parse(homeCache);
          if (Array.isArray(list)) {
            this.set('homepage_articles', list);
            list.forEach((art: any) => {
              if (art.id) {
                this.set(`article_${art.id}`, art);
              }
            });
          }
        }
      } catch (e) {
        // Silent
      }
    }
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    return entry.data;
  }

  has(key: string): boolean {
    return this.memoryCache.has(key);
  }

  /**
   * Prefetch and warm up an article into memory so clicking a link opens in 0ms
   */
  async prefetchArticle(id: string): Promise<void> {
    if (!id || this.prefetchedIds.has(id) || this.has(`article_${id}`)) return;
    this.prefetchedIds.add(id);

    try {
      // 1. Try fetching via light API
      const res = await fetch(`/api/articles`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.articles)) {
          json.articles.forEach((art: any) => {
            if (art.id) {
              this.set(`article_${art.id}`, art);
            }
          });
        }
      }
    } catch (e) {
      // Non-blocking prefetch failure
    }
  }

  /**
   * Warm up image in browser cache
   */
  prefetchImage(url?: string | null): void {
    if (!url || typeof window === 'undefined' || this.prefetchedImages.has(url)) return;
    this.prefetchedImages.add(url);
    const img = new window.Image();
    img.decoding = 'async';
    img.src = url;
  }
}

export const articleCache = new ArticleCacheStore();
