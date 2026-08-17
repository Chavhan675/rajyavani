import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                             if (existingData.createdAt) {
                               delete op.data.createdAt;
                             }`,
  `                             if (existingData.createdAt) {
                               delete op.data.createdAt;
                             } else {
                               op.data.createdAt = existingData.publishedAt || Date.now();
                             }`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx legacy createdAt");
