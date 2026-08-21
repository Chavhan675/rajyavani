import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

function getOrInitApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

let _db: Firestore | null = null;
export function getFirebaseDb(): Firestore {
  if (!_db) {
    const app = getOrInitApp();
    _db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
  }
  return _db;
}

let _auth: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const app = getOrInitApp();
    _auth = getAuth(app);
  }
  return _auth;
}

// Proxies for direct backward-compatibility exports
export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    const instance = getFirebaseDb();
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    const instance = getFirebaseAuth();
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});


