import React from "react";
import { useNavigate } from "react-router";
import { Users, UserCheck, FolderOpen, Activity, CheckCircle, ClipboardList, Layers, ArrowUpRight } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PROJECTS_ALL } from "../../mockData";

export function HodDashboardHome() {
  const navigate = useNavigate();
  const stats = [
    { label: "Total Students", value: "180", sub: "CSE Department", icon: <Users size={20} />, color: "#4f46e5", bg: "bg-indigo-50" },
    { label: "Total Faculty", value: "15", sub: "Active guides", icon: <UserCheck size={20} />, color: "#7c3aed", bg: "bg-purple-50" },
    { label: "Total Projects", value: "65", sub: "This academic year", icon: <FolderOpen size={20} />, color: "#0891b2", bg: "bg-cyan-50" },
    { label: "Active Projects", value: "42", sub: "In progress now", icon: <Activity size={20} />, color: "#10b981", bg: "bg-emerald-50" },
    { label: "Completed", value: "23", sub: "Successfully finished", icon: <CheckCircle size={20} />, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "Pending Approvals", value: "8", sub: "Awaiting HOD review", icon: <ClipboardList size={20} />, color: "#ef4444", bg: "bg-red-50" },
  ];
  const activity = [
    { text: "AI Resume Analyzer submitted for review", time: "1 hour ago" },
    { text: "Smart Parking reached 80% completion", time: "3 hours ago" },
    { text: "Dr. Priya approved a new project proposal", time: "Yesterday" },
    { text: "Hospital Management project completed", time: "2 days ago" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CSE Department Dashboard 🏢</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview of all projects and faculty activity in your department.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Department Projects Overview</SectionTitle>
            <button onClick={() => navigate("/hod/dept-projects")} className="text-cyan-600 text-xs font-semibold hover:underline flex items-center gap-1">View all <ArrowUpRight size={13} /></button>
          </div>
          <div className="space-y-3">
            {PROJECTS_ALL.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "18" }}>
                  <Layers size={15} style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{p.name}</div>
                  <ProgressBar value={p.progress} color={p.color} thin />
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={p.status} />
                  <div className="text-xs text-slate-400 mt-1">{p.faculty}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle>Recent Activities</SectionTitle>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700 leading-snug">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
