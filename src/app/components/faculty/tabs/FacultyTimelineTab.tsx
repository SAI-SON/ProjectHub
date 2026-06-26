import React from "react";
import { Circle, Play, CheckCircle, Upload, Star } from "lucide-react";

export function FacultyTimelineTab({ project }: { project: any }) {
  // Hardcoded timeline for demonstration
  const events = [
    { id: 1, title: "Evaluation Completed", desc: "Dr. Priya K. assigned grade A+", time: "25 Jun, 2026", icon: <Star size={16} />, color: "bg-purple-100 text-purple-600" },
    { id: 2, title: "Demo Uploaded", desc: "Sai uploaded demo video and links", time: "22 Jun, 2026", icon: <Play size={16} />, color: "bg-indigo-100 text-indigo-600" },
    { id: 3, title: "Update Submitted", desc: "Authentication Module Completed", time: "10 Jun, 2026", icon: <Upload size={16} />, color: "bg-blue-100 text-blue-600" },
    { id: 4, title: "Milestone Approved", desc: "System Design approved by Dr. Priya K.", time: "28 Feb, 2026", icon: <CheckCircle size={16} />, color: "bg-emerald-100 text-emerald-600" },
    { id: 5, title: "Proposal Approved", desc: "Initial project proposal accepted", time: "15 Jan, 2026", icon: <CheckCircle size={16} />, color: "bg-emerald-100 text-emerald-600" },
    { id: 6, title: "Project Created", desc: "Team formed and project initialized", time: "10 Jan, 2026", icon: <Circle size={16} />, color: "bg-slate-200 text-slate-600" },
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Project Timeline</h2>
          <p className="text-sm text-slate-500 mt-1">Automatic activity history of the project lifecycle.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl">
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-8">
            {events.map((event, i) => (
              <div key={event.id} className="relative pl-8 group">
                <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-transform group-hover:scale-110 ${event.color}`}>
                  {event.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{event.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{event.desc}</p>
                  <span className="text-xs font-bold text-slate-400 mt-2 block">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
