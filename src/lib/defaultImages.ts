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
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=70&w=800", // Mumbai Gateway
    "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=70&w=800", // Mumbai Skyline
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=70&w=800", // Pune / Sahyadri
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=70&w=800"  // Infrastructure / Metro
  ],
  "राजकारण": [
    "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=70&w=800", // Assembly/Government
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=70&w=800", // Parliament/Governance
    "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=70&w=800"  // Press Conference
  ],
  "शेती": [
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=70&w=800", // Indian Green Agriculture Field
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=70&w=800", // Farmer Agriculture
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=70&w=800"  // Crops & Farming
  ],
  "हवामान": [
    "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=70&w=800", // Heavy Monsoon Rain
    "https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&q=70&w=800", // Clouds / Weather
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=70&w=800"  // Sky / Storm Radar
  ],
  "गुन्हेगारी": [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=70&w=800", // Law & Justice Gavel
    "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&q=70&w=800", // Police Beacon / Law Enforcement
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=70&w=800"  // Investigation / Security
  ],
  "क्रीडा": [
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=70&w=800", // Cricket Match Stadium
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=70&w=800", // Cricket Ball & Pitch
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=70&w=800"  // Sports Arena / Athletics
  ],
  "व्यापार": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=70&w=800", // Stock Market / Financial Charts
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=70&w=800", // Economy / Business
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=70&w=800"  // Finance Growth
  ],
  "शिक्षण": [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=70&w=800", // Students / College
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=70&w=800", // Books / Education
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=70&w=800"  // Classroom / Exams
  ],
  "तंत्रज्ञान": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=70&w=800", // Technology Circuit / Chip
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=70&w=800", // Digital Innovation
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=70&w=800"  // Global Data Network
  ],
  "मनोरंजन": [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=70&w=800", // Cinema Hall
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=70&w=800", // Film Stage & Lights
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=70&w=800"  // Media Production
  ],
  "राष्ट्रीय": [
    "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=70&w=800", // India Gate / New Delhi
    "https://images.unsplash.com/photo-1598598795009-f80c5072e665?auto=format&fit=crop&q=70&w=800", // Tricolor / National
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=70&w=800"  // Historical Heritage
  ],
  "DEFAULT": [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=70&w=800", // News Paper / Press
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=70&w=800", // Breaking News Concept
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=70&w=800"  // Journal / Digital Media
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
 * Generate a standalone, lightweight SVG Data URI with high-end Rajyavani news branding.
 * Guaranteed to never fail, require zero network roundtrips, and look ultra crisp and beautiful on all screen sizes.
 */
export function getSvgEditorialPlaceholder(title?: string, category?: string): string {
  const displayCategory = (category || "राज्यवाणी विशेष").replace(/<[^>]*>?/gm, "").substring(0, 30);
  const displayTitle = (title || "महाराष्ट्राच्या ताज्या व विश्वासार्ह घडामोडी").replace(/<[^>]*>?/gm, "").substring(0, 75);

  const svg = `
<svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radiant Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="45%" stop-color="#18181B"/>
      <stop offset="85%" stop-color="#27272A"/>
      <stop offset="100%" stop-color="#3F3F46"/>
    </linearGradient>

    <!-- Ruby Crimson & Saffron Glow -->
    <radialGradient id="glowCrimson" cx="15%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#DC2626" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#DC2626" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowGold" cx="85%" cy="80%" r="60%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="50%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>

    <linearGradient id="goldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="675" fill="url(#bgGrad)"/>
  <rect width="1200" height="675" fill="url(#glowCrimson)"/>
  <rect width="1200" height="675" fill="url(#glowGold)"/>
  
  <!-- Subtle Architectural Newspaper Grid Pattern -->
  <g opacity="0.04" stroke="#FFFFFF" stroke-width="1.5">
    <path d="M0 75H1200M0 150H1200M0 225H1200M0 300H1200M0 375H1200M0 450H1200M0 525H1200M0 600H1200"/>
    <path d="M100 0V675M200 0V675M300 0V675M400 0V675M500 0V675M600 0V675M700 0V675M800 0V675M900 0V675M1000 0V675M1100 0V675"/>
  </g>
  
  <!-- Top Accent Bar -->
  <rect x="0" y="0" width="1200" height="10" fill="url(#accentGrad)"/>
  
  <!-- Brand Header & Seal Top Left -->
  <g transform="translate(80, 50)">
    <!-- Shield Logo Emblem -->
    <rect width="56" height="56" rx="16" fill="#DC2626" stroke="url(#goldSeal)" stroke-width="2"/>
    <circle cx="28" cy="28" r="20" stroke="#FDE68A" stroke-width="1" stroke-dasharray="3 2" opacity="0.8"/>
    <!-- Center Quill / Flame -->
    <path d="M28 14 C31 20 36 26 36 33 C36 38 32 41 28 41 C24 41 20 38 20 33 C20 26 25 20 28 14 Z" fill="url(#goldSeal)"/>
    <circle cx="28" cy="32" r="3" fill="#991B1B"/>

    <!-- Brand Typography -->
    <text x="70" y="34" fill="#FFFFFF" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="30" font-weight="900" letter-spacing="-0.5">राज्यवाणी</text>
    <text x="70" y="50" fill="#FBBF24" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="2">DIGITAL NEWS NETWORK</text>
  </g>

  <!-- Verified Badge Top Right -->
  <g transform="translate(970, 50)">
    <rect width="150" height="42" rx="21" fill="#18181B" stroke="#F59E0B" stroke-width="1.5"/>
    <circle cx="24" cy="21" r="8" fill="#10B981"/>
    <path d="M21 21 L23 23 L27 19" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="40" y="26" fill="#F3F4F6" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="13" font-weight="800">पडताळणीकृत वृत्त</text>
  </g>

  <!-- Category Highlight Pill -->
  <g transform="translate(80, 190)">
    <rect width="210" height="44" rx="10" fill="url(#accentGrad)"/>
    <text x="105" y="28" fill="#FFFFFF" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="17" font-weight="900" text-anchor="middle">${escapeXml(displayCategory)}</text>
  </g>

  <!-- Main Headline Title Box -->
  <g transform="translate(80, 270)">
    <text x="0" y="48" fill="#FFFFFF" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="-0.5">
      ${escapeXml(displayTitle)}
    </text>
  </g>

  <!-- Bottom Details & Editorial Watermark Footer -->
  <rect x="80" y="570" width="1040" height="1.5" fill="#3F3F46"/>
  <g transform="translate(80, 608)">
    <text x="0" y="0" fill="#D1D5DB" font-family="'Noto Sans Devanagari', system-ui, sans-serif" font-size="14" font-weight="700">
      महाराष्ट्राचा बुलंद आवाज • सत्य, अचूक आणि निष्पक्ष वृत्त
    </text>
    <text x="1040" y="0" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="end">
      WWW.RAJYAVANI.COM
    </text>
  </g>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return (unsafe || "").replace(/[<>&'"]/g, (c) => {
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
