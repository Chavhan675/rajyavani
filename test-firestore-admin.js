import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
initializeApp({ projectId: config.projectId });
const db = getFirestore(config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await db.collection("articles").get();
    console.log("Docs:", snap.size);
    snap.docs.forEach(d => {
       console.log(d.id, Object.keys(d.data()));
    });
  } catch(e) {
    console.error(e);
  }
}
test();
