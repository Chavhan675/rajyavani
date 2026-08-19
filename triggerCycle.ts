import { runNewsCollectionCycle } from './src/services/collectionScheduler.js';

async function triggerCycle() {
  console.log("Triggering new news collection cycle...");
  const result = await runNewsCollectionCycle('ADMIN_MANUAL');
  console.log("Cycle finished:", result.success);
  console.log("New articles added:", result.newArticles?.length);
  process.exit(0);
}

triggerCycle().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
