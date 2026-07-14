import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvpupw4iyO-_HMf0_dzIcpfmdxFA7j5NI",
  authDomain: "street-mobile-3988c.firebaseapp.com",
  projectId: "street-mobile-3988c",
  storageBucket: "street-mobile-3988c.firebasestorage.app",
  messagingSenderId: "254682609931",
  appId: "1:254682609931:web:b8266b1e748a3ea9ff8a0e",
  measurementId: "G-BYSNZ1Z723"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export Firestore, Storage and Auth instances
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

