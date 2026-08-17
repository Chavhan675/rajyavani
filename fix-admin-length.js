import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                      updatePayload.title = (existingData.title || 'Untitled').substring(0, 300);`,
  `                      updatePayload.title = String(existingData.title || 'Untitled').substring(0, 300);`
);
script = script.replace(
  `                      updatePayload.summary = (existingData.summary || 'No summary').substring(0, 1000);`,
  `                      updatePayload.summary = String(existingData.summary || 'No summary').substring(0, 1000);`
);
script = script.replace(
  `                      updatePayload.content = (existingData.content || 'No content').substring(0, 50000);`,
  `                      updatePayload.content = String(existingData.content || 'No content').substring(0, 50000);`
);
script = script.replace(
  `                      updatePayload.category = (existingData.category || 'Uncategorized').substring(0, 100);`,
  `                      updatePayload.category = String(existingData.category || 'Uncategorized').substring(0, 100);`
);
script = script.replace(
  `                      updatePayload.imagePrompt = (existingData.imagePrompt || '').substring(0, 1000);`,
  `                      updatePayload.imagePrompt = String(existingData.imagePrompt || '').substring(0, 1000);`
);
script = script.replace(
  `                      updatePayload.imageAlt = (existingData.imageAlt || '').substring(0, 300);`,
  `                      updatePayload.imageAlt = String(existingData.imageAlt || '').substring(0, 300);`
);

script = script.replace(
  /tags: \(Array\.isArray\(generatedDraft\.tags\) \? generatedDraft\.tags : \[\]\)\.slice\(0, 10\)\.map\(String\),/g,
  "tags: Array.isArray(generatedDraft.tags) ? generatedDraft.tags.map(String).slice(0, 10) : [],"
);


fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage string coercion");
