import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FolderOpen, GitBranch } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";

export function StudentMyProjects({ user }: { user: any }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const q = query(collection(db, "projects"), where("team", "array-contains", user.email));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchProjects();
  }, [user.email]);

  const filters = ["All", "Pending", "In Progress", "Testing", "Completed"];
  const visible = filter === "All" ? projects : projects.filter((p) => p.status === filter);

  if (loading) return <div className="text-slate-400 text-sm">Loading projects...</div>;
  
  if (projects.length === 0) return (
    <div className="text-center py-20">
      <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-slate-700">No Projects Found</h3>
      <p className="text-sm text-slate-500 mt-2">Create a new project proposal from the sidebar to get started!</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"}`}>{f}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {visible.map((p) => (
          <Card key={p.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/student/workspace/${p.id}`)}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.color + "18" }}>
                <GitBranch size={18} style={{ color: p.color }} />
              </div>
              <StatusBadge status={p.status} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.name}</h3>
            <p className="text-xs text-slate-400 mb-3 truncate">{p.tech}</p>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Progress</span><span className="font-semibold" style={{ color: p.color }}>{p.progress}%</span></div>
              <ProgressBar value={p.progress} color={p.color} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 pt-3">
              <div><span className="text-slate-400">Guide</span><p className="font-semibold text-slate-700 truncate">{p.facultyName || p.facultyId}</p></div>
              <div><span className="text-slate-400">Milestone</span><p className="font-semibold text-slate-700 truncate">{p.milestone}</p></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
