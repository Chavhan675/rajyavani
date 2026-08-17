import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  /tags: \(generatedDraft\.tags \|\| \[\]\)\.slice\(0, 10\),/g,
  "tags: (Array.isArray(generatedDraft.tags) ? generatedDraft.tags : []).slice(0, 10).map(String),"
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx tags");
