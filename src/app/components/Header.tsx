import React from "react";
import { Menu, Search, Bell } from "lucide-react";
import { Avatar } from "./ui/Avatar";

export function Header({ title, onMenuClick, user }: { title: string; onMenuClick: () => void; user: { avatar: string; color: string } }) {
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-5 gap-4 shrink-0">
      <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={onMenuClick}><Menu size={20} /></button>
      <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-36" placeholder="Search…" />
        </div>
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
        <Avatar initials={user.avatar} color={user.color} size="sm" />
      </div>
    </header>
  );
}
