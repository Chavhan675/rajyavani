import fs from "fs";
let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");
script = script.replace(/sourceUrl: item.link,/g, "sourceUrl: item.link || '',");
script = script.replace(/isDeveloping: articleData.isDeveloping,/g, "isDeveloping: !!articleData.isDeveloping,");
fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts more");
