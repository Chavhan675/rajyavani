import { adminDb } from "../lib/firebase-admin.js";
import { MAHARASHTRA_DISTRICTS } from "../data/maharashtraDistricts.js";
import fs from "fs";
import path from "path";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  news?: {
    publicationName: string;
    publicationLanguage: string;
    publicationDate: string;
    title: string;
  };
}

const CATEGORIES = [
  'maharashtra',
  'politics',
  'crime',
  'agriculture',
  'education',
  'sports',
  'business',
  'entertainment',
  'national',
  'opinion',
  'technology'
];

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function generateSitemapXml(baseUrl: string = 'https://rajyavani.vercel.app'): Promise<string> {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const now = new Date().toISOString();

  const urls: SitemapUrl[] = [
    // Core pages
    { loc: `${cleanBaseUrl}/`, lastmod: now, changefreq: 'always', priority: '1.0' },
    { loc: `${cleanBaseUrl}/about`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBaseUrl}/contact`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBaseUrl}/privacy-policy`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBaseUrl}/editorial-policy`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBaseUrl}/fact-checking`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBaseUrl}/terms`, changefreq: 'monthly', priority: '0.4' },
  ];

  // Category pages
  for (const cat of CATEGORIES) {
    urls.push({
      loc: `${cleanBaseUrl}/category/${cat}`,
      lastmod: now,
      changefreq: 'hourly',
      priority: '0.8'
    });
  }

  // 36 Maharashtra District pages
  for (const dist of MAHARASHTRA_DISTRICTS) {
    urls.push({
      loc: `${cleanBaseUrl}/district/${dist.slug}`,
      lastmod: now,
      changefreq: 'hourly',
      priority: '0.8'
    });
  }

  // Fetch published articles from Firestore
  try {
    const snapshot = await adminDb.collection('articles')
      .where('status', '==', 'PUBLISHED')
      .orderBy('publishedAt', 'desc')
      .limit(1000)
      .get();

    snapshot.forEach(doc => {
      const data = doc.data();
      const pubDate = data.publishedAt 
        ? new Date(data.publishedAt).toISOString() 
        : (data.createdAt ? new Date(data.createdAt).toISOString() : now);

      urls.push({
        loc: `${cleanBaseUrl}/article/${doc.id}`,
        lastmod: pubDate,
        changefreq: 'daily',
        priority: '0.9'
      });
    });
  } catch (err) {
    console.warn("Could not fetch published articles for sitemap from adminDb:", err);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(u.loc)}</loc>\n`;
    if (u.lastmod) {
      xml += `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n`;
    }
    if (u.changefreq) {
      xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    }
    if (u.priority) {
      xml += `    <priority>${u.priority}</priority>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export async function generateGoogleNewsSitemapXml(baseUrl: string = 'https://rajyavani.vercel.app'): Promise<string> {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const now = new Date().toISOString();
  const fortyEightHoursAgo = Date.now() - (48 * 60 * 60 * 1000);

  const newsItems: Array<{ loc: string; pubDate: string; title: string; language: string }> = [];

  try {
    const snapshot = await adminDb.collection('articles')
      .where('status', '==', 'PUBLISHED')
      .orderBy('publishedAt', 'desc')
      .limit(500)
      .get();

    snapshot.forEach(doc => {
      const data = doc.data();
      const pubTimestamp = data.publishedAt || data.createdAt || Date.now();
      // Google News sitemaps only include articles published in the last 2 days
      if (pubTimestamp >= fortyEightHoursAgo) {
        newsItems.push({
          loc: `${cleanBaseUrl}/article/${doc.id}`,
          pubDate: new Date(pubTimestamp).toISOString(),
          title: data.title || 'राज्यवाणी बातमी',
          language: 'mr'
        });
      }
    });
  } catch (err) {
    console.warn("Could not fetch published news for news sitemap:", err);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const item of newsItems) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>राज्यवाणी (Rajyavani)</news:name>\n`;
    xml += `        <news:language>${escapeXml(item.language)}</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${escapeXml(item.pubDate)}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(item.title)}</news:title>\n`;
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export function generateRobotsTxt(baseUrl: string = 'https://rajyavani.vercel.app'): string {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  return `# Robots.txt for Rajyavani News Portal
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${cleanBaseUrl}/sitemap.xml
Sitemap: ${cleanBaseUrl}/news-sitemap.xml
`;
}

export async function writeStaticSitemapFiles(baseUrl: string = 'https://rajyavani.vercel.app') {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapContent = await generateSitemapXml(baseUrl);
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf-8');

    const newsSitemapContent = await generateGoogleNewsSitemapXml(baseUrl);
    fs.writeFileSync(path.join(publicDir, 'news-sitemap.xml'), newsSitemapContent, 'utf-8');

    const robotsContent = generateRobotsTxt(baseUrl);
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf-8');

    return { success: true };
  } catch (err: any) {
    console.error("Error writing static sitemap files:", err);
    return { success: false, error: err.message };
  }
}
