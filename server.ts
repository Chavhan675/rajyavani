import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";
import { requireAuth, AuthRequest } from "./src/middleware/auth.js";
import { adminAuth } from "./src/lib/firebase-admin.js";
import fs from "fs";
import { generateContentWithRetry } from "./src/services/geminiClient.js";

// Load config for REST calls
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));

export const SUPER_ADMIN_EMAILS = [
  'chavhanakash675@gmail.com',
  'admin@rajyavani.com'
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

async function getUserRoleREST(uid: string, token: string) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/users/${uid}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.fields?.role?.stringValue;
  } catch (e) {
    console.error("REST role fetch failed", e);
    return null;
  }
}

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini API
const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// Response schema for the AI Editor
const articleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    headline: {
      type: Type.STRING,
      description: "A powerful, catchy, and SEO-optimized Marathi headline (accurate, engaging, under 20 words).",
    },
    summary: {
      type: Type.STRING,
      description: "A comprehensive 2-4 sentence executive summary of the news providing the full crux.",
    },
    content: {
      type: Type.STRING,
      description: "The full, exhaustive long-form news article of AT LEAST 1,000 WORDS (minimum 1,000 to 2,500+ words) written in professional Marathi journalistic prose with rich HTML formatting (<p>, <h3>, <blockquote>, <ul>, <li>, <div class=\"news-faq-box\">, <div class=\"news-summary-box\">). Must be comprehensive and deep under every section.",
    },
    category: {
      type: Type.STRING,
      description: "The primary category (e.g., महाराष्ट्र, राजकारण, क्राईम, शेती, शिक्षण, क्रीडा, व्यापार, मनोरंजन, राष्ट्रीय)",
    },
    district: {
      type: Type.STRING,
      description: "The relevant district in Maharashtra, if any (in Marathi).",
    },
    taluka: {
      type: Type.STRING,
      description: "The relevant taluka, if any (in Marathi).",
    },
    village: {
      type: Type.STRING,
      description: "The relevant village, if any (in Marathi).",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4-8 relevant SEO tags in Marathi.",
    },
    isDeveloping: {
      type: Type.BOOLEAN,
      description: "True if this is a developing/breaking story where facts are still emerging.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "Highly detailed, descriptive ENGLISH prompt to generate an AI illustration for this news. Include styles like 'cinematic lighting, photojournalism, editorial photography'.",
    },
    imageAlt: {
      type: Type.STRING,
      description: "Descriptive alt text for the image in Marathi",
    },
    requiresHumanReview: {
      type: Type.BOOLEAN,
      description: "True if the AI is uncertain about facts or if the sources conflict.",
    },
  },
  required: ["headline", "summary", "content", "category", "tags", "isDeveloping", "requiresHumanReview"],
};

