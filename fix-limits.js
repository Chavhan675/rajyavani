import fs from "fs";
let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");

script = script.replace(
  /tags: articleData\.tags \|\| \[\],/g,
  "tags: (articleData.tags || []).slice(0, 10),"
);

script = script.replace(
  /title: articleData\.headline,/g,
  "title: (articleData.headline || 'Untitled').substring(0, 300),"
);

script = script.replace(
  /summary: articleData\.summary,/g,
  "summary: (articleData.summary || '').substring(0, 1000),"
);

script = script.replace(
  /content: articleData\.content,/g,
  "content: (articleData.content || '').substring(0, 50000),"
);

script = script.replace(
  /category: articleData\.category,/g,
  "category: (articleData.category || 'News').substring(0, 100),"
);

script = script.replace(
  /imagePrompt: articleData\.imagePrompt \|\| '',/g,
  "imagePrompt: (articleData.imagePrompt || '').substring(0, 1000),"
);

script = script.replace(
  /imageAlt: articleData\.imageAlt \|\| articleData\.headline,/g,
  "imageAlt: (articleData.imageAlt || articleData.headline || '').substring(0, 300),"
);

fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts limits");
