import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const depts = [
  { code: 'IT', name: 'Information Technology', count: 60 },
  { code: 'AI', name: 'Artificial Intelligence & Data Science', count: 60 },
  { code: 'CS', name: 'Computer Science Engineering', count: 120 },
  { code: 'IO', name: 'Internet of Things', count: 60 },
  { code: 'EC', name: 'Electronics & Communication Engineering', count: 60 },
  { code: 'EE', name: 'Electrical & Electronics Engineering', count: 60 },
];

async function seedDatabase() {
  console.log("Starting Firebase seed...");
  const batch = writeBatch(db);
  let totalCount = 0;
  let authCount = 0;

  // Since we are adding auth, we should loop asynchronously
  for (const dept of depts) {
    for (let i = 1; i <= dept.count; i++) {
      const paddedNum = String(i).padStart(3, '0');
      const studentId = `23${dept.code}${paddedNum}`;
      const email = `${studentId.toLowerCase()}@projecthub.edu`;
      const section = i <= 60 ? 'A' : 'B';
      
      try {
        await createUserWithEmailAndPassword(auth, email, "student");
        authCount++;
        console.log(`Created auth for ${email}`);
      } catch (err) {
        // Skip error if user already exists
        if (err.code !== 'auth/email-already-in-use') {
          console.log(`Failed to create auth for ${email}: ${err.message}`);
        }
      }

      const studentRef = doc(db, "students", studentId);
      
      batch.set(studentRef, {
        studentId: studentId,
        name: `${dept.name} Student ${i}`,
        email: email,
        role: 'student',
        department: dept.name,
        section: section,
        year: '4',
        status: 'active',
        createdAt: serverTimestamp()
      });
      totalCount++;
    }
  }

  try {
    await batch.commit();
    console.log(`Successfully seeded ${totalCount} students into Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    process.exit(1);
  }
}

seedDatabase();
