import { readFileSync } from 'fs';
const file = readFileSync('src/pages/AdminPage.tsx', 'utf8');
const lines = file.split('\n');
lines.forEach((l, i) => {
  if (l.includes('alert(`Error triggering automator: ${e.message}`);')) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});
