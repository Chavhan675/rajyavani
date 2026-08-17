import { initializeApp } from "firebase/app";
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const auth = getAuth(app);

async function test() {
  try {
    const idToken = "dummy";
    const cred = GoogleAuthProvider.credential(idToken);
    console.log(cred);
  } catch (e) {
    console.error(e);
  }
}
test();
