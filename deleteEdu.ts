import { adminDb } from './src/lib/firebase-admin.js';

async function deleteEduNews() {
  console.log("Starting deletion of education and job news...");
  const snapshot = await adminDb.collection('articles').get();
  
  if (snapshot.empty) {
    console.log("No articles found in database.");
    process.exit(0);
  }

  const batch = adminDb.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const catName = data.category?.name || '';
    const catSlug = data.category?.slug || '';
    
    if (
      catName.includes('शिक्षण') || 
      catName.includes('नोकरी') || 
      catName.includes('विद्यार्थी') || 
      catName.includes('Jobs') || 
      catName.includes('Education') ||
      catSlug.includes('education') ||
      catSlug.includes('job')
    ) {
      batch.delete(doc.ref);
      count++;
      console.log(`Deleting: ${data.title} (Category: ${catName})`);
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully deleted ${count} old articles related to education/jobs.`);
  } else {
    console.log("No education/job articles found to delete.");
  }
  
  process.exit(0);
}

deleteEduNews().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
