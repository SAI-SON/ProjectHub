import React from "react";
import { useNavigate } from "react-router";
import { FolderOpen, ClipboardList, Activity, CheckCircle, Star, TrendingUp, Layers, ArrowUpRight } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PROJECTS_ALL } from "../../mockData";

export function FacultyDashboardHome() {
  const navigate = useNavigate();
  const stats = [
    { label: "Assigned Projects", value: "12", sub: "Under guidance", icon: <FolderOpen size={20} />, color: "#7c3aed", bg: "bg-purple-50" },
    { label: "Pending Approvals", value: "4", sub: "Awaiting review", icon: <ClipboardList size={20} />, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "In Progress", value: "8", sub: "Active development", icon: <Activity size={20} />, color: "#06b6d4", bg: "bg-cyan-50" },
    { label: "Completed", value: "5", sub: "This semester", icon: <CheckCircle size={20} />, color: "#10b981", bg: "bg-emerald-50" },
    { label: "Pending Evals", value: "3", sub: "Awaiting marks", icon: <Star size={20} />, color: "#4f46e5", bg: "bg-indigo-50" },
    { label: "Avg Progress", value: "67%", sub: "Across all projects", icon: <TrendingUp size={20} />, color: "#ef4444", bg: "bg-red-50" },
  ];
  const activity = [
    { text: "AI Resume Analyzer submitted an update", time: "2 hours ago" },
    { text: "Smart Parking milestone completed", time: "Yesterday" },
    { text: "Hospital Management demo uploaded", time: "2 days ago" },
    { text: "Student requested project approval", time: "3 days ago" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Faculty Dashboard 👨‍🏫</h1>
        <p className="text-slate-500 text-sm mt-0.5">Monitor your assigned projects, provide feedback, and evaluate student work.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Assigned Projects</SectionTitle>
            <button onClick={() => navigate("/faculty/assigned")} className="text-purple-600 text-xs font-semibold hover:underline flex items-center gap-1">View all <ArrowUpRight size={13} /></button>
          </div>
          <div className="space-y-3">
            {PROJECTS_ALL.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "18" }}>
                  <Layers size={15} style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{p.name}</div>
                  <ProgressBar value={p.progress} color={p.color} thin />
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold" style={{ color: p.color }}>{p.progress}%</span>
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
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
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
