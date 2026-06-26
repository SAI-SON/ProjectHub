import React from "react";
import { useNavigate } from "react-router";
import { FolderOpen, CheckSquare, MessageSquare, TrendingUp, CheckCircle, Target, Clock, Calendar, ArrowUpRight, Layers } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { STUDENT_PROJECTS, PROGRESS_DATA } from "../../mockData";

export function StudentDashboardHome() {
  const navigate = useNavigate();
  const stats = [
    { label: "My Projects", value: "3", sub: "+1 this semester", icon: <FolderOpen size={20} />, color: "#4f46e5", bg: "bg-indigo-50" },
    { label: "Pending Tasks", value: "5", sub: "Due this week", icon: <CheckSquare size={20} />, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "Faculty Feedback", value: "2", sub: "Awaiting response", icon: <MessageSquare size={20} />, color: "#06b6d4", bg: "bg-cyan-50" },
    { label: "Avg Progress", value: "78%", sub: "Across all projects", icon: <TrendingUp size={20} />, color: "#10b981", bg: "bg-emerald-50" },
  ];
  const activity = [
    { text: "Faculty approved your project proposal", time: "2 hours ago", type: "success" },
    { text: "Milestone 2 — UI Design completed", time: "Yesterday", type: "milestone" },
    { text: "New feedback from Dr. Kumar received", time: "2 days ago", type: "feedback" },
    { text: "Demo submission deadline in 5 days", time: "Ongoing", type: "warning" },
  ];
  const typeStyle: Record<string, string> = { success: "bg-emerald-100 text-emerald-600", milestone: "bg-indigo-100 text-indigo-600", feedback: "bg-cyan-100 text-cyan-600", warning: "bg-amber-100 text-amber-600" };
  const typeIcon: Record<string, React.ReactNode> = { success: <CheckCircle size={13} />, milestone: <Target size={13} />, feedback: <MessageSquare size={13} />, warning: <Clock size={13} /> };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Good morning, Sai! 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-500 shadow-sm">
          <Calendar size={15} /> {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "long", day: "numeric" })}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Active Projects</SectionTitle>
            <button onClick={() => navigate("/student/projects")} className="text-indigo-600 text-xs font-semibold hover:underline flex items-center gap-1">View all <ArrowUpRight size={13} /></button>
          </div>
          <div className="space-y-4">
            {STUDENT_PROJECTS.map((p) => (
              <div key={p.id} className="flex items-center gap-4 py-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "18" }}>
                  <Layers size={17} style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{p.name}</div>
                  <div className="text-xs text-slate-400 mb-1.5">{p.milestone}</div>
                  <ProgressBar value={p.progress} color={p.color} thin />
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ color: p.color }}>{p.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle>Recent Activity</SectionTitle>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-7 h-7 rounded-lg ${typeStyle[a.type]} flex items-center justify-center shrink-0 mt-0.5`}>{typeIcon[a.type]}</div>
                <div>
                  <p className="text-sm text-slate-700 leading-snug">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Project Progress — AI Resume Analyzer</SectionTitle>
          <StatusBadge status="In Progress" />
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={PROGRESS_DATA}>
            <defs>
              <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} formatter={(v: any) => [`${v}%`, "Progress"]} />
            <Area type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={2.5} fill="url(#sGrad)" dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
