import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                             if (existingData.authorId) {
                               delete op.data.authorId;
                               delete op.data.authorName;
                             }`,
  `                             if (existingData.authorId) {
                               delete op.data.authorId;
                             } else {
                               op.data.authorId = user?.uid || 'system-automator';
                             }
                             if (existingData.authorName) {
                               delete op.data.authorName;
                             } else {
                               op.data.authorName = user?.displayName || user?.email || 'Rajyavani System';
                             }`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx author fields");
