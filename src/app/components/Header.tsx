import React, { useState, useEffect, useRef } from "react";
import { Menu, Search, Bell, MessageSquare, FileText, CheckCircle, AlertCircle, Check, Trash2 } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";

export function Header({ title, onMenuClick, user }: { title: string; onMenuClick: () => void; user: any }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.email) return;

    // Set up a real-time listener for notifications
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.email)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      // Client-side sort by createdAt desc
      fetched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(fetched);
    });

    // Auto-seed mock notifications if the user has none (for demonstration purposes)
    async function seedMockIfNeeded() {
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "notifications"), {
          userId: user.email,
          title: "Welcome to ProjectHub",
          message: "Explore your dashboard, track milestones, and collaborate with your team.",
          read: false,
          type: "system",
          createdAt: serverTimestamp()
        });
        await addDoc(collection(db, "notifications"), {
          userId: user.email,
          title: "Setup Complete",
          message: "Your profile has been synchronized. Change your password in the Profile tab.",
          read: false,
          type: "system",
          createdAt: serverTimestamp()
        });
      }
    }
    seedMockIfNeeded();

    return unsub;
  }, [user?.email]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const n of unreadNotifications) {
        await updateDoc(doc(db, "notifications", n.id), { read: true });
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "proposal":
        return <FileText size={14} className="text-purple-600" />;
      case "feedback":
        return <MessageSquare size={14} className="text-indigo-600" />;
      case "task":
        return <CheckCircle size={14} className="text-emerald-600" />;
      case "system":
      default:
        return <AlertCircle size={14} className="text-blue-600" />;
    }
  };

  const formatTime = (createdAt: any) => {
    if (!createdAt) return "Just now";
    try {
      const date = createdAt.toDate();
      const diff = new Date().getTime() - date.getTime();
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return "Just now";
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-5 gap-4 shrink-0 relative">
      <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={onMenuClick}><Menu size={20} /></button>
      <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
      
      <div className="ml-auto flex items-center gap-3 relative" ref={dropdownRef}>
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-36" placeholder="Search…" />
        </div>

        {/* Bell Button */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition cursor-pointer"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white ring-1 ring-indigo-500/20 animate-pulse" />
          )}
        </button>

        {/* Notifications Popover */}
        {showNotifications && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-fadeIn max-h-[400px]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  <Check size={13} /> Mark read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm bg-white">
                  <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                  No new notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-3.5 flex gap-3 hover:bg-slate-50/80 transition cursor-pointer relative group ${!n.read ? "bg-indigo-50/10" : "bg-white"}`}
                  >
                    {!n.read && (
                      <div className="absolute top-4 left-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    )}
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 pr-4 leading-tight">{n.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{formatTime(n.createdAt)}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition shrink-0 self-start mt-0.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <Avatar initials={user.avatar} color={user.color} size="sm" />
      </div>
    </header>
  );
}
