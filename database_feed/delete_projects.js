import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
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

async function deleteProjectData(projectName) {
  console.log(`Searching for project: "${projectName}"...`);
  const q = query(collection(db, "projects"), where("name", "==", projectName));
  const snap = await getDocs(q);

  if (snap.empty) {
    console.log(`Project "${projectName}" not found.`);
    return;
  }

  for (const d of snap.docs) {
    const projectId = d.id;
    console.log(`Found project document ID: ${projectId}. Deleting related documents...`);

    // Delete tasks
    const tasksQ = query(collection(db, "tasks"), where("projectId", "==", projectId));
    const tasksSnap = await getDocs(tasksQ);
    for (const taskDoc of tasksSnap.docs) {
      await deleteDoc(doc(db, "tasks", taskDoc.id));
      console.log(`Deleted task: ${taskDoc.id}`);
    }

    // Delete files
    const filesQ = query(collection(db, "files"), where("projectId", "==", projectId));
    const filesSnap = await getDocs(filesQ);
    for (const fileDoc of filesSnap.docs) {
      await deleteDoc(doc(db, "files", fileDoc.id));
      console.log(`Deleted file: ${fileDoc.id}`);
    }

    // Delete updates
    const updatesQ = query(collection(db, "updates"), where("projectId", "==", projectId));
    const updatesSnap = await getDocs(updatesQ);
    for (const updateDoc of updatesSnap.docs) {
      await deleteDoc(doc(db, "updates", updateDoc.id));
      console.log(`Deleted update: ${updateDoc.id}`);
    }

    // Delete feedback
    const feedbackQ = query(collection(db, "feedback"), where("projectId", "==", projectId));
    const feedbackSnap = await getDocs(feedbackQ);
    for (const fbDoc of feedbackSnap.docs) {
      await deleteDoc(doc(db, "feedback", fbDoc.id));
      console.log(`Deleted feedback: ${fbDoc.id}`);
    }

    // Delete activity logs
    const logsQ = query(collection(db, "activityLogs"), where("projectId", "==", projectId));
    const logsSnap = await getDocs(logsQ);
    for (const logDoc of logsSnap.docs) {
      await deleteDoc(doc(db, "activityLogs", logDoc.id));
      console.log(`Deleted activityLog: ${logDoc.id}`);
    }

    // Delete the project itself
    await deleteDoc(doc(db, "projects", projectId));
    console.log(`Deleted project: ${projectId} ("${projectName}")`);
  }
}

async function main() {
  await deleteProjectData("Test Performance Optimization");
  await deleteProjectData("AI-Powered Student Feedback System");
  console.log("All done!");
}

main().catch(console.error);
