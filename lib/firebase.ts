import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Function to get Firebase config (evaluated at runtime on client)
function getFirebaseConfig() {
  if (typeof window === 'undefined') {
    // Server-side: return dummy config that won't be used
    return {
      apiKey: "dummy-key",
      authDomain: "dummy-project.firebaseapp.com",
      projectId: "dummy-project",
      storageBucket: "dummy-project.appspot.com",
      messagingSenderId: "00000000000",
      appId: "1:00000000000:web:00000000000000",
    };
  }
  
  // Client-side: get from environment variables
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "00000000000",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:00000000000:web:00000000000000",
  };
}

// Only initialize Firebase on the client side
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;
let _googleProvider: GoogleAuthProvider | undefined;

if (typeof window !== 'undefined') {
  const config = getFirebaseConfig();
  _app = !getApps().length ? initializeApp(config) : getApp();
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
