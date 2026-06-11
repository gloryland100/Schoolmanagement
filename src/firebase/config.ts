import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPk_Ndxj8EdHvet9wk5zrb3_aJ7ltoM14",
  authDomain: "de-best-gloryland.firebaseapp.com",
  projectId: "de-best-gloryland",
  storageBucket: "de-best-gloryland.firebasestorage.app",
  messagingSenderId: "551682204100",
  appId: "1:551682204100:web:0a6e019e7469c3fb8a8491",
  measurementId: "G-ES0LRSHCC6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Secondary app used only for creating new user accounts.
// This prevents createUserWithEmailAndPassword from signing out the current admin.
const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);
// In-memory persistence ensures the secondary auth session never touches browser storage
// (localStorage/IndexedDB), which would otherwise interfere with the primary admin session
// when signOut(secondaryAuth) is called after creating a user.
setPersistence(secondaryAuth, inMemoryPersistence).catch(console.error);

export default app;
