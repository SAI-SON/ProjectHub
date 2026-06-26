import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { Home, FolderOpen, UserCheck, BarChart2, ClipboardList, Trophy, BookOpen, Megaphone, User } from "lucide-react";

import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { GenericProfile } from "../components/GenericProfile";

// Lazy Loaded Pages
import { HodDashboardHome } from "../pages/hod/HodDashboardHome";
import { HodDeptProjects } from "../pages/hod/HodDeptProjects";
import { HodFacultyMonitor } from "../pages/hod/HodFacultyMonitor";
import { HodDeptAnalytics } from "../pages/hod/HodDeptAnalytics";
import { HodProjectReviews } from "../pages/hod/HodProjectReviews";
import { HodTopProjects } from "../pages/hod/HodTopProjects";
import { HodAnnouncements } from "../pages/hod/HodAnnouncements";
import { AdminAllProjects } from "../pages/admin/AdminAllProjects"; // Shared for Repository

export function HodLayout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const nav: { id: string; label: string; icon: React.ReactNode; badge?: string; path?: string }[] = [
    { id: "home", label: "Dashboard", icon: <Home size={17} />, path: "/hod" },
    { id: "dept-projects", label: "Department Projects", icon: <FolderOpen size={17} />, path: "/hod/dept-projects" },
    { id: "faculty-monitor", label: "Faculty Monitoring", icon: <UserCheck size={17} />, path: "/hod/faculty-monitor" },
    { id: "dept-analytics", label: "Department Analytics", icon: <BarChart2 size={17} />, path: "/hod/dept-analytics" },
    { id: "project-reviews", label: "Project Reviews", icon: <ClipboardList size={17} />, badge: "8", path: "/hod/project-reviews" },
    { id: "top-projects", label: "Top Projects", icon: <Trophy size={17} />, path: "/hod/top-projects" },
    { id: "repository", label: "Project Repository", icon: <BookOpen size={17} />, path: "/hod/repository" },
    { id: "announcements", label: "Announcements", icon: <Megaphone size={17} />, path: "/hod/announcements" },
    { id: "profile", label: "Profile", icon: <User size={17} />, path: "/hod/profile" },
  ];

  const getTitle = () => {
    const currentNav = nav.find(n => n.path === location.pathname);
    return currentNav ? currentNav.label : "HOD Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f1f5f9" }}>
      <Sidebar nav={nav} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role="hod" user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={getTitle()} onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/hod" element={<HodDashboardHome />} />
              <Route path="/hod/dept-projects" element={<HodDeptProjects />} />
              <Route path="/hod/faculty-monitor" element={<HodFacultyMonitor />} />
              <Route path="/hod/dept-analytics" element={<HodDeptAnalytics />} />
              <Route path="/hod/project-reviews" element={<HodProjectReviews />} />
              <Route path="/hod/top-projects" element={<HodTopProjects />} />
              <Route path="/hod/announcements" element={<HodAnnouncements />} />
              <Route path="/hod/profile" element={<GenericProfile user={user} />} />
              <Route path="/hod/repository" element={<AdminAllProjects />} />
              <Route path="*" element={<Navigate to="/hod" replace />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
