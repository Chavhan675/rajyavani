import fs from "fs";
let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");

script = script.replace(
  /tags: \(articleData\.tags \|\| \[\]\)\.slice\(0, 10\),/g,
  "tags: (Array.isArray(articleData.tags) ? articleData.tags : []).slice(0, 10).map(String),"
);

fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts tags");
