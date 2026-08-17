import fs from "fs";

let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

const importLine = `import { collection, addDoc, serverTimestamp, getDocs, getDoc, query, orderBy, limit, doc, writeBatch, where, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';`;

const buttonHtml = `
            <div className="bg-white border-x border-b border-gray-200 rounded-b-xl p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                 <h3 className="font-bold text-gray-800">Configured Sources</h3>
                 <button 
                   onClick={async () => {
                     const defaultSources = [
                        { name: "ABP Majha", url: "https://news.google.com/rss/search?q=site:marathi.abplive.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "News18 Lokmat", url: "https://news.google.com/rss/search?q=site:lokmat.news18.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "TV9 Marathi", url: "https://news.google.com/rss/search?q=site:tv9marathi.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Zee 24 Taas", url: "https://news.google.com/rss/search?q=site:zeenews.india.com/marathi&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Saam TV", url: "https://news.google.com/rss/search?q=site:saamtv.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Jai Maharashtra", url: "https://news.google.com/rss/search?q=site:jaimaharashtranews.tv&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Lokmat", url: "https://news.google.com/rss/search?q=site:lokmat.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Sakal", url: "https://news.google.com/rss/search?q=site:esakal.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Loksatta", url: "https://news.google.com/rss/search?q=site:loksatta.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Maharashtra Times", url: "https://news.google.com/rss/search?q=site:maharashtratimes.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Pudhari", url: "https://news.google.com/rss/search?q=site:pudhari.news&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Divya Marathi", url: "https://news.google.com/rss/search?q=site:divyamarathi.bhaskar.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Saamana", url: "https://news.google.com/rss/search?q=site:saamana.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Deshonnati", url: "https://news.google.com/rss/search?q=site:deshonnati.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Deshdoot", url: "https://news.google.com/rss/search?q=site:deshdoot.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
                        { name: "Ekmat", url: "https://news.google.com/rss/search?q=site:ekmat.in&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true }
                     ];
                     if(window.confirm('Add 16 Marathi news publishers to sources?')) {
                       try {
                         const batch = writeBatch(db);
                         defaultSources.forEach(s => {
                           // Check if already exists by URL loosely by user sight, but code wise just add them
                           if(!automatorSources.find(as => as.url === s.url)) {
                             const newRef = doc(collection(db, 'sources'));
                             batch.set(newRef, { ...s, createdAt: Date.now() });
                           }
                         });
                         await batch.commit();
                         alert('Added default publishers successfully!');
                       } catch(e) {
                         alert('Failed to add sources: ' + e.message);
                       }
                     }
                   }}
                   className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md transition-colors"
                 >
                   Load Marathi Publishers
                 </button>
              </div>
`;

script = script.replace(
  `<div className="bg-white border-x border-b border-gray-200 rounded-b-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Configured Sources</h3>`,
  buttonHtml
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage.tsx with load publishers button");
