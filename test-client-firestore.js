import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

// To test client without auth, we can just do a query that requires no auth
// wait, we can't easily sign in via email/password since we don't have the password.
