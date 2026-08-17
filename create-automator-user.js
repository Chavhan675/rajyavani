import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function create() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, "automator@rajyavani.local", "AutoSecret123!");
    console.log("User created:", cred.user.uid);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.uid,
      role: "ADMIN",
      displayName: "Rajyavani System",
      createdAt: Date.now()
    });
    console.log("Saved to db");
  } catch (e) {
    console.error(e);
  }
}
create();
