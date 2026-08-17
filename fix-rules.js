import fs from 'fs';

let rules = fs.readFileSync('firestore.rules', 'utf8');

// Replace immortal checks to allow setting them if they are missing
rules = rules.replace(
  /incoming\(\)\.authorId == existing\(\)\.authorId/g,
  "(existing().keys().hasAll(['authorId']) == false || incoming().authorId == existing().authorId)"
);
rules = rules.replace(
  /incoming\(\)\.createdAt == existing\(\)\.createdAt/g,
  "(existing().keys().hasAll(['createdAt']) == false || incoming().createdAt == existing().createdAt)"
);

fs.writeFileSync('firestore.rules', rules);
console.log('Fixed rules');
