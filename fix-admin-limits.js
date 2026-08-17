import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `      const articleData = {
        title: generatedDraft.headline,
        summary: generatedDraft.summary,
        content: generatedDraft.content,
        status: status,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        category: generatedDraft.category,
        district: generatedDraft.district || '',
        taluka: generatedDraft.taluka || '',
        village: generatedDraft.village || '',
        tags: generatedDraft.tags || [],
        publishedAt: status === 'PUBLISHED' ? Date.now() : 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeveloping: generatedDraft.isDeveloping || false,
        aiGenerated: true,
        imagePrompt: generatedDraft.imagePrompt || '',
        imageAlt: generatedDraft.imageAlt || generatedDraft.headline
      };`,
  `      const articleData = {
        title: (generatedDraft.headline || 'Untitled').substring(0, 300),
        summary: (generatedDraft.summary || '').substring(0, 1000),
        content: (generatedDraft.content || '').substring(0, 50000),
        status: status,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        category: (generatedDraft.category || 'News').substring(0, 100),
        district: (generatedDraft.district || '').substring(0, 100),
        taluka: (generatedDraft.taluka || '').substring(0, 100),
        village: (generatedDraft.village || '').substring(0, 100),
        tags: (generatedDraft.tags || []).slice(0, 10),
        publishedAt: status === 'PUBLISHED' ? Date.now() : 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeveloping: !!generatedDraft.isDeveloping,
        aiGenerated: true,
        imagePrompt: (generatedDraft.imagePrompt || '').substring(0, 1000),
        imageAlt: (generatedDraft.imageAlt || generatedDraft.headline || '').substring(0, 300)
      };`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx limits");
