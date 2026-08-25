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
  private prefetchedRoutes: Set<string> = new Set();
  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

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

      // Schedule background idle warm-up of essential assets
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.warmupIdleAssets();
        });
      } else {
        setTimeout(() => this.warmupIdleAssets(), 2000);
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

  clear(key?: string): void {
    if (key) {
      this.memoryCache.delete(key);
    } else {
      this.memoryCache.clear();
      this.prefetchedIds.clear();
    }
  }

  /**
   * Prefetch and warm up an article into memory so clicking a link opens in 0ms
   */
  async prefetchArticle(id: string): Promise<void> {
    if (!id || this.prefetchedIds.has(id) || this.has(`article_${id}`)) return;
    this.prefetchedIds.add(id);

    try {
      // 1. Fetch targeted article by ID from ultra-fast server memory cache
      const res = await fetch(`/api/articles/${encodeURIComponent(id)}?withRelated=true`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.article) {
          this.set(`article_${id}`, json.article);
          if (json.article.imageUrl) {
            this.prefetchImage(json.article.imageUrl);
          }
          if (Array.isArray(json.relatedArticles)) {
            this.set(`related_${id}`, json.relatedArticles);
            json.relatedArticles.forEach((rel: any) => {
              if (rel.id) this.set(`article_${rel.id}`, rel);
            });
          }
        }
      }
    } catch (e) {
      // Non-blocking prefetch failure
    }
  }

  /**
   * Warm up image in browser cache with low priority & async decoding
   */
  prefetchImage(url?: string | null): void {
    if (!url || typeof window === 'undefined' || this.prefetchedImages.has(url)) return;
    this.prefetchedImages.add(url);
    try {
      const img = new window.Image();
      img.decoding = 'async';
      img.loading = 'lazy';
      img.src = url;
    } catch {}
  }

  /**
   * Preload dynamic route chunks ahead of time on hover
   */
  preloadRoute(routeName: 'article' | 'district' | 'archive' | 'legal' | 'contact' | 'admin'): void {
    if (typeof window === 'undefined' || this.prefetchedRoutes.has(routeName)) return;
    this.prefetchedRoutes.add(routeName);

    try {
      switch (routeName) {
        case 'article':
          import('../pages/ArticlePage');
          break;
        case 'district':
          import('../pages/DistrictPage');
          break;
        case 'archive':
          import('../pages/ArchivePage');
          break;
        case 'legal':
          import('../pages/LegalPage');
          break;
        case 'contact':
          import('../pages/ContactPage');
          break;
        case 'admin':
          import('../pages/AdminPage');
          break;
      }
    } catch {}
  }

  private warmupIdleAssets(): void {
    const articles = this.get<any[]>('homepage_articles');
    if (Array.isArray(articles)) {
      // Prefetch top 4 articles and their images
      articles.slice(0, 4).forEach((art) => {
        if (art.id) this.prefetchArticle(art.id);
        if (art.imageUrl) this.prefetchImage(art.imageUrl);
      });
    }
  }
}

export const articleCache = new ArticleCacheStore();
