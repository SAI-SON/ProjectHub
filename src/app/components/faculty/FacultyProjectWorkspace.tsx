import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, LayoutDashboard, Users, CheckSquare, Flag, Bell, Folder, MessageSquare, Video, Star, Clock } from "lucide-react";
import { WorkspaceUpdates } from "../workspace/WorkspaceUpdates";
import { WorkspaceTeam } from "../workspace/WorkspaceTeam";
import { WorkspaceTasks } from "../workspace/WorkspaceTasks";
import { WorkspaceFiles } from "../workspace/WorkspaceFiles";
import { WorkspaceFeedback } from "../workspace/WorkspaceFeedback";

// We will build these Faculty-specific tabs in the next step
import { FacultyOverviewTab } from "./tabs/FacultyOverviewTab";
import { FacultyMilestonesTab } from "./tabs/FacultyMilestonesTab";
import { FacultyDemoTab } from "./tabs/FacultyDemoTab";
import { FacultyEvaluationTab } from "./tabs/FacultyEvaluationTab";
import { FacultyTimelineTab } from "./tabs/FacultyTimelineTab";

export function FacultyProjectWorkspace({ user }: { user: any }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      const docRef = doc(db, "projects", projectId as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) setProject({ id: snap.id, ...snap.data() });
    }
    fetchProject();
  }, [projectId]);

  if (!project) {
    return <div className="p-10 text-center text-slate-500">Loading workspace...</div>;
  }

  const TABS = [
    { id: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "Team Members", icon: <Users size={16} /> },
    { id: "Tasks", icon: <CheckSquare size={16} /> },
    { id: "Milestones", icon: <Flag size={16} /> },
    { id: "Updates", icon: <Bell size={16} /> },
    { id: "Files", icon: <Folder size={16} /> },
    { id: "Feedback", icon: <MessageSquare size={16} /> },
    { id: "Demo", icon: <Video size={16} /> },
    { id: "Evaluation", icon: <Star size={16} /> },
    { id: "Timeline", icon: <Clock size={16} /> }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen -m-5 lg:-m-6">
      
      {/* Workspace Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate("/faculty/assigned")}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Assigned Projects
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800 leading-tight">{project.name || project.title || 'Untitled Project'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {project.status || 'Active'}
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">{project.description}</p>
          </div>
          
          <div className="flex gap-6 items-center bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{project.progress || 0}%</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Team</div>
              <div className="text-sm font-bold text-slate-700">{project.teamSize || 0} Students</div>
            </div>
          </div>
        </div>

        {/* Workspace Navigation */}
        <div className="flex overflow-x-auto gap-2 mt-6 custom-scrollbar pb-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              {tab.id}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 p-6">
        <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === "Overview" && <FacultyOverviewTab project={project} />}
          {activeTab === "Team Members" && <WorkspaceTeam projectId={project.id} user={user} role="faculty" />}
          {activeTab === "Tasks" && <WorkspaceTasks projectId={project.id} user={user} role="faculty" />}
          {activeTab === "Milestones" && <FacultyMilestonesTab project={project} user={user} />}
          {activeTab === "Updates" && <WorkspaceUpdates projectId={project.id} user={user} role="faculty" />}
          {activeTab === "Files" && <WorkspaceFiles projectId={project.id} user={user} role="faculty" />}
          {activeTab === "Feedback" && <WorkspaceFeedback projectId={project.id} user={user} role="faculty" />}
          {activeTab === "Demo" && <FacultyDemoTab project={project} user={user} />}
          {activeTab === "Evaluation" && <FacultyEvaluationTab project={project} user={user} />}
          {activeTab === "Timeline" && <FacultyTimelineTab project={project} />}
        </div>
      </div>
    </div>
  );
}
