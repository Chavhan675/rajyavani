import fs from "fs";
let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");

script = script.replace(
  /sourceUrl: item\.link \|\| '',/g,
  "sourceUrl: (item.link || '').substring(0, 1000),"
);

script = script.replace(
  /imageUrl: verifiedImageUrl \|\| '',/g,
  "imageUrl: (verifiedImageUrl || '').substring(0, 1000),"
);

fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts URL limits");
