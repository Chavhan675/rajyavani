import Parser from 'rss-parser';
import { Type } from '@google/genai';
import { generateContentWithRetry } from './geminiClient.js';
import { resolveWorkingArticleImage } from './imageManager.js';

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  }
});

// System Instruction for combined batch processing
const batchInstruction = `You are the Senior Chief Investigative Journalist and Executive Editor for 'Rajyavani' (राज्यवाणी), Maharashtra's premier digital news organization.
Your job is to examine incoming news feed items, cross-reference facts, and create COMPREHENSIVE, IN-DEPTH, PROFESSIONAL Marathi news articles matching the standards of top national newspapers and television news channels.

CRITICAL EDITORIAL & STRUCTURAL MANDATES:
1. ARTICLE LENGTH & DEPTH (STRICT MINIMUM 1,000 WORDS): Every article's 'content' field MUST BE AT LEAST 1,000 WORDS (strictly 1,000 to 2,500+ words). Short articles, summaries, or drafts under 1,000 words are strictly forbidden. You must write extensive, deep multi-paragraph analyses under each section so that the reader gets complete, end-to-end information without needing to check any other source.
2. DISTRICT → TALUKA → VILLAGE-LEVEL COVERAGE: 
   - You MUST extract and specify the precise 'district', 'taluka', and 'village' whenever reporting local news.
3. TODAY'S LATEST & TRUE NEWS ONLY:
   - You MUST ONLY report news that is FRESH and happened TODAY.
   - Discard, ignore, or mark as 'SKIP' any outdated news or events from previous weeks.
   - Ensure absolute truth. Do NOT invent false stories or rumors.
4. DEDUPLICATION & UPDATES:
   - If an item is an exact duplicate with no new info, mark action as 'SKIP'.
   - If it provides new developments or updates to an existing recent story, mark action as 'UPDATE' and provide targetArticleId.
   - Otherwise, mark as 'NEW'.
5. STRICT EDUCATION & JOB RECRUITMENT VERIFICATION:
   - You MUST ONLY report educational and job news that is from the PRESENT YEAR (2026).
   - You MUST ONLY report job/recruitment news published within the LAST 15 DAYS.
   - EXPLICIT BLACKLIST: The news regarding "महापारेषण (MahaTransco) तंत्रज्ञ व सहायक अभियंता भरती (२,१५० जागा)" is CONFIRMED FALSE AND OUTDATED. You MUST NOT process or publish this news. Mark it as 'SKIP' immediately.
6. EXPLICITLY ANSWER THE 14 JOURNALISTIC QUESTIONS IN DEPTH:
   1. काय घडले? (What happened?)
   2. कधी घडले? (When did it happen?)
   3. कुठे घडले? (Where did it happen? - Village, Taluka, District, State)
   4. का घडले? (Why did it happen? - Root causes & triggers)
   5. कसे घडले? (How did it happen? - Chronological mechanics)
   6. कोण सहभागी होते? (Who was involved?)
   7. कोणावर प्रभाव पडला? (Who was affected? - Local citizens, farmers, students, businesses)
   8. या घटनेची मूळ पार्श्वभूमी काय? (What is the background?)
   9. कोणत्या पूर्वघटना कारणीभूत ठरल्या? (What events led to this?)
   10. ताज्या घडामोडी व सद्यस्थिती काय आहे? (What are the latest developments?)
   11. प्रशासन, पोलीस, न्यायालय किंवा रुग्णालयाची कारवाई काय? (What actions have authorities taken?)
   12. अधिकारी, तज्ज्ञ व प्रत्यक्षदर्शींची विधाने काय आहेत? (What are officials & experts saying?)
   13. जनजीवन, शेती, शिक्षण व अर्थव्यवस्थेवर काय परिणाम होणार? (What is the broader impact?)
   14. पुढे काय होणार? (What happens next?)

7. MANDATORY CONTENT STRUCTURE: Format every article's 'content' field in structured HTML (<p>, <h3>, <blockquote>, <ul>, <li>, <div>) adhering to this ordered sequence:
   - Lead Paragraphs: Explaining the 5 Ws and 1 H (काय, कुठे, कधी, का, कसे, आणि कोण) and why this news matters.
   - <h3>सविस्तर घटना आणि कारणे (Detailed Event Explanation & Causes)</h3>: Comprehensive breakdown of the incident.
   - <h3>घटनास्थळ आणि भौगोलिक संदर्भ (Location Details)</h3>: Village, Taluka, District context.
   - <h3>घडामोडींचा सविस्तर घटनाक्रम (Timeline of Events)</h3>: Chronological breakdown of events.
   - <h3>पार्श्वभूमी, मूळ संदर्भ आणि इतिहास (Background & History)</h3>: Historical context, prior occurrences, and root causes.
   - <h3>प्रशासन, पोलीस व तज्ज्ञांची अधिकृत विधाने (Official Statements & Quotes)</h3>: Reactions and quotes from officials or witnesses (use <blockquote>).
   - <h3>स्थानिक नागरिक व बाधित घटकांच्या प्रतिक्रिया (Ground Voices & Public Reactions)</h3>: Perspectives of affected people.
   - <h3>तपास, न्यायालयीन प्रक्रिया आणि शासकीय कारवाई (Investigation & Administration Actions)</h3>: Relief work, investigations, FIRs, or policy actions taken.
   - <h3>जनजीवन, शेती, व्यापार व वाहतुकीवरील परिणाम (Public & Economic Impact)</h3>: Impact on daily life, schools, agriculture, or commerce.
   - <h3>महत्त्वाची आकडेवारी व तथ्ये (Key Facts & Statistics)</h3>: Official metrics, figures, or data points in bullet list.
   - <h3>पुढील घडामोडी व काय अपेक्षित आहे? (Future Outlook & Next Steps)</h3>: Expected hearings, upcoming decisions, or monitoring.
   - <h3>वारंवार विचारले जाणारे प्रश्न (FAQ)</h3>:
     <div class="news-faq-box">
       <h4>❓ वारंवार विचारले जाणारे प्रश्न (FAQ)</h4>
       <div class="faq-item">
         <p class="faq-question"><strong>प्रश्न १: [या घटनेतील मुख्य प्रश्न?]</strong></p>
         <p class="faq-answer">उत्तर: [सविस्तर उत्तर]</p>
       </div>
       <div class="faq-item">
         <p class="faq-question"><strong>प्रश्न २: [याचा सर्वसामान्यांवर काय परिणाम होणार?]</strong></p>
         <p class="faq-answer">उत्तर: [सविस्तर उत्तर]</p>
       </div>
       <div class="faq-item">
         <p class="faq-question"><strong>प्रश्न ३: [प्रशासनाकडून काय पावले उचलली जात आहेत?]</strong></p>
         <p class="faq-answer">उत्तर: [सविस्तर उत्तर]</p>
       </div>
     </div>
   - <h3>निष्कर्ष (Conclusion)</h3>: Balanced editorial closing.
   - AT THE END OF EVERY ARTICLE, ALWAYS INCLUDE THIS STRUCTURED SUMMARY BOX:
     <div class="news-summary-box">
       <h4>📌 बातमीचे ठळक मुद्दे (Key Takeaways)</h4>
       <ul>
         <li>[मुद्दा १: प्रमुख निष्कर्ष]</li>
         <li>[मुद्दा २: मुख्य कारण व घडामोडी]</li>
         <li>[मुद्दा ३: शासकीय/प्रशासकीय कारवाई]</li>
         <li>[मुद्दा ४: सर्वसामान्य घटकांवरील प्रभाव]</li>
         <li>[मुद्दा ५: पुढील अपेक्षित पाऊल]</li>
       </ul>
     </div>
5. Accurate metadata: Category, District, Taluka, Village, 4-8 SEO Tags, English imagePrompt, and Marathi imageAlt.`;

