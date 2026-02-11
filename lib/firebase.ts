import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase config - Next.js will replace these at build time
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

// Only initialize Firebase on the client side
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;
let _googleProvider: GoogleAuthProvider | undefined;

if (typeof window !== 'undefined') {
  _app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);
  _googleProvider = new GoogleAuthProvider();
}

// Export with non-null assertions for use in client components
// These will be undefined server-side but that's okay because client components don't SSR with Firebase
export const app = _app as FirebaseApp;
export const auth = _auth as Auth;
export const db = _db as Firestore;
export const storage = _storage as FirebaseStorage;
export const googleProvider = _googleProvider as GoogleAuthProvider;
