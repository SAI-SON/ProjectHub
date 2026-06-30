import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { Home, FolderOpen, Users, Building2, BarChart2, FileText, Settings, User } from "lucide-react";

import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { GenericProfile } from "../components/profile/GenericProfile";

// Lazy Loaded Pages
import { AdminDashboardHome } from "../pages/admin/AdminDashboardHome";
import { AdminAllProjects } from "../pages/admin/AdminAllProjects";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminDepartments } from "../pages/admin/AdminDepartments";
import { AdminAnalytics } from "../pages/admin/AdminAnalytics";
import { AdminSettings } from "../pages/admin/AdminSettings";

export function AdminLayout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const nav: { id: string; label: string; icon: React.ReactNode; path?: string }[] = [
    { id: "home", label: "Dashboard", icon: <Home size={17} />, path: "/admin" },
    { id: "all-projects", label: "All Projects", icon: <FolderOpen size={17} />, path: "/admin/all-projects" },
    { id: "users", label: "Users", icon: <Users size={17} />, path: "/admin/users" },
    { id: "departments", label: "Departments", icon: <Building2 size={17} />, path: "/admin/departments" },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={17} />, path: "/admin/analytics" },
    { id: "reports", label: "Reports", icon: <FileText size={17} />, path: "/admin/reports" },
    { id: "settings", label: "Settings", icon: <Settings size={17} />, path: "/admin/settings" },
    { id: "profile", label: "Profile", icon: <User size={17} />, path: "/admin/profile" },
  ];

  const getTitle = () => {
    const currentNav = nav.find(n => n.path === location.pathname);
    return currentNav ? currentNav.label : "Admin Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f1f5f9" }}>
      <Sidebar nav={nav} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role="admin" user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={getTitle()} onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/admin" element={<AdminDashboardHome />} />
              <Route path="/admin/all-projects" element={<AdminAllProjects />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/profile" element={<GenericProfile user={user} />} />
              <Route path="/admin/repository" element={<AdminAllProjects />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
