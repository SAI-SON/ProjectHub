import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle, RotateCcw } from "lucide-react";

export function FacultyFeedbackTab({ project, user }: { project: any, user: any }) {
  const [feedback, setFeedback] = useState([
    { id: 1, text: "Improve dashboard responsiveness for mobile devices.", status: "Open", date: "24 Jun, 2026", author: "Dr. Priya K." },
    { id: 2, text: "Include authentication flow in the SRS document.", status: "Resolved", date: "15 May, 2026", author: "Dr. Priya K." }
  ]);
  const [newFeedback, setNewFeedback] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;
    setFeedback([{
      id: Date.now(),
      text: newFeedback,
      status: "Open",
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: user.name
    }, ...feedback]);
    setNewFeedback("");
  };

  const toggleStatus = (id: number) => {
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: f.status === "Open" ? "Resolved" : "Open" } : f));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Faculty Feedback</h2>
          <p className="text-sm text-slate-500 mt-1">Communicate with the team to provide guidance.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
        <div className="space-y-4 max-w-3xl mx-auto">
          {feedback.map(item => (
            <div key={item.id} className={`p-4 rounded-xl border ${item.status === 'Resolved' ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'Resolved' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                    <MessageSquare size={14} className={item.status === 'Resolved' ? 'text-slate-500' : 'text-indigo-600'} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{item.author}</div>
                    <div className="text-xs text-slate-400">{item.date}</div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleStatus(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                    item.status === 'Open' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {item.status === 'Open' ? <><CheckCircle size={12} /> Resolve</> : <><RotateCcw size={12} /> Reopen</>}
                </button>
              </div>
              <p className={`text-sm mt-3 ${item.status === 'Resolved' ? 'text-slate-500 line-through opacity-70' : 'text-slate-700'}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-3 max-w-3xl mx-auto">
          <input 
            type="text" 
            placeholder="Type your feedback..." 
            value={newFeedback}
            onChange={e => setNewFeedback(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            type="submit"
            disabled={!newFeedback.trim()}
            className="flex items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
