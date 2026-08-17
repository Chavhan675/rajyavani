import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit, where, orderBy } from "firebase/firestore";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'PUBLISHED'),
      orderBy('publishedAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    console.log("Client fetch success, docs:", snap.size);
    process.exit(0);
  } catch(e) {
    console.error("Client fetch error:", e.code, e.message);
    process.exit(1);
  }
}
run();
