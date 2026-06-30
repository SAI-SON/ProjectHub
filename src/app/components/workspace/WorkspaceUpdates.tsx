import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { Plus, GitCommit } from "lucide-react";

export function WorkspaceUpdates({ projectId, user, role = "student" }: { projectId: string; user: any; role?: "student" | "faculty" }) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [progress, setProgress] = useState<number | "">("");
  const [milestone, setMilestone] = useState("");

  useEffect(() => {
    const q = query(collection(db, "updates"), where("projectId", "==", projectId));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Client-side sort to avoid requiring a composite index in Firestore
      fetched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setUpdates(fetched);
    });
    return unsub;
  }, [projectId]);

  const addUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    
    // Save the update
    await addDoc(collection(db, "updates"), {
      projectId,
      author: user.name || user.email,
      title,
      description: desc,
      progressPercentage: Number(progress) || 0,
      milestone,
      createdAt: serverTimestamp()
    });
    
    // Update the parent project progress if specified
    if (Number(progress) > 0) {
      await updateDoc(doc(db, "projects", projectId), { progress: Number(progress) });
    }

    // Add activity log
    await addDoc(collection(db, "activityLogs"), {
      projectId,
      message: `${user.name || user.email} posted update: ${title}`,
      createdAt: serverTimestamp()
    });

    setTitle("");
    setDesc("");
    setProgress("");
    setMilestone("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-6">
      {role === "student" && (
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Post an Update</h3>
            <form onSubmit={addUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Authentication Module Finished" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} required placeholder="What was completed?" rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Progress %</label>
                  <input type="number" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Milestone</label>
                  <select value={milestone} onChange={e => setMilestone(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                    <option value="">None</option>
                    <option value="M1">Milestone 1</option>
                    <option value="M2">Milestone 2</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2">
                <Plus size={16} /> Post Update
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Feed */}
      <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar ${role === "student" ? "" : "w-full"}`}>
        <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Progress Timeline</h3>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {updates.length === 0 ? (
            <p className="text-slate-400 text-sm text-center pt-10 relative z-10 bg-slate-50/50 py-4 mx-10 rounded-2xl border border-slate-200">No updates posted yet.</p>
          ) : updates.map((up) => (
            <div key={up.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-[4px] border-[#f1f5f9] bg-indigo-100 text-indigo-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <GitCommit size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">{up.title}</h4>
                  {up.progressPercentage > 0 && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{up.progressPercentage}% Progress</span>}
                </div>
                <p className="text-[11px] text-slate-400 mb-3 font-medium uppercase tracking-wider">By {up.author} {up.milestone && `· ${up.milestone}`}</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">{up.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
