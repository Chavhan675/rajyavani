import fs from 'fs';

let rules = fs.readFileSync('firestore.rules', 'utf8');

const sourceRules = `
    // SOURCES COLLECTION
    match /sources/{sourceId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
`;

rules = rules.replace(/  \}\n\}/, sourceRules);
fs.writeFileSync('firestore.rules', rules);
console.log('Fixed rules');
