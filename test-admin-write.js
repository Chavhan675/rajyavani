import fs from 'fs';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
initializeApp({ projectId: firebaseConfig.projectId });
const adminDb = getFirestore(firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const docRef = adminDb.collection('articles').doc('test-admin-write');
    await docRef.set({ test: true, createdAt: Date.now() });
    console.log("Write success!");
    await docRef.delete();
    console.log("Delete success!");
  } catch(e) {
    console.error("Write failed:", e);
  }
}
test();
