import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FolderOpen, ClipboardList, Activity, CheckCircle, Star, TrendingUp, Layers, ArrowUpRight } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ProgressBar } from "../../components/ui/ProgressBar";

export function FacultyDashboardHome({ user }: { user: any }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    assigned: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    pendingEval: 0,
    avgProgress: 0
  });

  useEffect(() => {
    async function fetchFacultyData() {
      if (!user?.email) return;
      try {
        // Query assigned projects
        const pQ = query(collection(db, "projects"), where("facultyId", "==", user.email));
        const pSnap = await getDocs(pQ);
        const fetchedProjects = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        setProjects(fetchedProjects);

        // Compute stats
        const assigned = fetchedProjects.length;
        const pending = fetchedProjects.filter(p => p.status === "Pending").length;
        const inProgress = fetchedProjects.filter(p => p.status === "In Progress").length;
        const completed = fetchedProjects.filter(p => p.status === "Completed").length;
        const pendingEval = fetchedProjects.filter(p => (p.progress >= 90 || p.status === "Completed") && !p.grade).length;
        const avgProgress = assigned > 0 ? Math.round(fetchedProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / assigned) : 0;

        setCounts({
          assigned,
          pending,
          inProgress,
          completed,
          pendingEval,
          avgProgress
        });

        // Query activity logs for assigned projects
        if (assigned > 0) {
          const projectIds = fetchedProjects.map(p => p.id).slice(0, 10);
          const aQ = query(collection(db, "activityLogs"), where("projectId", "in", projectIds));
          const aSnap = await getDocs(aQ);
          const logs = aSnap.docs.map(d => d.data());
          // Sort client-side
          logs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

          const mappedActivities = logs.slice(0, 4).map(log => {
            const date = log.createdAt?.toDate() || new Date();
            const isRecent = (new Date().getTime() - date.getTime()) < 86400000;
            return {
              text: log.message || "Activity recorded",
              time: isRecent ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString()
            };
          });
          setActivities(mappedActivities);
        }
      } catch (err) {
        console.error("Error loading faculty dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFacultyData();
  }, [user?.email]);

  const stats = [
    { label: "Assigned Projects", value: counts.assigned.toString(), sub: "Under guidance", icon: <FolderOpen size={20} />, color: "#7c3aed", bg: "bg-purple-50" },
    { label: "Pending Approvals", value: counts.pending.toString(), sub: "Awaiting review", icon: <ClipboardList size={20} />, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "In Progress", value: counts.inProgress.toString(), sub: "Active development", icon: <Activity size={20} />, color: "#06b6d4", bg: "bg-cyan-50" },
    { label: "Completed", value: counts.completed.toString(), sub: "This semester", icon: <CheckCircle size={20} />, color: "#10b981", bg: "bg-emerald-50" },
    { label: "Pending Evals", value: counts.pendingEval.toString(), sub: "Awaiting marks", icon: <Star size={20} />, color: "#4f46e5", bg: "bg-indigo-50" },
    { label: "Avg Progress", value: `${counts.avgProgress}%`, sub: "Across all projects", icon: <TrendingUp size={20} />, color: "#ef4444", bg: "bg-red-50" },
  ];

  if (loading) return <div className="p-8 text-slate-500 font-medium">Loading dashboard data...</div>;

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
            {projects.length === 0 ? (
              <div className="text-slate-400 text-sm py-8 text-center bg-slate-50 rounded-xl border border-slate-100">No assigned projects yet.</div>
            ) : (
              projects.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition" onClick={() => navigate(`/faculty/workspace/${p.id}`)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (p.color || "#4f46e5") + "18" }}>
                    <Layers size={15} style={{ color: p.color || "#4f46e5" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{p.name}</div>
                    <ProgressBar value={p.progress || 0} color={p.color || "#4f46e5"} thin />
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold" style={{ color: p.color || "#4f46e5" }}>{p.progress || 0}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle>Recent Activities</SectionTitle>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-slate-400 text-sm py-8 text-center bg-slate-50 rounded-xl border border-slate-100">No recent activities.</div>
            ) : (
              activities.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">{a.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
