import fs from "fs";

let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");

script = script.replace(
  `const itemsToProcess = allFeedItems.slice(0, 5);`,
  `// Take the top 30 newest items across all sources (to give good variety but stay within limits)
    const itemsToProcess = allFeedItems.slice(0, 30);`
);

fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts to process 30 items");