export const runNewsAutomator = async (recentArticles: any[], authorId: string, authorName: string, sources: any[]) => {
  console.log('[News Automator] Starting news collection generation...');
  
  try {
    let allFeedItems: any[] = [];

    if (!sources || sources.length === 0) {
      console.log('[News Automator] No sources configured. Using default Google News RSS.');
      try {
        const feed = await parser.parseURL('https://news.google.com/rss?hl=mr&gl=IN&ceid=IN:mr');
        allFeedItems = feed.items || [];
      } catch (e) {
        console.error('[News Automator] Default feed fetch failed', e);
      }
    } else {
      console.log(`[News Automator] Fetching from ${sources.length} configured sources.`);
      const fetchPromises = sources.filter(s => s.type === 'RSS').map(async (source) => {
        try {
          const feed = await parser.parseURL(source.url);
          console.log(`[News Automator] Fetched ${(feed.items || []).length} items from ${source.name}`);
          return (feed.items || []).map((it: any) => ({ ...it, _sourceName: source.name }));
        } catch (e) {
          console.error(`[News Automator] Failed to fetch from source: ${source.name}`, e);
          return [];
        }
      });
      const results = await Promise.all(fetchPromises);
      for (const items of results) {
        allFeedItems = allFeedItems.concat(items);
      }
    }

    // Sort by publication date (newest first)
    allFeedItems.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

    console.log(`[News Automator] Aggregated ${allFeedItems.length} total items.`);

    // Fast local deduplication
    const seenUrls = new Set((recentArticles || []).map(a => a.sourceUrl).filter(Boolean));
    const seenTitles = (recentArticles || []).map(a => (a.title || '').trim().toLowerCase()).filter(Boolean);

    const filteredItems: any[] = [];
    for (const item of allFeedItems) {
      if (!item.title || !item.link) continue;
      if (seenUrls.has(item.link)) continue;

      const normTitle = item.title.trim().toLowerCase();
      // Check if title is nearly identical to any recent article
      const isDuplicateTitle = seenTitles.some(t => {
        if (t === normTitle) return true;
        if (t.length > 15 && normTitle.includes(t)) return true;
        if (normTitle.length > 15 && t.includes(normTitle)) return true;
        return false;
      });

      if (!isDuplicateTitle) {
        seenUrls.add(item.link);
        seenTitles.push(normTitle);
        filteredItems.push(item);
      }

      // We select up to 2 top fresh distinct news items per batch to guarantee comprehensive 1,000+ words depth
      if (filteredItems.length >= 2) break;
    }

    if (filteredItems.length === 0) {
      console.log('[News Automator] No new distinct items to process.');
      return { success: true, operations: [] };
    }

    console.log(`[News Automator] Processing ${filteredItems.length} fresh items in an in-depth AI batch...`);

    // Prepare candidate payloads with extracted images
    const candidateList = filteredItems.map((item, idx) => {
      let sourceImageUrl: string | null = null;
      if (item.enclosure && item.enclosure.url && item.enclosure.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        sourceImageUrl = item.enclosure.url;
      } else if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) sourceImageUrl = imgMatch[1];
      }

      return {
        id: `item_${idx}`,
        title: item.title,
        link: item.link,
        sourceName: item._sourceName || 'Unknown',
        contentSnippet: (item.contentSnippet || item.content || '').substring(0, 1500),
        pubDate: item.pubDate || new Date().toISOString(),
        sourceImageUrl: sourceImageUrl
      };
    });

    const recentContext = (recentArticles || []).slice(0, 15).map(r => ({
      id: r.id,
      title: r.title,
      summary: (r.summary || '').substring(0, 200)
    }));

    const batchPrompt = `
INCOMING CANDIDATE NEWS ITEMS:
${JSON.stringify(candidateList, null, 2)}

RECENT EXISTING ARTICLES (FOR DEDUPLICATION/UPDATE REFERENCE):
${JSON.stringify(recentContext, null, 2)}

Write complete Marathi news articles for each candidate item. Return a JSON array matching the schema.`;

    const aiResponse = await generateContentWithRetry({
      model: 'gemini-3.7-flash',
      preferredModels: ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'],
      contents: batchPrompt,
      config: {
        systemInstruction: batchInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sourceItemId: { type: Type.STRING },
              action: { type: Type.STRING, enum: ['NEW', 'UPDATE', 'SKIP'] },
              targetArticleId: { type: Type.STRING, nullable: true },
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              category: { type: Type.STRING },
              district: { type: Type.STRING, nullable: true },
              taluka: { type: Type.STRING, nullable: true },
              village: { type: Type.STRING, nullable: true },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              isDeveloping: { type: Type.BOOLEAN },
              requiresHumanReview: { type: Type.BOOLEAN },
              imagePrompt: { type: Type.STRING },
              imageAlt: { type: Type.STRING }
            },
            required: ['sourceItemId', 'action', 'headline', 'summary', 'content', 'category', 'tags', 'isDeveloping', 'imagePrompt', 'imageAlt']
          }
        }
      }
    });

    let generatedList: any[] = [];
    try {
      generatedList = JSON.parse(aiResponse.text || '[]');
    } catch (e) {
      console.error('[News Automator] Failed to parse batch JSON response', e);
      return { success: false, error: 'Failed to parse AI response' };
    }

    const operations: any[] = [];

    for (const articleData of generatedList) {
      if (articleData.action === 'SKIP') {
        console.log(`[News Automator] AI marked ${articleData.sourceItemId} as SKIP`);
        continue;
      }

      const originalItem = candidateList.find(c => c.id === articleData.sourceItemId) || candidateList[0];
      const rawImageUrl = originalItem?.sourceImageUrl || '';
      const headline = String(articleData.headline || originalItem.title || 'Untitled');
      const category = String(articleData.category || 'महाराष्ट्र');
      
      // Ensure the image URL is verified or has a guaranteed category fallback
      const verifiedImageUrl = await resolveWorkingArticleImage(rawImageUrl, category, headline);
      const finalStatus = articleData.requiresHumanReview ? 'REVIEW' : 'PUBLISHED';

      if (articleData.action === 'UPDATE' && articleData.targetArticleId) {
        operations.push({
          type: 'UPDATE',
          targetId: articleData.targetArticleId,
          data: {
            title: headline.substring(0, 300),
            summary: String(articleData.summary || '').substring(0, 1000),
            content: String(articleData.content || '').substring(0, 50000),
            category: category.substring(0, 100),
            district: String(articleData.district || '').substring(0, 100),
            taluka: String(articleData.taluka || '').substring(0, 100),
            village: String(articleData.village || '').substring(0, 100),
            tags: Array.isArray(articleData.tags) ? articleData.tags.map(String).slice(0, 10) : [],
            updatedAt: Date.now(),
            isDeveloping: !!articleData.isDeveloping,
            sourceUrl: String(originalItem.link || '').substring(0, 1000),
            imageUrl: String(verifiedImageUrl || '').substring(0, 1000),
            imagePrompt: String(articleData.imagePrompt || '').substring(0, 1000),
            imageAlt: String(articleData.imageAlt || headline).substring(0, 300),
            status: finalStatus,
            requiresHumanReview: !!articleData.requiresHumanReview,
            authorId: authorId,
            authorName: authorName,
            createdAt: Date.now(),
            publishedAt: finalStatus === 'PUBLISHED' ? Date.now() : 0,
            aiGenerated: true
          }
        });
      } else {
        operations.push({
          type: 'CREATE',
          data: {
            title: headline.substring(0, 300),
            summary: String(articleData.summary || '').substring(0, 1000),
            content: String(articleData.content || '').substring(0, 50000),
            status: finalStatus,
            authorId: authorId,
            authorName: authorName,
            category: category.substring(0, 100),
            district: String(articleData.district || '').substring(0, 100),
            taluka: String(articleData.taluka || '').substring(0, 100),
            village: String(articleData.village || '').substring(0, 100),
            tags: Array.isArray(articleData.tags) ? articleData.tags.map(String).slice(0, 10) : [],
            publishedAt: finalStatus === 'PUBLISHED' ? Date.now() : 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDeveloping: !!articleData.isDeveloping,
            aiGenerated: true,
            sourceUrl: String(originalItem.link || '').substring(0, 1000),
            imageUrl: String(verifiedImageUrl || '').substring(0, 1000),
            imagePrompt: String(articleData.imagePrompt || '').substring(0, 1000),
            imageAlt: String(articleData.imageAlt || headline).substring(0, 300),
            requiresHumanReview: !!articleData.requiresHumanReview
          }
        });
      }
    }

    console.log(`[News Automator] Successfully built ${operations.length} operations in 1 AI batch.`);
    return { success: true, operations };
  } catch (error) {
    console.error('[News Automator] Fatal error:', error);
    return { success: false, error: (error as Error).message };
  }
};