app.post("/api/generate-article", requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const isOwner = isSuperAdminEmail(req.user?.email);
    const rawToken = req.headers.authorization!.split('Bearer ')[1];
    const userRole = await getUserRoleREST(req.user!.uid, rawToken);
    
    // Super Admin / Owner always has unconditional access
    if (!isOwner && (!userRole || userRole === 'USER')) {
      return res.status(403).json({ error: "Insufficient permissions to generate articles" });
    }
    const { rawFacts, sources } = req.body;
    
    if (!rawFacts) {
      return res.status(400).json({ error: "rawFacts is required" });
    }

    const ai = getAiClient();
    
    const prompt = `You are the Senior Chief Investigative Journalist and Executive Editor for 'Rajyavani' (राज्यवाणी), Maharashtra's premier digital news publication.
Your mission is to craft an EXHAUSTIVE, IN-DEPTH, FACT-BASED, and AUTHORITATIVE news article in Marathi, matching the highest editorial standards of leading national newspapers and investigative news organizations.

CRITICAL DIRECTIVE: Every article must provide complete, end-to-end coverage so that readers never need to search for another source. You must explicitly address all key journalistic questions one by one in rich, thorough detail.

MANDATORY JOURNALISTIC QUESTIONS TO ANSWER IN DETAIL (ONE BY ONE):
1. काय घडले? (What happened?) - Comprehensive, objective explanation of the incident or announcement.
2. कधी घडले? (When did it happen?) - Exact date, time, and period of occurrence.
3. कुठे घडले? (Where did it happen?) - Exact location specifying Village (गाव), Taluka (तालुका), District (जिल्हा), and State (राज्य).
4. का घडले? (Why did it happen?) - Underlying causes, motives, policy triggers, or environmental factors.
5. कसे घडले? (How did it happen?) - Step-by-step chronological mechanics of how the event unfolded.
6. कोण सहभागी होते? (Who was involved?) - Key figures, organizations, authorities, political leaders, or accused/victims.
7. कोणावर प्रभाव पडला? (Who was affected?) - Citizens, farmers, students, workers, commuters, traders, or specific communities.
8. या घटनेची मूळ पार्श्वभूमी काय? (What is the background?) - Historical context, earlier policies, or disputes leading to this.
9. कोणत्या पूर्वघटना कारणीभूत ठरल्या? (What events led to this incident?) - Preceding chain of events.
10. ताज्या घडामोडी व सद्यस्थिती काय आहे? (What are the latest developments?) - Ground reality right now.
11. प्रशासन, पोलीस, न्यायालय किंवा रुग्णालयाची कारवाई काय? (What actions have authorities taken?) - Police FIRs, arrests, SIT, court orders, medical care, or relief funds.
12. अधिकारी, तज्ज्ञ व प्रत्यक्षदर्शींची विधाने काय आहेत? (What are officials & experts saying?) - Verified quotes from collectors, ministers, police, or domain experts.
13. जनजीवन, शेती, शिक्षण व अर्थव्यवस्थेवर काय परिणाम होणार? (What is the broader impact?) - Short-term and long-term socio-economic impact.
14. पुढे काय होणार? (What happens next?) - Upcoming court hearings, committee deadlines, or expected next moves.

MANDATORY EDITORIAL STRUCTURE (HTML FORMATTING):
Format the 'content' field using clean HTML (<p>, <h3>, <blockquote>, <ul>, <li>, <div>) in this exact sequence:

1. मुख्य प्रस्तावना (Lead Paragraph): Powerful introductory hook answering the core event and its immediate significance.
2. <h3>सविस्तर घटना आणि कारणे (Detailed Event Explanation & Causes)</h3>: Full, detailed paragraphs explaining what happened, why it happened, and who was involved.
3. <h3>घटनास्थळ आणि भौगोलिक संदर्भ (Location & Geographic Context)</h3>: Village, Taluka, District details and terrain/regional context.
4. <h3>घडामोडींचा सविस्तर घटनाक्रम (Chronological Timeline of Events)</h3>: Step-by-step chronological timeline of major moments.
5. <h3>पार्श्वभूमी, मूळ संदर्भ आणि इतिहास (Background & Preceding History)</h3>: Historical factors and previous related incidents.
6. <h3>अधिकृत विधाने आणि प्रशासकीय भूमिका (Official Statements & Quotes)</h3>: Direct and reported statements from police, ministers, or district collectors (use <blockquote>).
7. <h3>स्थानिक नागरिक व प्रत्यक्षदर्शींच्या प्रतिक्रिया (Public & Ground Reactions)</h3>: Voices of affected residents, farmers, or community members.
8. <h3>तपास, न्यायालयीन प्रक्रिया आणि शासकीय कारवाई (Investigation & Legal Action)</h3>: Detailed reports on police FIRs, investigations, relief compensation, or administrative orders.
9. <h3>जनजीवन, व्यापार व स्थानिक घटकांवरील परिणाम (Public & Economic Impact Analysis)</h3>: In-depth impact analysis on daily life, transportation, businesses, or agriculture.
10. <h3>महत्त्वाची आकडेवारी व तथ्ये (Key Facts & Statistics)</h3>:
    <ul>
      <li>[महत्त्वाची आकडेवारी / तथ्य १]</li>
      <li>[महत्त्वाची आकडेवारी / तथ्य २]</li>
      <li>[महत्त्वाची आकडेवारी / तथ्य ३]</li>
    </ul>
11. <h3>पुढील घडामोडी आणि काय अपेक्षित आहे? (Future Outlook & Next Steps)</h3>: Forthcoming developments, hearings, or administrative decisions.
12. <h3>वारंवार विचारले जाणारे प्रश्न (FAQ)</h3>:
    <div class="news-faq-box">
      <h4>❓ वारंवार विचारले जाणारे प्रश्न (FAQ)</h4>
      <div class="faq-item">
        <p class="faq-question"><strong>प्रश्न १: [या घटनेतील सर्वात महत्त्वाचा प्रश्न?]</strong></p>
        <p class="faq-answer">उत्तर: [सविस्तर, अभ्यासपूर्ण उत्तर]</p>
      </div>
      <div class="faq-item">
        <p class="faq-question"><strong>प्रश्न २: [सर्वसामान्य नागरिक किंवा शेतकरी/व्यापाऱ्यांवर याचा काय परिणाम होईल?]</strong></p>
        <p class="faq-answer">उत्तर: [सविस्तर उत्तर]</p>
      </div>
      <div class="faq-item">
        <p class="faq-question"><strong>प्रश्न ३: [प्रशासन किंवा पोलिसांकडून पुढील पाऊल काय असणार आहे?]</strong></p>
        <p class="faq-answer">उत्तर: [सविस्तर उत्तर]</p>
      </div>
    </div>
13. <h3>निष्कर्ष (Conclusion)</h3>: A balanced, professional closing perspective on the story.
14. 📌 बातमीचे ठळक मुद्दे (Summary Box at the End):
    <div class="news-summary-box">
      <h4>📌 बातमीचे ठळक मुद्दे (Key Takeaways)</h4>
      <ul>
        <li>[ठळक मुद्दा १: प्रमुख घटना व निष्कर्ष]</li>
        <li>[ठळक मुद्दा २: मुख्य कारण व सहभागी घटक]</li>
        <li>[ठळक मुद्दा ३: प्रशासकीय/कायदेशीर कारवाई]</li>
        <li>[ठळक मुद्दा ४: स्थानिक जनजीवनावरील परिणाम]</li>
        <li>[ठळक मुद्दा ५: पुढील अपेक्षित घडामोड]</li>
      </ul>
    </div>

RULES:
- MANDATORY MINIMUM WORD COUNT: The 'content' field MUST BE AT LEAST 1,000 WORDS (strictly 1,000 to 2,500+ words). Any article with fewer than 1,000 words is strictly rejected. Provide detailed, multi-paragraph reporting under each section with rich background, investigative facts, statistics, and official context.
- Language: High-quality, authentic, grammatical Marathi journalistic prose.
- Integrity: Never invent fake facts or quotes. Clearly mention if certain details are still officially unconfirmed.

Raw facts / sources provided:
"${rawFacts}"

Source URLs / Reference Context:
${sources || 'None provided'}

Generate the comprehensive, long-form Marathi news article according to the schema.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.7-flash",
      preferredModels: ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"],
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        temperature: 0.2,
        maxOutputTokens: 8192,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      if (!result.imageUrl) {
        result.imageUrl = getCategoryFallbackImage(result.category, result.headline);
      }
      res.json(result);
    } else {
      throw new Error("No text returned from Gemini");
    }

  } catch (error: any) {
    console.error("Error generating article:", error);
    res.status(500).json({ error: error.message || "Failed to generate article" });
  }
});

// Endpoint to expand any existing short article into a full 1000+ word comprehensive report
app.post("/api/expand-article", async (req, res) => {
  try {
    const { title, summary, content, category, district } = req.body;

    if (!title && !content) {
      return res.status(400).json({ error: "Title or content is required to expand" });
    }

    const expandPrompt = `You are the Chief Editor and Senior Investigative Journalist for 'राज्यवाणी' (Rajyavani).
Your task is to take the following existing short draft or news brief and EXPAND it into a COMPREHENSIVE, HIGHLY DETAILED, EXHAUSTIVE MARATHI NEWS ARTICLE OF MINIMUM 1,000 WORDS (1,000 to 2,500+ words).

Existing Headline: "${title || ''}"
Existing Summary: "${summary || ''}"
Category: "${category || 'महाराष्ट्र'}"
District: "${district || ''}"
Existing Draft Content:
"${content || ''}"

CRITICAL EDITORIAL MANDATE (STRICT MINIMUM 1,000 WORDS):
- Write an authoritative, deep, engaging Marathi journalistic masterpiece.
- The 'content' field MUST systematically cover all 14 investigative questions with rich details, rich HTML paragraphs, subheadings, quotes, FAQs, and key takeaways:
1. SEO headline (headline)
2. In-depth lead paragraph (<p><strong>शहर/स्थान:</strong> ...</p>)
3. <h3>१. काय आणि कधी घडले? (What & When Happened)</h3>
4. <h3>२. घटनास्थळ आणि भौगोलिक संदर्भ (Geographic Details & Location)</h3>
5. <h3>३. घडामोडींचा सविस्तर घटनाक्रम (Timeline of Events)</h3>
6. <h3>४. पार्श्वभूमी, मूळ संदर्भ आणि इतिहास (Background & Preceding Context)</h3>
7. <h3>५. प्रशासकीय, पोलीस व अधिकृत सूत्रांची विधाने (Official Statements & Quotes)</h3> (with <blockquote>)
8. <h3>६. स्थानिक नागरिक, तज्ज्ञ व प्रत्यक्षदर्शींच्या प्रतिक्रिया (Ground Voices)</h3>
9. <h3>७. जनजीवन, वाहतूक, समाज व अर्थव्यवस्थेवरील परिणाम (Public & Economic Impact)</h3>
10. <h3>८. प्रशासकीय कारवाई, चौकशी व कायदेशीर पावले (Government & Legal Actions)</h3>
11. <h3>९. महत्त्वाची आकडेवारी व वस्तुस्थिती (Key Statistics & Data)</h3>
12. <h3>१०. पुढील घडामोडी व काय अपेक्षित आहे? (Future Outlook & Next Steps)</h3>
13. Interactive FAQ Box:
    <div class="news-faq-box">
      <h4>❓ या बातमीबाबत वारंवार विचारले जाणारे प्रश्न (FAQ)</h4>
      <div class="faq-item"><p class="faq-question"><strong>प्रश्न १: ...</strong></p><p class="faq-answer">उत्तर: ...</p></div>
      <div class="faq-item"><p class="faq-question"><strong>प्रश्न २: ...</strong></p><p class="faq-answer">उत्तर: ...</p></div>
    </div>
14. <h3>निष्कर्ष (Conclusion)</h3>
15. Key Takeaways Box:
    <div class="news-summary-box">
      <h4>📌 बातमीचे ठळक मुद्दे (Key Takeaways)</h4>
      <ul><li>...</li><li>...</li><li>...</li><li>...</li><li>...</li></ul>
    </div>

The output MUST be a JSON object adhering to the schema.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.1-flash-lite",
      preferredModels: ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"],
      contents: expandPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        temperature: 0.2,
        maxOutputTokens: 8192,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      if (!result.imageUrl) {
        result.imageUrl = getCategoryFallbackImage(result.category, result.headline);
      }
      res.json({ success: true, article: result });
    } else {
      throw new Error("No text returned from Gemini");
    }
  } catch (err: any) {
    console.error("Error expanding article:", err);
    res.status(500).json({ error: err.message || "Failed to expand article" });
  }
});

