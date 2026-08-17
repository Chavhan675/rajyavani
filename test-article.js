import fs from "fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    await signInWithEmailAndPassword(auth, "chavhanakash675@gmail.com", "Test1234");
    console.log("Logged in!");
    const ref = await addDoc(collection(db, "articles"), {
        title: "Test",
        summary: "Test",
        content: "Test",
        status: "DRAFT",
        authorId: auth.currentUser.uid,
        authorName: "Test",
        category: "Test",
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    console.log("Created!", ref.id);
    process.exit(0);
  } catch (e) {
    console.error("Failed:", e.code, e.message);
    process.exit(1);
  }
}
run();
