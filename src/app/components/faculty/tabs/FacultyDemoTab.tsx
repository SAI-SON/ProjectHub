import React, { useState } from "react";
import { Video, ExternalLink, Download, CheckCircle, XCircle } from "lucide-react";

export function FacultyDemoTab({ project, user }: { project: any, user: any }) {
  const [demoStatus, setDemoStatus] = useState<"Pending" | "Approved" | "Rejected" | "Revision Requested">("Pending");

  // Mock demo data
  const demoData = {
    videoUrl: "https://example.com/demo.mp4",
    githubUrl: "https://github.com/student/project",
    liveUrl: "https://project-demo.com",
    reportUrl: "Final_Report.pdf",
    presentationUrl: "Project_Presentation.pptx",
    submittedAt: "22 Jun, 2026"
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Final Demo Review</h2>
          <p className="text-sm text-slate-500 mt-1">Review student submissions and provide final verdict.</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
          demoStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          demoStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          Status: {demoStatus}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submission Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Submission Links</h3>
            
            <a href={demoData.videoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><Video size={20} /></div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Demo Video</div>
                  <div className="text-xs text-slate-500">Watch the recorded demo</div>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-600" />
            </a>

            <a href={demoData.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center"><ExternalLink size={20} /></div>
                <div>
                  <div className="text-sm font-bold text-slate-800">GitHub Repository</div>
                  <div className="text-xs text-slate-500">Review source code</div>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-600" />
            </a>

            <a href={demoData.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><ExternalLink size={20} /></div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Live Website</div>
                  <div className="text-xs text-slate-500">Test functionality</div>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-600" />
            </a>
          </div>

          {/* Action Panel */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Faculty Actions</h3>
            <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
              <div className="text-sm text-slate-600 mb-6">
                Please review the demo video, source code, and live URL. Evaluate based on functionality, UI/UX, documentation, and innovation.
              </div>
              
              <div className="space-y-3">
                <button onClick={() => setDemoStatus('Approved')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition">
                  <CheckCircle size={16} /> Approve Demo
                </button>
                <button onClick={() => setDemoStatus('Revision Requested')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-bold transition">
                  Request Revision
                </button>
                <button onClick={() => setDemoStatus('Rejected')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-bold transition">
                  <XCircle size={16} /> Reject Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
