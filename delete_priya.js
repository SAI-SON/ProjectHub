import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import * as dotenv from "dotenv";

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

async function deletePriya() {
  const q = query(collection(db, "users"), where("role", "==", "faculty"));
  const snap = await getDocs(q);
  
  let deletedCount = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.name && data.name.toLowerCase().includes("priya")) {
      await deleteDoc(doc(db, "users", d.id));
      console.log(`Deleted ${data.name} (${d.id})`);
      deletedCount++;
    }
  }
  
  console.log(`Total deleted: ${deletedCount}`);
  process.exit(0);
}

deletePriya();
