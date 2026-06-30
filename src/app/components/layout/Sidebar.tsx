import React from "react";
import { GraduationCap, LogOut, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Role } from "../../types";
import { Avatar } from "../ui/Avatar";

export function Sidebar({ nav, onLogout, open, onClose, role, user }: {
  nav: { id: string; label: string; icon: React.ReactNode; badge?: string; path?: string }[];
  onLogout: () => void; open: boolean; onClose: () => void;
  role: Role; user: { name: string; sub: string; avatar: string; color: string };
}) {
  const roleColors: Record<Role, string> = { student: "#4f46e5", hod: "#0891b2", faculty: "#7c3aed", admin: "#dc2626" };
  const roleLabels: Record<Role, string> = { student: "Student Portal", hod: "HOD Dashboard", faculty: "Faculty Portal", admin: "Admin Console" };
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#1e1b4b" }}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: roleColors[role] }}>
            <GraduationCap size={17} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ProjectHub</div>
            <div className="text-indigo-400 text-xs">{roleLabels[role]}</div>
          </div>
          <button className="ml-auto lg:hidden text-indigo-300 hover:text-white" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="mx-3 mt-4 mb-2 px-3 py-3 rounded-xl bg-white/5 flex items-center gap-3">
          <Avatar initials={user.avatar} color={user.color} size="md" />
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user.name}</div>
            <div className="text-indigo-300 text-xs truncate">{user.sub}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 space-y-0.5">
          {nav.map((item) => {
            const path = item.path || `/${role}/${item.id === "home" ? "" : item.id}`;
            const active = location.pathname === path || (item.id !== "home" && location.pathname.startsWith(path));
            return (
              <button key={item.id} onClick={() => { navigate(path); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-indigo-200 hover:bg-white/5 hover:text-white"}`}>
                <span className={active ? "text-white" : "text-indigo-400"}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-300 hover:text-white hover:bg-white/6 transition text-sm font-medium">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
