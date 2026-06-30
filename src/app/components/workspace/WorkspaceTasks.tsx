import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { Plus } from "lucide-react";

// Local inline Card to avoid import issues if Card isn't exported from App
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>{children}</div>;
}

export function WorkspaceTasks({ projectId, user, role = "student" }: { projectId: string; user?: any; role?: "student" | "faculty" }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const cols = ["Todo", "In Progress", "Review", "Completed"];

  useEffect(() => {
    const q = query(collection(db, "tasks"), where("projectId", "==", projectId));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(docs);
    });
    return unsub;
  }, [projectId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addDoc(collection(db, "tasks"), {
      projectId,
      title: newTaskTitle,
      status: "Todo",
      createdAt: serverTimestamp()
    });
    setNewTaskTitle("");
  };

  const moveTask = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "tasks", id), { status: newStatus });
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      {role === "student" && (
        <form onSubmit={addTask} className="flex gap-2 max-w-md">
          <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="New task title..." className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm"><Plus size={16}/></button>
        </form>
      )}
      <div className="flex gap-4 overflow-x-auto flex-1">
        {cols.map(col => (
          <div key={col} className="w-72 shrink-0 bg-slate-100 rounded-2xl p-4 flex flex-col max-h-full">
            <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center justify-between uppercase tracking-wider">
              {col} <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs">{tasks.filter(t => t.status === col).length}</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {tasks.filter(t => t.status === col).map(t => (
                <Card key={t.id} className="p-3 shadow-sm hover:shadow-md transition cursor-pointer border border-slate-200">
                  <p className="text-sm font-bold text-slate-700 mb-3 leading-relaxed">{t.title}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {cols.filter(c => c !== col).map(targetCol => (
                      <button key={targetCol} onClick={() => moveTask(t.id, targetCol)} className="text-[10px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-colors">
                        → {targetCol}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
