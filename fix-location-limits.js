import fs from "fs";
let script = fs.readFileSync("src/services/newsAutomator.ts", "utf8");

script = script.replace(
  /district: articleData\.district \|\| '',/g,
  "district: (articleData.district || '').substring(0, 100),"
);

script = script.replace(
  /taluka: articleData\.taluka \|\| '',/g,
  "taluka: (articleData.taluka || '').substring(0, 100),"
);

script = script.replace(
  /village: articleData\.village \|\| '',/g,
  "village: (articleData.village || '').substring(0, 100),"
);

fs.writeFileSync("src/services/newsAutomator.ts", script);
console.log("Patched newsAutomator.ts location limits");
