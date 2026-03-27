import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-drgcLFaTRnBkKq2zp8ecKrOE0jWU_8w",
  authDomain: "gymquest-1bc3f.firebaseapp.com",
  projectId: "gymquest-1bc3f",
  storageBucket: "gymquest-1bc3f.firebasestorage.app",
  messagingSenderId: "592125064134",
  appId: "1:592125064134:web:3c0b646a1aaa4f553ab8c7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
