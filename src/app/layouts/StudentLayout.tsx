import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { Home, FolderOpen, Plus, Users, Upload, Paperclip, MessageSquare, Video, BarChart2, Trophy, User } from "lucide-react";

import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { GenericProfile } from "../components/profile/GenericProfile";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

// Lazy Loaded Pages
import { StudentDashboardHome } from "../pages/student/StudentDashboardHome";
import { StudentMyProjects } from "../pages/student/StudentMyProjects";
import { ProjectWorkspace } from "../pages/student/ProjectWorkspace";
import { StudentTeam } from "../components/student/StudentTeam";
import { StudentUpdates } from "../components/student/StudentUpdates";
import { StudentFiles } from "../components/student/StudentFiles";
import { StudentFeedback } from "../pages/student/StudentFeedback";
import { StudentAnalytics } from "../pages/student/StudentAnalytics";
import { StudentAchievements } from "../pages/student/StudentAchievements";
import { StudentCreateProject } from "../pages/student/StudentCreateProject";
import { StudentDemoCenter } from "../pages/student/StudentDemoCenter";

export function StudentLayout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const location = useLocation();

  React.useEffect(() => {
    if (!user?.email) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function setupFeedbackListener() {
      const q = query(collection(db, "projects"), where("team", "array-contains", user.email));
      const snap = await getDocs(q);
      if (!active) return;
      
      const projectIds = snap.docs.map(d => d.id);
      
      if (projectIds.length > 0) {
        // We only care about open feedback items for the badges
        // Firestore 'in' query allows up to 10 IDs.
        const chunk = projectIds.slice(0, 10);
        const fQ = query(collection(db, "feedback"), where("projectId", "in", chunk), where("status", "==", "Open"));
        unsubscribe = onSnapshot(fQ, (fSnap) => {
          if (!active) return;
          const docs = fSnap.docs.map(d => d.data());
          const unreadCount = docs.filter(d => !d.readBy?.includes(user.email)).length;
          setFeedbackCount(unreadCount);
        });
      }
    }
    setupFeedbackListener();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const nav: { id: string; label: string; icon: React.ReactNode; badge?: string; path?: string }[] = [
    { id: "home", label: "Dashboard", icon: <Home size={17} />, path: "/student" },
    { id: "projects", label: "My Projects", icon: <FolderOpen size={17} />, path: "/student/projects" },
    { id: "create", label: "Create Project", icon: <Plus size={17} />, path: "/student/create" },
    { id: "team", label: "Team Members", icon: <Users size={17} />, path: "/student/team" },
    { id: "updates", label: "Progress Updates", icon: <Upload size={17} />, path: "/student/updates" },
    { id: "files", label: "Files & Documents", icon: <Paperclip size={17} />, path: "/student/files" },
    { id: "feedback", label: "Feedback Center", icon: <MessageSquare size={17} />, badge: feedbackCount > 0 ? feedbackCount.toString() : undefined, path: "/student/feedback" },
    { id: "demo", label: "Demo Center", icon: <Video size={17} />, path: "/student/demo" },
    { id: "analytics", label: "Progress Analytics", icon: <BarChart2 size={17} />, path: "/student/analytics" },
    { id: "achievements", label: "Achievements", icon: <Trophy size={17} />, path: "/student/achievements" },
    { id: "profile", label: "Profile", icon: <User size={17} />, path: "/student/profile" },
  ];

  const getTitle = () => {
    if (location.pathname.includes("/workspace/")) return "Project Workspace";
    const currentNav = nav.find(n => n.path === location.pathname);
    return currentNav ? currentNav.label : "Student Portal";
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f1f5f9" }}>
      <Sidebar nav={nav} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role="student" user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={getTitle()} onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/student" element={<StudentDashboardHome user={user} />} />
              <Route path="/student/projects" element={<StudentMyProjects user={user} />} />
              <Route path="/student/workspace/:projectId" element={<ProjectWorkspace user={user} />} />
              <Route path="/student/team" element={<StudentTeam user={user} />} />
              <Route path="/student/updates" element={<StudentUpdates user={user} />} />
              <Route path="/student/files" element={<StudentFiles user={user} />} />
              <Route path="/student/feedback" element={<StudentFeedback user={user} />} />
              <Route path="/student/analytics" element={<StudentAnalytics user={user} />} />
              <Route path="/student/achievements" element={<StudentAchievements user={user} />} />
              <Route path="/student/demo" element={<StudentDemoCenter user={user} />} />
              <Route path="/student/profile" element={<GenericProfile user={user} />} />
              <Route path="/student/create" element={<StudentCreateProject user={user} />} />
              <Route path="*" element={<Navigate to="/student" replace />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
