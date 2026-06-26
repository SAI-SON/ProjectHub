import React, { useState, useEffect } from "react";
import { CheckSquare, Bell, Folder, Code2, Calendar } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebase";

export function FacultyOverviewTab({ project }: { project: any }) {
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [updatesCount, setUpdatesCount] = useState(0);
  const [filesCount, setFilesCount] = useState(0);

  useEffect(() => {
    if (!project?.id) return;
    
    // Tasks
    const qTasks = query(collection(db, "tasks"), where("projectId", "==", project.id));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      const allTasks = snap.docs.map(d => d.data());
      setTaskStats({
        completed: allTasks.filter(t => t.status === "Completed").length,
        total: allTasks.length
      });
    });

    // Updates
    const qUpdates = query(collection(db, "updates"), where("projectId", "==", project.id));
    const unsubUpdates = onSnapshot(qUpdates, (snap) => {
      setUpdatesCount(snap.docs.length);
    });

    // Files
    const qFiles = query(collection(db, "files"), where("projectId", "==", project.id));
    const unsubFiles = onSnapshot(qFiles, (snap) => {
      setFilesCount(snap.docs.length);
    });

    return () => {
      unsubTasks();
      unsubUpdates();
      unsubFiles();
    };
  }, [project?.id]);

  const stats = [
    { label: "Tasks Completed", value: taskStats.completed.toString(), total: taskStats.total.toString(), icon: <CheckSquare size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Updates", value: updatesCount.toString(), total: "", icon: <Bell size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Files Uploaded", value: filesCount.toString(), total: "", icon: <Folder size={20} />, color: "text-amber-600", bg: "bg-amber-50" }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
          <div>
            <div className="text-slate-500 mb-1">Objectives</div>
            <div className="font-medium text-slate-800">{project.description || "No specific objectives listed."}</div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Technology Stack</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {project.techStack?.map((tech: string) => (
                <span key={tech} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                  {tech}
                </span>
              )) || <span className="text-slate-400">Not specified</span>}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Current Milestone</div>
            <div className="font-medium text-indigo-600">Development Phase</div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Upcoming Deadline</div>
            <div className="font-medium text-rose-600 flex items-center gap-1.5">
              <Calendar size={14} /> 12 July, 2026
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Project Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {stat.value} {stat.total && <span className="text-sm text-slate-400 font-medium">/ {stat.total}</span>}
              </div>
              <div className="text-sm text-slate-500 font-medium mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