import { runNewsAutomator } from "./src/services/newsAutomator.js";
import { resolveWorkingArticleImage, verifyImageUrl } from "./src/services/imageManager.js";
import { getCategoryFallbackImage } from "./src/lib/defaultImages.js";
import { MAHARASHTRA_DISTRICTS, getDistrictBySlug, getDistrictByName } from "./src/data/maharashtraDistricts.js";
import { generateSitemapXml, generateGoogleNewsSitemapXml, generateRobotsTxt, writeStaticSitemapFiles } from "./src/services/sitemapGenerator.js";

// Helper to determine accurate public base URL from request or fallback
function getEffectiveBaseUrl(req: express.Request): string {
  const host = req.get('host') || 'rajyavani.vercel.app';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  
  // If request comes with a vercel.app or rajyavani.com domain, prefer that
  if (host.includes('rajyavani.vercel.app')) {
    return 'https://rajyavani.vercel.app';
  }
  if (host.includes('rajyavani.com')) {
    return 'https://rajyavani.com';
  }
  return `${protocol}://${host}`;
}

// Dynamic Sitemap.xml endpoint
app.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = getEffectiveBaseUrl(req);
    const xml = await generateSitemapXml(baseUrl);
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=3600, s-maxage=14400");
    res.send(xml);
  } catch (err: any) {
    console.error("Error generating sitemap.xml:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// Dynamic Google News Sitemap endpoint (for Google News crawler)
app.get("/news-sitemap.xml", async (req, res) => {
  try {
    const baseUrl = getEffectiveBaseUrl(req);
    const xml = await generateGoogleNewsSitemapXml(baseUrl);
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=1800, s-maxage=7200");
    res.send(xml);
  } catch (err: any) {
    console.error("Error generating news-sitemap.xml:", err);
    res.status(500).send("Error generating news sitemap");
  }
});

// Dynamic robots.txt endpoint
app.get("/robots.txt", (req, res) => {
  try {
    const baseUrl = getEffectiveBaseUrl(req);
    const txt = generateRobotsTxt(baseUrl);
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(txt);
  } catch (err) {
    res.status(500).send("Error generating robots.txt");
  }
});

// Admin endpoint to manually write/sync static public sitemap files
app.post("/api/admin/sitemap/generate", requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const isOwner = isSuperAdminEmail(req.user?.email);
    const rawToken = req.headers.authorization!.split('Bearer ')[1];
    const userRole = await getUserRoleREST(req.user!.uid, rawToken);

    if (!isOwner && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { customDomain } = req.body;
    const domain = customDomain && customDomain.startsWith('http') ? customDomain : 'https://rajyavani.vercel.app';
    const result = await writeStaticSitemapFiles(domain);

    res.json({
      success: true,
      domain,
      sitemapUrl: `${domain}/sitemap.xml`,
      newsSitemapUrl: `${domain}/news-sitemap.xml`,
      robotsTxtUrl: `${domain}/robots.txt`
    });
  } catch (err: any) {
    console.error("Error generating static sitemap files:", err);
    res.status(500).json({ error: err.message || "Failed to generate sitemap files" });
  }
});

// Endpoint to list all 36 Maharashtra districts with their media sources
app.get("/api/districts", (req, res) => {
  res.json({ success: true, districts: MAHARASHTRA_DISTRICTS });
});

// Endpoint to generate/collect 1000+ word Marathi news for a specific district using its designated media sources
app.post("/api/district-news/generate", async (req, res) => {
  try {
    const { districtSlug, districtName, websiteSource, youtubeChannel, division } = req.body;

    const districtInfo = getDistrictBySlug(districtSlug) || getDistrictByName(districtName) || MAHARASHTRA_DISTRICTS.find(d => d.slug === districtSlug || d.nameMarathi === districtName);

    const distName = districtInfo?.nameMarathi || districtName || "महाराष्ट्र";
    const webPartner = districtInfo?.website || websiteSource || "स्थानिक वार्तापत्र";
    const ytPartner = districtInfo?.youtubeChannel || youtubeChannel || "मराठी न्यूज नेटवर्क";
    const divName = districtInfo?.division || division || "महाराष्ट्र";

    const districtPrompt = `You are the Chief Investigative Bureau Head and Senior Journalist for 'राज्यवाणी' (Rajyavani) in Maharashtra.
Your task is to report and write a high-impact, authentic, and EXHAUSTIVE MARATHI NEWS ARTICLE of MINIMUM 1,000 WORDS (1,000 to 2,500+ words) specifically for ${distName} (${districtInfo?.nameEnglish || ''}) district in ${divName} division.

MEDIA ATTRIBUTION & SOURCES FOR THIS DISTRICT:
- Primary Regional Website / News Portal: ${webPartner}
- District Broadcast News Partner: ${ytPartner}

CRITICAL REPORTING MANDATES:
1. STRICT MINIMUM 1,000 WORDS in the 'content' field.
2. Focus deeply on authentic regional affairs in ${distName}: Local infrastructure, agriculture/irrigation (शेती व धरणे), district administration/collectorate decisions (जिल्हाधिकारी कार्यालय व प्रशासन), police/crime investigations (पोलीस अधीक्षक कार्यालय), civic/zilla parishad projects, or economic developments.
3. Systematically answer all 14 journalistic questions with rich subheadings (<h3>), detailed multi-paragraph context, quotes (<blockquote>), bullet statistics (<ul><li>), an interactive FAQ box (<div class="news-faq-box">), and Key Takeaways box (<div class="news-summary-box">).
4. Set 'category' appropriately (e.g. 'महाराष्ट्र', 'शेती', 'राजकारण', 'प्रशासन', 'क्राईम').
5. Set 'district' strictly to '${distName}'.
6. Set 'tags' with 5-8 relevant Marathi tags including '${distName}', '${divName}', 'स्थानिक घडामोडी'.

Return a JSON object conforming strictly to the schema.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.7-flash",
      preferredModels: ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"],
      contents: districtPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        temperature: 0.3,
        maxOutputTokens: 8192,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      if (!result.imageUrl) {
        result.imageUrl = getCategoryFallbackImage(result.category, result.headline);
      }
      res.json({ success: true, article: result, district: districtInfo });
    } else {
      throw new Error("No response received from Gemini for district news");
    }
  } catch (err: any) {
    console.error("Error generating district news:", err);
    res.status(500).json({ error: err.message || "Failed to generate district news" });
  }
});


// Endpoint to validate and resolve a working image URL
app.post("/api/images/resolve", async (req, res) => {
  try {
    const { url, category, title } = req.body;
    const workingUrl = await resolveWorkingArticleImage(url, category, title);
    res.json({ success: true, url: workingUrl });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Image proxy endpoint with aggressive caching & hotlink bypass
app.get("/api/images/proxy", async (req: any, res: any) => {
  const imageUrl = req.query.url as string;
  const category = req.query.category as string;
  const title = req.query.title as string;

  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    const fallback = getCategoryFallbackImage(category, title);
    return res.redirect(fallback);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const remoteRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!remoteRes.ok) {
      const fallback = getCategoryFallbackImage(category, title);
      return res.redirect(fallback);
    }

    const contentType = remoteRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    const buffer = await remoteRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    const fallback = getCategoryFallbackImage(category, title);
    return res.redirect(fallback);
  }
});

// Admin endpoint to trigger news automator manually
app.post("/api/admin/trigger-automator", requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const isOwner = isSuperAdminEmail(req.user?.email);
    const authHeader = req.headers.authorization || '';
    const rawToken = authHeader.split('Bearer ')[1];
    
    const userRole = await getUserRoleREST(req.user!.uid, rawToken);
    
    if (!isOwner && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Only admins can trigger the automator" });
    }

    const { recentArticles, authorName, sources } = req.body;
    
    const result = await runNewsAutomator(recentArticles || [], req.user!.uid, authorName || "Rajyavani System", sources || []);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error triggering automator:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Increase timeouts to allow for long Gemini API responses
  server.keepAliveTimeout = 300000;
  server.headersTimeout = 305000;
}

startServer();
