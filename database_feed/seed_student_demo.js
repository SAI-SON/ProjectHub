import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc, serverTimestamp, collection } from "firebase/firestore";
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

async function seedStudentDemo() {
  console.log("Generating comprehensive Student Demo Data...");
  const batch = writeBatch(db);

  // 1. Create a Project
  const projRef = doc(collection(db, "projects"));
  const projectId = projRef.id;

  batch.set(projRef, {
    title: "AI-Powered Student Feedback System", // Using title as fallback
    name: "AI-Powered Student Feedback System",
    description: "A comprehensive platform that analyzes student feedback using NLP to provide actionable insights for university administration and faculty.",
    facultyId: "dr.smith@projecthub.edu", // Demo faculty
    team: ["23IT001@projecthub.edu", "23IT002@projecthub.edu", "23IT003@projecthub.edu"],
    status: "Active",
    progress: 45, // Set native progress
    createdAt: serverTimestamp(),
  });

  // 2. Add Tasks
  const tasks = [
    { title: "Define NLP Pipeline Architecture", status: "Completed" },
    { title: "Set up Firebase Authentication", status: "Completed" },
    { title: "Design Feedback Dashboard UI", status: "Review" },
    { title: "Implement Sentiment Analysis Model", status: "In Progress" },
    { title: "Integrate Firestore listeners", status: "In Progress" },
    { title: "Write API endpoints for model", status: "Todo" },
    { title: "Prepare Mid-term Presentation", status: "Todo" },
  ];

  tasks.forEach(t => {
    const taskRef = doc(collection(db, "tasks"));
    batch.set(taskRef, {
      projectId: projectId,
      title: t.title,
      status: t.status,
      createdAt: serverTimestamp()
    });
  });

  // 3. Add Progress Updates
  const updates = [
    {
      title: "Completed Project Setup",
      description: "Initialized React app, configured Tailwind CSS and set up Firebase.",
      progressPercentage: 15,
      milestone: "M1",
      author: "23IT001@projecthub.edu"
    },
    {
      title: "Authentication Finished",
      description: "Users can now log in securely using Firebase Auth. Role-based access control is implemented.",
      progressPercentage: 30,
      milestone: "",
      author: "23IT002@projecthub.edu"
    },
    {
      title: "NLP Model MVP Ready",
      description: "Trained a basic sentiment analysis model using HuggingFace transformers.",
      progressPercentage: 45,
      milestone: "M2",
      author: "23IT003@projecthub.edu"
    }
  ];

  updates.forEach(u => {
    const updateRef = doc(collection(db, "updates"));
    batch.set(updateRef, {
      projectId: projectId,
      title: u.title,
      description: u.description,
      progressPercentage: u.progressPercentage,
      milestone: u.milestone,
      author: u.author,
      createdAt: serverTimestamp() // In a real script we'd offset timestamps, but this is fine
    });
  });

  // 4. Add Feedback (Thread)
  const feedbacks = [
    { text: "Great start on the authentication module. Make sure you are using secure HTTP-only cookies if you ever switch to a custom backend.", role: "faculty", author: "Dr. Smith" },
    { text: "Noted, sir! We are strictly using Firebase Client SDK for now so sessions are managed securely.", role: "student", author: "23IT001@projecthub.edu" },
    { text: "Could you provide more details on the NLP model's accuracy?", role: "faculty", author: "Dr. Smith" },
    { text: "We achieved an 87% accuracy on our validation set. I will upload the confusion matrix shortly.", role: "student", author: "23IT003@projecthub.edu" }
  ];

  feedbacks.forEach(f => {
    const fbRef = doc(collection(db, "feedback"));
    batch.set(fbRef, {
      projectId: projectId,
      text: f.text,
      role: f.role,
      author: f.author,
      status: "Open", // Thread level concept, but we store on message for MVP
      createdAt: serverTimestamp()
    });
  });

  // 5. Add Files (Links and dummy files)
  const files = [
    { fileName: "Project Proposal v1.pdf", category: "Project Proposal", type: "pdf", size: 2048000 },
    { fileName: "Database Schema.png", category: "Design", type: "image", size: 512000 },
    { fileName: "GitHub Repository", category: "Source Code", type: "link", fileUrl: "https://github.com/demo/project" },
    { fileName: "Project Demo Link", category: "Demo", type: "link", fileUrl: "https://youtu.be/demo" },
  ];

  files.forEach(f => {
    const fileRef = doc(collection(db, "files"));
    batch.set(fileRef, {
      projectId: projectId,
      fileName: f.fileName,
      category: f.category,
      type: f.type,
      size: f.size || 0,
      fileUrl: f.fileUrl || "https://example.com/dummy",
      version: 1,
      uploadedBy: "23IT001@projecthub.edu",
      status: "Approved",
      createdAt: serverTimestamp(),
      uploadedAt: serverTimestamp()
    });
  });

  try {
    await batch.commit();
    console.log("Successfully generated complete Demo Project for students!");
    console.log(`Student Accounts (Use password 'student'):`);
    console.log(`- 23IT001@projecthub.edu`);
    console.log(`- 23IT002@projecthub.edu`);
    console.log(`- 23IT003@projecthub.edu`);
    console.log(`Faculty Account (Use password 'faculty'):`);
    console.log(`- dr.smith@projecthub.edu`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed demo data:", error);
    process.exit(1);
  }
}

seedStudentDemo();
