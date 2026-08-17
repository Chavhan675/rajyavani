import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const auth = getAuth(app);

async function test() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Anon user:", cred.user.uid);
  } catch (e) {
    console.error(e);
  }
}
test();
