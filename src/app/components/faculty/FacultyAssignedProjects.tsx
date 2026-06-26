import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router";
import { 
  FolderOpen, ClipboardList, CheckSquare, Video, CheckCircle, Archive, 
  Users, Activity, Clock, ChevronRight
} from "lucide-react";

export function FacultyAssignedProjects({ user }: { user: any }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("Active Projects");

  useEffect(() => {
    if (!user?.email) return;
    const q = query(collection(db, "projects"), where("facultyId", "==", user.email));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "In Progress" || p.status === "Development" || p.status === "Testing").length,
    pendingApprovals: projects.filter(p => p.status === "Pending").length,
    completed: projects.filter(p => p.status === "Completed").length,
    // Dynamic calculation based on project fields. If the backend adds these fields later, they will naturally be counted.
    pendingMilestones: projects.filter(p => p.pendingMilestones > 0 || p.hasPendingMilestone === true).length, 
    pendingDemos: projects.filter(p => p.pendingDemos > 0 || p.hasPendingDemo === true).length
  };

  const SIDEBAR_FILTERS = [
    { label: "Active Projects", icon: <Activity size={16} /> },
    { label: "Pending Approvals", icon: <ClipboardList size={16} />, badge: stats.pendingApprovals },
    { label: "Milestone Reviews", icon: <CheckSquare size={16} />, badge: stats.pendingMilestones },
    { label: "Demo Reviews", icon: <Video size={16} />, badge: stats.pendingDemos },
    { label: "Completed Projects", icon: <CheckCircle size={16} /> },
    { label: "Archived Projects", icon: <Archive size={16} /> },
  ];

  const getFilteredProjects = () => {
    switch (activeFilter) {
      case "Active Projects": return projects.filter(p => ["In Progress", "Development", "Testing"].includes(p.status || ""));
      case "Pending Approvals": return projects.filter(p => p.status === "Pending");
      case "Completed Projects": return projects.filter(p => p.status === "Completed");
      case "Archived Projects": return projects.filter(p => p.status === "Archived");
      default: return projects;
    }
  };

  const displayedProjects = getFilteredProjects();

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Assigned Projects", value: stats.total, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Pending Reviews", value: stats.pendingApprovals, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Pending Milestones", value: stats.pendingMilestones, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Demos", value: stats.pendingDemos, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completed Projects", value: stats.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(card => (
          <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
        {/* LEFT SIDEBAR */}
        <div className="w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Assigned Projects</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
            {SIDEBAR_FILTERS.map(filter => (
              <button 
                key={filter.label}
                onClick={() => setActiveFilter(filter.label)}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-colors ${activeFilter === filter.label ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={activeFilter === filter.label ? "text-indigo-600" : "text-slate-400"}>{filter.icon}</span>
                  {filter.label}
                </div>
                {filter.badge !== undefined && filter.badge > 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{filter.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT: Project List */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">{activeFilter}</h2>
          </div>

          {displayedProjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 mt-20">
              <FolderOpen size={48} className="mb-4 opacity-50" />
              <p>No projects found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {displayedProjects.map(project => (
                <div 
                  key={project.id} 
                  onClick={() => navigate(`/faculty/workspace/${project.id}`)}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">{project.name || project.title || 'Untitled Project'}</h3>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                      {project.status || "Pending"}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-500">Overall Progress</span>
                      <span className="text-indigo-600 font-bold">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" />
                      Team: {project.teamSize || 0} Students
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      Updated recently
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} className="text-indigo-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
