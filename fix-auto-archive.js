import fs from "fs";

let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                      const updatePayload: any = { isDeveloping: false, updatedAt: Date.now() };
                      // Inject required fields if legacy document is missing them
                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';
                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';
                      if (!existingData.createdAt) updatePayload.createdAt = existingData.publishedAt || Date.now();
                      if (!existingData.aiGenerated) updatePayload.aiGenerated = true;
                      
                      // Inject ALL required fields if missing
                      if (!existingData.title) updatePayload.title = 'Untitled';
                      if (!existingData.summary) updatePayload.summary = 'No summary';
                      if (!existingData.content) updatePayload.content = 'No content';
                      if (!existingData.category) updatePayload.category = 'Uncategorized';
                      if (!existingData.status) updatePayload.status = 'DRAFT';`,
  `                      const updatePayload: any = { isDeveloping: false, updatedAt: Date.now() };
                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';
                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';
                      if (!existingData.createdAt) updatePayload.createdAt = existingData.publishedAt || Date.now();
                      
                      updatePayload.title = (existingData.title || 'Untitled').substring(0, 300);
                      updatePayload.summary = (existingData.summary || 'No summary').substring(0, 1000);
                      updatePayload.content = (existingData.content || 'No content').substring(0, 50000);
                      updatePayload.category = (existingData.category || 'Uncategorized').substring(0, 100);
                      updatePayload.status = existingData.status || 'DRAFT';
                      updatePayload.tags = Array.isArray(existingData.tags) ? existingData.tags.slice(0, 10) : [];
                      updatePayload.imagePrompt = (existingData.imagePrompt || '').substring(0, 1000);
                      updatePayload.imageAlt = (existingData.imageAlt || '').substring(0, 300);
                      updatePayload.isDeveloping = false;
                      updatePayload.aiGenerated = !!existingData.aiGenerated;`
);

script = script.replace(
  `                      const updatePayload: any = { status: 'ARCHIVED', updatedAt: Date.now() };
                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';
                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';
                      if (!existingData.createdAt) updatePayload.createdAt = existingData.publishedAt || Date.now();
                      if (!existingData.aiGenerated) updatePayload.aiGenerated = true;
                      if (!existingData.title) updatePayload.title = 'Untitled';
                      if (!existingData.summary) updatePayload.summary = 'No summary';
                      if (!existingData.content) updatePayload.content = 'No content';
                      if (!existingData.category) updatePayload.category = 'Uncategorized';`,
  `                      const updatePayload: any = { status: 'ARCHIVED', updatedAt: Date.now() };
                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';
                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';
                      if (!existingData.createdAt) updatePayload.createdAt = existingData.publishedAt || Date.now();
                      
                      updatePayload.title = (existingData.title || 'Untitled').substring(0, 300);
                      updatePayload.summary = (existingData.summary || 'No summary').substring(0, 1000);
                      updatePayload.content = (existingData.content || 'No content').substring(0, 50000);
                      updatePayload.category = (existingData.category || 'Uncategorized').substring(0, 100);
                      updatePayload.tags = Array.isArray(existingData.tags) ? existingData.tags.slice(0, 10) : [];
                      updatePayload.imagePrompt = (existingData.imagePrompt || '').substring(0, 1000);
                      updatePayload.imageAlt = (existingData.imageAlt || '').substring(0, 300);
                      updatePayload.isDeveloping = !!existingData.isDeveloping;
                      updatePayload.aiGenerated = !!existingData.aiGenerated;`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx auto-archive fallbacks");
