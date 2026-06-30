import { initializeApp } from "firebase/app";
import { getFirestore, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function addHod() {
  const name = "Dr. Sreekanth G R";
  const email = "sreekanth.gr@projecthub.edu";
  let uid = "hod_it_1";

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, "hodpassword");
    uid = userCredential.user.uid;
    console.log(`Created auth for HOD: ${email}`);
  } catch (err) {
    if (err.code !== 'auth/email-already-in-use') {
      console.log(`Failed to create auth for ${email}: ${err.message}`);
    } else {
      console.log(`Auth already exists for ${email}. Retrieving UID...`);
      try {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const existingUser = await signInWithEmailAndPassword(auth, email, "hodpassword");
        uid = existingUser.user.uid;
      } catch (signInErr) {
        console.error("Could not sign in to retrieve UID:", signInErr);
      }
    }
  }

  const hodRef = doc(db, "users", uid);
  
  await setDoc(hodRef, {
    name: name,
    email: email,
    role: 'hod',
    department: 'Information Technology',
    status: 'active',
    createdAt: serverTimestamp()
  });

  console.log(`Successfully added HOD ${name} to Firestore!`);
  process.exit(0);
}

addHod();
