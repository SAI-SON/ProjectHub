import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Card } from "../../components/ui/Card";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ProgressBar } from "../../components/ui/ProgressBar";

export function StudentAnalytics({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgProgress: 0,
    completedTasks: 0,
    pendingTasks: 0,
    milestonesDone: 0
  });
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.email) return;

      try {
        // 1. Fetch Projects
        const pQ = query(collection(db, "projects"), where("team", "array-contains", user.email));
        const pSnap = await getDocs(pQ);
        const fetchedProjects = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProjects(fetchedProjects);

        if (fetchedProjects.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate Average Progress
        const totalProgress = fetchedProjects.reduce((sum, p) => sum + (p.progress || 0), 0);
        const avgProgress = Math.round(totalProgress / fetchedProjects.length);

        const projectIds = fetchedProjects.map(p => p.id);
        const chunk = projectIds.slice(0, 10);

        // 2. Fetch Tasks
        const tQ = query(collection(db, "tasks"), where("projectId", "in", chunk));
        const tSnap = await getDocs(tQ);
        const tasks = tSnap.docs.map(d => d.data());

        const completedTasks = tasks.filter(t => t.status === "Completed").length;
        const pendingTasks = tasks.filter(t => t.status === "Todo" || t.status === "In Progress" || t.status === "Review").length;

        // 3. Fetch Updates
        const uQ = query(collection(db, "updates"), where("projectId", "in", chunk));
        const uSnap = await getDocs(uQ);
        const updates = uSnap.docs.map(d => d.data());

        const milestonesDone = updates.filter(u => u.milestone && u.milestone.trim() !== "").length;

        setStats({
          avgProgress,
          completedTasks,
          pendingTasks,
          milestonesDone
        });

        // 4. Calculate Weekly Activity (Last 7 Days)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0, 0, 0, 0);
          return {
            dateStr: d.toISOString().split("T")[0],
            day: days[d.getDay()],
            timestamp: d.getTime(),
            tasks: 0,
            updates: 0
          };
        });

        tasks.forEach(t => {
          if (t.createdAt) {
            const tDate = t.createdAt.toDate();
            tDate.setHours(0, 0, 0, 0);
            const dateStr = tDate.toISOString().split("T")[0];
            const dayObj = last7Days.find(d => d.dateStr === dateStr);
            if (dayObj) dayObj.tasks += 1;
          }
        });

        updates.forEach(u => {
          if (u.createdAt) {
            const uDate = u.createdAt.toDate();
            uDate.setHours(0, 0, 0, 0);
            const dateStr = uDate.toISOString().split("T")[0];
            const dayObj = last7Days.find(d => d.dateStr === dateStr);
            if (dayObj) dayObj.updates += 1;
          }
        });

        setActivityData(last7Days);

      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-slate-500 font-medium">Loading your analytics...</div>;
  }

  // Generate deterministic colors for projects based on index
  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Progress", value: `${stats.avgProgress}%`, color: "#4f46e5" }, 
          { label: "Completed Tasks", value: stats.completedTasks, color: "#10b981" }, 
          { label: "Pending Tasks", value: stats.pendingTasks, color: "#f59e0b" }, 
          { label: "Milestones Reached", value: stats.milestonesDone, color: "#06b6d4" }
        ].map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <div className="text-2xl font-extrabold mb-1" style={{ color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div className="text-slate-500 text-sm">{s.label}</div>
          </Card>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionTitle>Activity (Last 7 Days)</SectionTitle>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={activityData} barGap={4}>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="tasks" name="Tasks Created" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="updates" name="Updates Submitted" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No activity recorded recently.</div>
          )}
        </Card>
        
        <Card className="p-5">
          <SectionTitle>Project Progress Breakdown</SectionTitle>
          <div className="space-y-4 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
            {projects.length > 0 ? projects.map((p, index) => {
              const color = colors[index % colors.length];
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 truncate mr-2" title={p.name || p.title}>{p.name || p.title || "Untitled"}</span>
                    <span className="font-bold shrink-0" style={{ color: color }}>{p.progress || 0}%</span>
                  </div>
                  <ProgressBar value={p.progress || 0} color={color} />
                </div>
              );
            }) : (
              <div className="text-slate-400 text-sm">No active projects found.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
