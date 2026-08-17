import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';`,
  `                      if (!existingData.authorId) updatePayload.authorId = user?.uid || 'system-automator';`
);

script = script.replace(
  `                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';`,
  `                      if (!existingData.authorName) updatePayload.authorName = user?.displayName || user?.email || 'Rajyavani System';`
);

script = script.replace(
  `                      if (!existingData.authorId) updatePayload.authorId = userRole?.uid || 'system-automator';`,
  `                      if (!existingData.authorId) updatePayload.authorId = user?.uid || 'system-automator';`
);

script = script.replace(
  `                      if (!existingData.authorName) updatePayload.authorName = userRole?.displayName || 'Rajyavani System';`,
  `                      if (!existingData.authorName) updatePayload.authorName = user?.displayName || user?.email || 'Rajyavani System';`
);

script = script.replace(
  `                      authorName: userRole?.displayName || 'Rajyavani System',`,
  `                      authorName: user?.displayName || user?.email || 'Rajyavani System',`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx roles");
