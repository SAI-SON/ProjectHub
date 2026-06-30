import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { WorkspaceUpdates } from "../workspace/WorkspaceUpdates";
import { Upload, GitBranch } from "lucide-react";

export function StudentUpdates({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      if (!user?.email) return;
      const q = query(collection(db, "projects"), where("team", "array-contains", user.email));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchProjects();
  }, [user]);

  if (selectedProjectId) {
    return (
      <div className="h-full flex flex-col pt-2">
        <button onClick={() => setSelectedProjectId(null)} className="mb-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition text-left inline-flex items-center gap-1 w-fit">
          ← Back to Project Selection
        </button>
        <div className="flex-1 min-h-0 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <WorkspaceUpdates projectId={selectedProjectId} user={user} />
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading projects...</div>;

  if (projects.length === 0) return (
    <div className="text-center py-20">
      <Upload size={48} className="mx-auto text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-slate-700">No Projects Found</h3>
      <p className="text-sm text-slate-500 mt-2">You need to be part of a project to post updates.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Progress Updates</h2>
        <p className="text-sm text-slate-500 mt-1">Select a project to view or post progress updates.</p>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div key={p.id} onClick={() => setSelectedProjectId(p.id)} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: p.color ? p.color + "18" : "#f1f5f9" }}>
                <GitBranch size={18} style={{ color: p.color || "#64748b" }} />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-2">{p.name || p.title || "Untitled Project"}</h3>
            <p className="text-xs text-slate-500 mt-1 truncate">{p.description || "No description provided."}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Upload size={14} className="text-slate-400" /> Manage Updates
              </div>
              <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <span className="text-indigo-600 font-bold leading-none" style={{ fontSize: '10px' }}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
