import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                      if (existingData.imageUrl === null) updatePayload.imageUrl = '';`,
  `                      if (existingData.imageUrl === null) updatePayload.imageUrl = '';
                      if (existingData.publishedAt === null) updatePayload.publishedAt = 0;`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx auto-archive publishedAt");
