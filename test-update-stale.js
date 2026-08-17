import fs from "fs";

let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                      if (!existingData.aiGenerated) updatePayload.aiGenerated = true;`,
  `                      if (!existingData.aiGenerated) updatePayload.aiGenerated = true;
                      
                      // Inject ALL required fields if missing
                      if (!existingData.title) updatePayload.title = 'Untitled';
                      if (!existingData.summary) updatePayload.summary = 'No summary';
                      if (!existingData.content) updatePayload.content = 'No content';
                      if (!existingData.category) updatePayload.category = 'Uncategorized';
                      if (!existingData.status) updatePayload.status = 'DRAFT';
`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx");
