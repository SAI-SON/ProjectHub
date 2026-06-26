import React, { useState } from "react";
import { Check, X, Clock, AlertCircle } from "lucide-react";

export function FacultyMilestonesTab({ project, user }: { project: any, user: any }) {
  // Hardcoded milestones for demonstration
  const [milestones, setMilestones] = useState([
    { id: 1, name: "Requirement Analysis", status: "Approved", date: "15 Jan, 2026" },
    { id: 2, name: "System Design", status: "Approved", date: "28 Feb, 2026" },
    { id: 3, name: "Development Phase 1", status: "Review", date: "10 Apr, 2026" },
    { id: 4, name: "Development Phase 2", status: "Pending", date: "05 May, 2026" },
    { id: 5, name: "Testing & Bug Fixing", status: "Pending", date: "20 May, 2026" },
    { id: 6, name: "Final Documentation", status: "Pending", date: "10 Jun, 2026" },
    { id: 7, name: "Project Demo", status: "Pending", date: "25 Jun, 2026" }
  ]);

  const handleAction = (id: number, action: string) => {
    if (confirm(`Are you sure you want to ${action} this milestone?`)) {
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Revision Requested' } : m));
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Project Milestones</h2>
          <p className="text-sm text-slate-500 mt-1">Review and approve project phases.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {milestone.status === 'Approved' ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><Check size={16} className="text-emerald-600" /></div>
                ) : milestone.status === 'Review' ? (
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><AlertCircle size={16} className="text-amber-600" /></div>
                ) : milestone.status === 'Rejected' || milestone.status === 'Revision Requested' ? (
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"><X size={16} className="text-rose-600" /></div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Clock size={16} className="text-slate-400" /></div>
                )}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800">{milestone.name}</h3>
                  <span className="text-xs font-medium text-slate-400">{milestone.date}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    milestone.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                    milestone.status === 'Review' ? 'bg-amber-50 text-amber-600' :
                    milestone.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                    milestone.status === 'Revision Requested' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {milestone.status}
                  </span>
                  
                  {milestone.status === 'Review' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(milestone.id, 'Reject')} className="text-xs px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition">Reject</button>
                      <button onClick={() => handleAction(milestone.id, 'Revise')} className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold transition">Revise</button>
                      <button onClick={() => handleAction(milestone.id, 'Approve')} className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold transition">Approve</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
