import React, { useState } from "react";
import { auth } from "../firebase";

import { LoginScreen } from "./components/auth/LoginScreen";
import { StudentLayout } from "./layouts/StudentLayout";
import { HodLayout } from "./layouts/HodLayout";
import { FacultyLayout } from "./layouts/FacultyLayout";
import { AdminLayout } from "./layouts/AdminLayout";

export default function App() {
  const [activeUser, setActiveUser] = useState<any>(() => {
    const saved = localStorage.getItem("projectHubUser");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const handleLogin = (user: any) => {
    localStorage.setItem("projectHubUser", JSON.stringify(user));
    setActiveUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("projectHubUser");
    auth.signOut().catch(console.error);
    setActiveUser(null);
  };

  if (!activeUser) return <LoginScreen onLogin={handleLogin} />;
  
  if (activeUser.role === "student") return <StudentLayout user={activeUser} onLogout={handleLogout} />;
  if (activeUser.role === "hod")     return <HodLayout     user={activeUser} onLogout={handleLogout} />;
  if (activeUser.role === "faculty") return <FacultyLayout user={activeUser} onLogout={handleLogout} />;
  return <AdminLayout user={activeUser} onLogout={handleLogout} />;
}
