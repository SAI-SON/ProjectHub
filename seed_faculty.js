import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc, serverTimestamp } from "firebase/firestore";
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

const facultyList = [
  { name: "Ms. Vasuki C", qualifications: "ME, PhD" },
  { name: "Ms. Suguna Angamuthu", qualifications: "ME, PhD" },
  { name: "Ms. Kiruthika D", qualifications: "ME, PhD" },
  { name: "Ms. Thangamani S", qualifications: "MTech, PhD" },
  { name: "Ms. Bharathi A", qualifications: "ME, PhD" },
  { name: "Ms. Saranya R", qualifications: "ME, PhD" },
  { name: "Mr. Prabhakaran D", qualifications: "ME/MTech" },
  { name: "Ms. Sri Abirami S R", qualifications: "ME/MTech" },
  { name: "Mr. Ragunath R", qualifications: "ME/MTech" },
  { name: "Mr. Anand R", qualifications: "ME/MTech" },
  { name: "Mr. Sanjai T S", qualifications: "ME/MTech" },
  { name: "Ms. Vasundradevi P", qualifications: "ME/MTech" },
  { name: "Mr. Dharani B", qualifications: "ME/MTech" },
];

function generateEmail(name) {
  // Remove titles (Mr., Ms., Dr.) and special characters, replace spaces with dot
  const cleanName = name.replace(/^(Mr\.|Ms\.|Dr\.)\s+/i, '').toLowerCase();
  const parts = cleanName.split(/\s+/);
  if (parts.length > 1) {
    // Join parts with dot
    return `${parts.join('.')}@projecthub.edu`;
  }
  return `${parts[0]}@projecthub.edu`;
}

async function seedFaculty() {
  console.log("Starting Firebase faculty seed...");
  const batch = writeBatch(db);
  let totalCount = 0;
  let authCount = 0;

  for (const faculty of facultyList) {
    const email = generateEmail(faculty.name);
    let uid = `fac_it_${totalCount + 1}`; // fallback ID

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, "faculty");
      uid = userCredential.user.uid;
      authCount++;
      console.log(`Created auth for ${email}`);
    } catch (err) {
      if (err.code !== 'auth/email-already-in-use') {
        console.log(`Failed to create auth for ${email}: ${err.message}`);
      } else {
        console.log(`Auth already exists for ${email}. Retrieving UID...`);
        try {
          const { signInWithEmailAndPassword } = await import("firebase/auth");
          const existingUser = await signInWithEmailAndPassword(auth, email, "faculty");
          uid = existingUser.user.uid;
        } catch (signInErr) {
           console.error("Could not sign in to retrieve UID:", signInErr);
        }
      }
    }

    const facultyRef = doc(db, "users", uid);
    
    batch.set(facultyRef, {
      name: faculty.name,
      email: email,
      role: 'faculty',
      department: 'Information Technology',
      qualifications: faculty.qualifications,
      status: 'active',
      createdAt: serverTimestamp()
    });
    totalCount++;
  }

  try {
    await batch.commit();
    console.log(`Successfully seeded ${totalCount} faculty members into Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    process.exit(1);
  }
}

seedFaculty();
