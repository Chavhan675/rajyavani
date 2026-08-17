import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ projectId: config.projectId });
}

const adminDb = getFirestore(config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await adminDb.collection('articles').limit(1).get();
    console.log("Success! Docs:", snap.size);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
