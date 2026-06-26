import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { Home, ClipboardList, FolderOpen, TrendingUp, MessageSquare, CheckSquare, Star, Video, BookOpen, User } from "lucide-react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { GenericProfile } from "../components/GenericProfile";

// Lazy Loaded Pages
import { FacultyDashboardHome } from "../pages/faculty/FacultyDashboardHome";
import { FacultyApprovals } from "../pages/faculty/FacultyApprovals";
import { FacultyProgressTracking } from "../pages/faculty/FacultyProgressTracking";
import { FacultyFeedback } from "../pages/faculty/FacultyFeedback";
import { AdminAllProjects } from "../pages/admin/AdminAllProjects"; // For Repository

import { FacultyAssignedProjects } from "../components/faculty/FacultyAssignedProjects";
import { FacultyProjectWorkspace } from "../components/faculty/FacultyProjectWorkspace";

export function FacultyLayout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    async function fetchPendingCount() {
      const q = query(
        collection(db, "projects"), 
        where("facultyId", "==", user.email),
        where("status", "==", "Pending")
      );
      const snap = await getDocs(q);
      setPendingCount(snap.docs.length);
    }
    fetchPendingCount();
  }, [user.email, location.pathname]); 

  const [feedbackCount, setFeedbackCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.email) return;
    let unsubscribe: () => void;

    async function setupFeedbackListener() {
      const q = query(collection(db, "projects"), where("facultyId", "==", user.email));
      const snap = await getDocs(q);
      const projectIds = snap.docs.map(d => d.id);
      
      if (projectIds.length > 0) {
        // Only track "Open" status feedback for badges
        const chunk = projectIds.slice(0, 10);
        const fQ = query(collection(db, "feedback"), where("projectId", "in", chunk), where("status", "==", "Open"));
        unsubscribe = onSnapshot(fQ, (fSnap) => {
          const docs = fSnap.docs.map(d => d.data());
          // If the user is the faculty, they want to see messages unread by them.
          const unreadCount = docs.filter(d => !d.readBy?.includes(user.email)).length;
          setFeedbackCount(unreadCount);
        });
      }
    }
    setupFeedbackListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const nav: { id: string; label: string; icon: React.ReactNode; badge?: string; path?: string }[] = [
    { id: "home", label: "Dashboard", icon: <Home size={17} />, path: "/faculty" },
    { id: "approvals", label: "Project Approvals", icon: <ClipboardList size={17} />, badge: pendingCount > 0 ? pendingCount.toString() : undefined, path: "/faculty/approvals" },
    { id: "assigned", label: "Assigned Projects", icon: <FolderOpen size={17} />, path: "/faculty/assigned" },
    { id: "progress", label: "Progress Tracking", icon: <TrendingUp size={17} />, path: "/faculty/progress" },
    { id: "feedback", label: "Feedback Center", icon: <MessageSquare size={17} />, badge: feedbackCount > 0 ? feedbackCount.toString() : undefined, path: "/faculty/feedback" },
    { id: "repository", label: "Project Repository", icon: <BookOpen size={17} />, path: "/faculty/repository" },
    { id: "profile", label: "Profile", icon: <User size={17} />, path: "/faculty/profile" },
  ];

  const getTitle = () => {
    const currentNav = nav.find(n => n.path === location.pathname);
    return currentNav ? currentNav.label : "Faculty Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f1f5f9" }}>
      <Sidebar nav={nav} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role="faculty" user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={getTitle()} onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/faculty" element={<FacultyDashboardHome />} />
              <Route path="/faculty/approvals" element={<FacultyApprovals user={user} />} />
              <Route path="/faculty/assigned" element={<FacultyAssignedProjects user={user} />} />
              <Route path="/faculty/workspace/:projectId" element={<FacultyProjectWorkspace user={user} />} />
              <Route path="/faculty/progress" element={<FacultyProgressTracking user={user} />} />
              <Route path="/faculty/feedback" element={<FacultyFeedback user={user} />} />
              <Route path="/faculty/profile" element={<GenericProfile user={user} />} />
              <Route path="/faculty/repository" element={<AdminAllProjects />} />
              <Route path="*" element={<Navigate to="/faculty" replace />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
