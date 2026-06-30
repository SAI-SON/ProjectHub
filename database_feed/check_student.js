import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as dotenv from "dotenv";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function checkStudent() {
  const email = "23ai060@projecthub.edu";
  const pass = "student";
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    console.log("Login successful!", userCredential.user.uid);
  } catch (err) {
    console.log("Login failed with 'student':", err.message);
    try {
      const u2 = await signInWithEmailAndPassword(auth, email, "student@12345");
      console.log("Login successful with 'student@12345'!", u2.user.uid);
    } catch (e2) {
      console.log("Login failed with 'student@12345':", e2.message);
    }
  }
  process.exit(0);
}

checkStudent();
