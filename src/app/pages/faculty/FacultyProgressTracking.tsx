import React, { useState, useEffect } from "react";
import { TrendingUp, FileText, CheckCircle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router";

export function FacultyProgressTracking({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [updatesByProject, setUpdatesByProject] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      if (!user?.email) return;
      const q = query(collection(db, "projects"), where("facultyId", "==", user.email));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchProjects();
  }, [user]);

  useEffect(() => {
    if (projects.length === 0) return;
    
    // We limit to 10 projects for the "in" query due to Firestore limitations
    const projectIds = projects.map(p => p.id).slice(0, 10);
    if (projectIds.length === 0) return;

    const updatesQ = query(collection(db, "updates"), where("projectId", "in", projectIds));
    const unsub = onSnapshot(updatesQ, (snap) => {
      const grouped: Record<string, any[]> = {};
      projectIds.forEach(id => grouped[id] = []);
      
      snap.docs.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (grouped[data.projectId]) {
          grouped[data.projectId].push(data);
        }
      });
      
      // Sort updates by creation time for displaying recent
      for (const id in grouped) {
        grouped[id].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      }
      
      setUpdatesByProject(grouped);
    });

    return unsub;
  }, [projects]);

  if (loading) return <div className="p-8 text-slate-500 font-medium">Loading progress data...</div>;

  if (projects.length === 0) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed max-w-3xl">
        <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
          <TrendingUp size={24} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">No Projects Assigned</h3>
        <p className="text-slate-500 max-w-sm text-sm">You have no assigned projects to track progress for.</p>
      </div>
    );
  }

  // Pre-calculate project colors deterministically
  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-4 max-w-3xl">
      {projects.map((p, index) => {
        const pUpdates = updatesByProject[p.id] || [];
        
        // Progress is determined purely by the student's manual update (stored on the project)
        const progress = p.progress || 0;
        
        // Find the latest milestone achieved if any
        const milestoneUpdate = pUpdates.find(u => u.milestone);

        const color = colors[index % colors.length];

        return (
          <Card 
            key={p.id} 
            className="p-5 cursor-pointer hover:shadow-md transition-shadow border-slate-200 hover:border-indigo-200"
            onClick={() => navigate(`/faculty/workspace/${p.id}`)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
                <TrendingUp size={17} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm">{p.name || p.title || "Untitled Project"}</h3>
                <p className="text-xs text-slate-400">Team: {(p.team || []).join(", ")}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-extrabold" style={{ color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{progress}%</div>
                <StatusBadge status={p.status} />
              </div>
            </div>
            <ProgressBar value={progress} color={color} />
            
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <p className="text-slate-700 font-bold mb-2 flex items-center gap-1.5"><FileText size={12} className="text-indigo-500" /> Recent Updates</p>
                <div className="space-y-2">
                  {pUpdates.length === 0 ? (
                    <p className="text-slate-400 italic">No updates posted yet.</p>
                  ) : (
                    pUpdates.slice(0, 2).map((u) => (
                      <div key={u.id} className="border-l-2 border-slate-200 pl-2">
                        <p className="text-slate-600 font-bold line-clamp-1">{u.title}</p>
                        <p className="text-slate-500 line-clamp-1 text-[10px] mt-0.5">{u.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="bg-emerald-50/50 rounded-xl px-3 py-2.5 border border-emerald-100/50">
                <p className="text-emerald-700 font-bold mb-2 flex items-center gap-1.5"><CheckCircle size={12} /> Latest Milestone</p>
                <div className="space-y-1.5">
                  {milestoneUpdate ? (
                    <div>
                      <p className="text-emerald-700 font-bold bg-emerald-100/50 inline-block px-2 py-0.5 rounded text-[10px] mb-1">{milestoneUpdate.milestone}</p>
                      <p className="text-emerald-600 line-clamp-1">{milestoneUpdate.title}</p>
                    </div>
                  ) : (
                    <p className="text-emerald-600/60 italic mt-3">No milestones reached</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
