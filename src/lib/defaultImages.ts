/**
 * Curated high-resolution, royalty-free news editorial images
 * for Maharashtra & Indian regional journalism categories.
 */

export interface CategoryDefaultImage {
  category: string;
  images: string[];
  svgFallback: string;
}

export const CATEGORY_DEFAULT_IMAGES: Record<string, string[]> = {
  "महाराष्ट्र": [
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=1200", // Mumbai Gateway
    "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=1200", // Mumbai Skyline
    "https://images.unsplash.com/photo-1566552881560-0be86c53210f?auto=format&fit=crop&q=80&w=1200", // Pune / Sahyadri
    "https://images.unsplash.com/photo-1627917242194-e3fb639a0ef2?auto=format&fit=crop&q=80&w=1200"  // Infrastructure / Metro
  ],
  "राजकारण": [
    "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=1200", // Assembly/Government
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200", // Parliament/Governance
    "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=1200"  // Press Conference
  ],
  "शेती": [
    "https://images.unsplash.com/photo-1592982537447-6f2334259b3f?auto=format&fit=crop&q=80&w=1200", // Indian Green Agriculture Field
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200", // Farmer Agriculture
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=1200"  // Crops & Farming
  ],
  "हवामान": [
    "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80&w=1200", // Heavy Monsoon Rain
    "https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&q=80&w=1200", // Clouds / Weather
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=1200"  // Sky / Storm Radar
  ],
  "गुन्हेगारी": [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", // Law & Justice Gavel
    "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&q=80&w=1200", // Police Beacon / Law Enforcement
    "https://images.unsplash.com/photo-1453733197781-70d2de820992?auto=format&fit=crop&q=80&w=1200"  // Investigation / Security
  ],
  "क्रीडा": [
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200", // Cricket Match Stadium
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1200", // Cricket Ball & Pitch
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200"  // Sports Arena / Athletics
  ],
  "व्यापार": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200", // Stock Market / Financial Charts
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200", // Economy / Business
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200"  // Finance Growth
  ],
  "शिक्षण": [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200", // Students / College
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200", // Books / Education
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200"  // Classroom / Exams
  ],
  "तंत्रज्ञान": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200", // Technology Circuit / Chip
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200", // Digital Innovation
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200"  // Global Data Network
  ],
  "मनोरंजन": [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200", // Cinema Hall
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200", // Film Stage & Lights
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200"  // Media Production
  ],
  "राष्ट्रीय": [
    "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=1200", // India Gate / New Delhi
    "https://images.unsplash.com/photo-1598598795009-f80c5072e665?auto=format&fit=crop&q=80&w=1200", // Tricolor / National
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1200"  // Historical Heritage
  ],
  "DEFAULT": [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200", // News Paper / Press
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200", // Breaking News Concept
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200"  // Journal / Digital Media
  ]
};

/**
 * Deterministically pick an editorial image based on category and article title/seed.
 */
export function getCategoryFallbackImage(category?: string, seedText?: string): string {
  const normCategory = (category || "").trim();
  let list = CATEGORY_DEFAULT_IMAGES[normCategory];

  if (!list || list.length === 0) {
    // Try matching partial keywords
    const keys = Object.keys(CATEGORY_DEFAULT_IMAGES);
    const matchedKey = keys.find(k => normCategory.includes(k) || k.includes(normCategory));
    list = matchedKey ? CATEGORY_DEFAULT_IMAGES[matchedKey] : CATEGORY_DEFAULT_IMAGES["DEFAULT"];
  }

  if (!list || list.length === 0) {
    list = CATEGORY_DEFAULT_IMAGES["DEFAULT"];
  }

  const seed = (seedText || normCategory || "rajyavani").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(seed) % list.length;
  return list[index];
}

/**
 * Generate a standalone, lightweight SVG Data URI with Rajyavani news branding.
 * Guaranteed to never fail, require zero network roundtrips, and look crisp on Retina displays.
 */
export function getSvgEditorialPlaceholder(title?: string, category?: string): string {
  const displayCategory = (category || "राज्यवाणी विशेष").replace(/<[^>]*>?/gm, "").substring(0, 30);
  const displayTitle = (title || "ताज्या घडामोडी").replace(/<[^>]*>?/gm, "").substring(0, 70);

  const svg = `
<svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="50%" stop-color="#1F2937"/>
      <stop offset="100%" stop-color="#374151"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bgGrad)"/>
  
  <!-- Subtle News Grid Pattern -->
  <g opacity="0.06">
    <path d="M0 75H1200M0 150H1200M0 225H1200M0 300H1200M0 375H1200M0 450H1200M0 525H1200M0 600H1200" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M150 0V675M300 0V675M450 0V675M600 0V675M750 0V675M900 0V675M1050 0V675" stroke="#FFFFFF" stroke-width="2"/>
  </g>
  
  <!-- Accent Border Top -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#accentGrad)"/>
  
  <!-- Brand Badge Top Right -->
  <g transform="translate(1000, 45)">
    <rect width="140" height="36" rx="18" fill="#DC2626"/>
    <text x="70" y="23" fill="#FFFFFF" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">राज्यवाणी</text>
  </g>

  <!-- Category Pill -->
  <g transform="translate(80, 200)">
    <rect width="200" height="38" rx="6" fill="#F59E0B"/>
    <text x="100" y="24" fill="#111827" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${escapeXml(displayCategory)}</text>
  </g>

  <!-- Title Text Box -->
  <g transform="translate(80, 290)">
    <text x="0" y="40" fill="#F9FAFB" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="44" font-weight="800" letter-spacing="-0.5">
      ${escapeXml(displayTitle)}
    </text>
  </g>

  <!-- Bottom Details Bar -->
  <rect x="80" y="580" width="1040" height="1" fill="#4B5563"/>
  <text x="80" y="620" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="16" font-weight="500">
    RAJYAVANI DIGITAL NEWS NETWORK • MAHARASHTRA
  </text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
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
