import { adminDb } from './src/lib/firebase-admin.js';
async function count() {
  const snap = await adminDb.collection('articles').get();
  let count = 0;
  snap.forEach(doc => {
    const data = doc.data();
    if (data.category?.slug === 'education' || data.category?.slug === 'job' || data.category?.name?.includes('शिक्षण')) count++;
  });
  console.log('Count:', count);
}
count().catch(console.error);
