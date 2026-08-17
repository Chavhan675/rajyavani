import fs from "fs";

let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  `                           if (currentDoc.exists()) {
                             await addDoc(collection(articleRef, 'revisions'), {
                               ...currentDoc.data(),
                               archivedAt: Date.now()
                             });
                           }
                           await updateDoc(articleRef, op.data);`,
  `                           if (currentDoc.exists()) {
                             await addDoc(collection(articleRef, 'revisions'), {
                               ...currentDoc.data(),
                               archivedAt: Date.now()
                             });
                             
                             // Prevent overwriting immortal fields if they already exist
                             const existingData = currentDoc.data();
                             if (existingData.authorId) {
                               delete op.data.authorId;
                               delete op.data.authorName;
                             }
                             if (existingData.createdAt) {
                               delete op.data.createdAt;
                             }
                           }
                           await updateDoc(articleRef, op.data);`
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx");
