import fs from "fs";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
initializeApp({ projectId: config.projectId });
const db = getFirestore(config.firestoreDatabaseId);

const sources = [
  // Channels
  { name: "ABP Majha", url: "https://news.google.com/rss/search?q=site:marathi.abplive.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
  { name: "News18 Lokmat", url: "https://news.google.com/rss/search?q=site:lokmat.news18.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
  { name: "TV9 Marathi", url: "https://news.google.com/rss/search?q=site:tv9marathi.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
  { name: "Zee 24 Taas", url: "https://news.google.com/rss/search?q=site:zeenews.india.com/marathi&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
  { name: "Saam TV", url: "https://news.google.com/rss/search?q=site:saamtv.com&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
  { name: "Jai Maharashtra", url: "https://news.google.com/rss/search?q=site:jaimaharashtranews.tv&hl=mr&gl=IN&ceid=IN:mr", type: "RSS", isActive: true },
  
  // Newspapers
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

async function seed() {
  const batch = db.batch();
  for (const s of sources) {
    const ref = db.collection("sources").doc();
    batch.set(ref, { ...s, createdAt: Date.now() });
  }
  await batch.commit();
  console.log("Successfully seeded", sources.length, "sources");
}

seed().catch(console.error);
