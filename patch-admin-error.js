import fs from "fs";
let script = fs.readFileSync("src/pages/AdminPage.tsx", "utf8");

script = script.replace(
  /alert\(\`Error triggering automator: \$\{e\.message\}\`\);/,
  "alert(`Error triggering automator: ${e.code} ${e.message}`);"
);

fs.writeFileSync("src/pages/AdminPage.tsx", script);
console.log("Patched AdminPage error alert");
