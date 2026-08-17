import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                      updatePayload.isDeveloping = !!existingData.isDeveloping;
                      updatePayload.aiGenerated = !!existingData.aiGenerated;
                      batch.update(docSnap.ref, updatePayload);`,
  `                      updatePayload.isDeveloping = !!existingData.isDeveloping;
                      updatePayload.aiGenerated = !!existingData.aiGenerated;
                      
                      // Fix any legacy nulls
                      if (existingData.district === null) updatePayload.district = '';
                      if (existingData.taluka === null) updatePayload.taluka = '';
                      if (existingData.village === null) updatePayload.village = '';
                      if (existingData.sourceUrl === null) updatePayload.sourceUrl = '';
                      if (existingData.imagePrompt === null) updatePayload.imagePrompt = '';
                      if (existingData.imageAlt === null) updatePayload.imageAlt = '';
                      if (existingData.imageUrl === null) updatePayload.imageUrl = '';

                      batch.update(docSnap.ref, updatePayload);`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx auto-archive legacy nulls");
