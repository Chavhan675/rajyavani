import fs from "fs";

let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");

script = script.replace(
  `      for (const source of sources) {
        try {
          if (source.type === 'RSS') {
            const feed = await parser.parseURL(source.url);
            allFeedItems = allFeedItems.concat(feed.items || []);
            console.log(\`[News Automator] Fetched \${(feed.items || []).length} items from \${source.name}\`);
          }
        } catch (e) {
          console.error(\`[News Automator] Failed to fetch from source: \${source.name}\`, e);
        }
      }`,
  `      const fetchPromises = sources.filter(s => s.type === 'RSS').map(async (source) => {
        try {
          const feed = await parser.parseURL(source.url);
          console.log(\`[News Automator] Fetched \${(feed.items || []).length} items from \${source.name}\`);
          return feed.items || [];
        } catch (e) {
          console.error(\`[News Automator] Failed to fetch from source: \${source.name}\`, e);
          return [];
        }
      });
      const results = await Promise.all(fetchPromises);
      for (const items of results) {
        allFeedItems = allFeedItems.concat(items);
      }`
);

fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts to use concurrent fetching");
