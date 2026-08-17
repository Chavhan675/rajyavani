import fs from "fs";

let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

// Since there are two places, let's just do a string replace for the specific block.
// We already replaced the first one. Let's do the second one.
script = script.replace(
  `                      const updatePayload: any = { status: 'ARCHIVED', updatedAt: Date.now() };
                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';
                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';
                      if (!existingData.createdAt) updatePayload.createdAt = existingData.publishedAt || Date.now();
                      if (!existingData.aiGenerated) updatePayload.aiGenerated = true;`,
  `                      const updatePayload: any = { status: 'ARCHIVED', updatedAt: Date.now() };
                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';
                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';
                      if (!existingData.createdAt) updatePayload.createdAt = existingData.publishedAt || Date.now();
                      if (!existingData.aiGenerated) updatePayload.aiGenerated = true;
                      if (!existingData.title) updatePayload.title = 'Untitled';
                      if (!existingData.summary) updatePayload.summary = 'No summary';
                      if (!existingData.content) updatePayload.content = 'No content';
                      if (!existingData.category) updatePayload.category = 'Uncategorized';`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx again");
