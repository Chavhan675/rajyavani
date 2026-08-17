import fs from "fs";
let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");

script = script.replace(/imageUrl: verifiedImageUrl,/g, "imageUrl: verifiedImageUrl || '',");
script = script.replace(/imagePrompt: articleData.imagePrompt,/g, "imagePrompt: articleData.imagePrompt || '',");
script = script.replace(/imageAlt: articleData.imageAlt,/g, "imageAlt: articleData.imageAlt || articleData.headline,");

fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts");
