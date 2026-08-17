import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const dbId = config.firestoreDatabaseId || "(default)";
const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/articles`;

console.log(url);
