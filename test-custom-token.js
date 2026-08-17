import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
initializeApp({ projectId: config.projectId });

async function test() {
  try {
    const token = await getAuth().createCustomToken("system-automator", { role: "ADMIN" });
    console.log("Token:", token);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
