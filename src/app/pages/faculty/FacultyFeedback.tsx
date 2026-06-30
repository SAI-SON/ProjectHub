import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { WorkspaceFeedback } from "../../components/workspace/WorkspaceFeedback";
import { MessageSquare } from "lucide-react";

export function FacultyFeedback({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

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
    if (!user?.email || projects.length === 0) return;
    
    const projectIds = projects.map(p => p.id);
    const chunk = projectIds.slice(0, 10);
    const fQ = query(collection(db, "feedback"), where("projectId", "in", chunk), where("status", "==", "Open"));
    
    const unsub = onSnapshot(fQ, (snap) => {
      const counts: Record<string, number> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (!data.readBy?.includes(user.email)) {
          counts[data.projectId] = (counts[data.projectId] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    });
    
    return unsub;
  }, [projects, user?.email]);

  if (selectedProjectId) {
    return (
      <div className="h-full flex flex-col p-6 pt-2">
        <button onClick={() => setSelectedProjectId(null)} className="mb-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition text-left inline-flex items-center gap-1 w-fit">
          ← Back to Projects
        </button>
        <div className="flex-1 min-h-0 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <WorkspaceFeedback projectId={selectedProjectId} user={user} role="faculty" />
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-slate-500 font-medium">Loading your projects...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Feedback Center</h2>
        <p className="text-sm text-slate-500 mb-6 -mt-4">Select an assigned project to review and post feedback.</p>
        
        {projects.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">No Projects Assigned</h3>
            <p className="text-slate-500 max-w-sm text-sm">You do not have any active project assignments.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div key={p.id} onClick={() => setSelectedProjectId(p.id)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-2">{p.name || p.title || "Untitled Project"}</h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">{p.status}</span>
                </div>
                
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <MessageSquare size={14} /> Open Feedback Thread →
                  {unreadCounts[p.id] > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {unreadCounts[p.id]} New
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
