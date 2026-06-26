import React, { useState, useEffect } from "react";
import { ClipboardList, FileText, ThumbsUp, ThumbsDown } from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function FacultyApprovals({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPending() {
      const q = query(
        collection(db, "projects"), 
        where("facultyId", "==", user.email),
        where("status", "==", "Pending")
      );
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchPending();
  }, [user.email]);

  const decide = async (id: string, decision: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "projects", id), {
        status: decision === "Approved" ? "In Progress" : "Rejected",
        milestone: decision === "Approved" ? "Requirement Analysis" : "Proposal Rejected",
        progress: decision === "Approved" ? 10 : 0
      });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error updating decision");
    }
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading proposals...</div>;

  if (projects.length === 0) return (
    <div className="text-center py-20">
      <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-slate-700">No Pending Approvals</h3>
      <p className="text-sm text-slate-500 mt-2">You have caught up with all student proposals.</p>
    </div>
  );

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-slate-500 text-sm">{projects.length} proposals awaiting your review</p>
      {projects.map((p) => (
        <Card key={p.id} className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
              <p className="text-xs text-slate-400">{p.team[0]} · Team of {p.team.length} · {p.tech}</p>
            </div>
            <StatusBadge status="Pending" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => decide(p.id, "Approved")} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"><ThumbsUp size={14} /> Approve</button>
            <button onClick={() => decide(p.id, "Rejected")} className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition border border-red-200 flex items-center justify-center gap-2"><ThumbsDown size={14} /> Reject</button>
          </div>
        </Card>
      ))}
    </div>
  );
}
