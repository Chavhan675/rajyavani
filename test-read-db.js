import fs from "fs";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
initializeApp({ projectId: config.projectId });
const db = getFirestore(config.firestoreDatabaseId);

async function run() {
  try {
    const snap = await db.collection("articles").limit(5).get();
    snap.docs.forEach(d => console.log(d.id, Object.keys(d.data())));
  } catch (e) { console.error(e.message); }
}
run();
