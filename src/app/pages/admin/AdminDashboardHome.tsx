import React from "react";
import { useNavigate } from "react-router";
import { Users, UserCheck, FolderOpen, Building2, Activity, TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { MONTHLY_PROJ } from "../../mockData";

export function AdminDashboardHome() {
  const navigate = useNavigate();
  const stats = [
    { label: "Total Students", value: "720", sub: "Across all depts", icon: <Users size={20} />, color: "#4f46e5", bg: "bg-indigo-50" },
    { label: "Total Faculty", value: "48", sub: "Active mentors", icon: <UserCheck size={20} />, color: "#7c3aed", bg: "bg-purple-50" },
    { label: "Total Projects", value: "215", sub: "Platform-wide", icon: <FolderOpen size={20} />, color: "#0891b2", bg: "bg-cyan-50" },
    { label: "Departments", value: "4", sub: "CSE, AI&DS, IT, ECE", icon: <Building2 size={20} />, color: "#10b981", bg: "bg-emerald-50" },
    { label: "Active This Term", value: "142", sub: "In progress now", icon: <Activity size={20} />, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "Completion Rate", value: "73%", sub: "Overall platform", icon: <TrendingUp size={20} />, color: "#ef4444", bg: "bg-red-50" },
  ];
  const deptStats = [
    { dept: "CSE", projects: 65, students: 180, color: "#4f46e5" },
    { dept: "AI & DS", projects: 48, students: 140, color: "#7c3aed" },
    { dept: "IT", projects: 55, students: 200, color: "#0891b2" },
    { dept: "ECE", projects: 47, students: 200, color: "#10b981" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Admin Console 🛡️</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform-wide overview of all departments, users, and projects.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Departments Overview</SectionTitle>
            <button onClick={() => navigate("/admin/departments")} className="text-red-600 text-xs font-semibold hover:underline flex items-center gap-1">Manage <ArrowUpRight size={13} /></button>
          </div>
          <div className="space-y-4">
            {deptStats.map((d) => (
              <div key={d.dept} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: d.color }}>{d.dept}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-slate-800">{d.dept}</span><span className="text-slate-400">{d.projects} projects</span></div>
                  <ProgressBar value={(d.projects / 65) * 100} color={d.color} thin />
                </div>
                <div className="text-xs text-slate-400 shrink-0">{d.students} students</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle>Platform Project Activity</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_PROJ}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="new" name="New" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
