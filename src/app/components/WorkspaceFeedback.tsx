import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { MessageSquare, Send, CheckCircle, RotateCcw } from "lucide-react";

export function WorkspaceFeedback({ projectId, user, role = "student" }: { projectId: string; user: any; role?: "student" | "faculty" }) {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [newFeedback, setNewFeedback] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "feedback"),
      where("projectId", "==", projectId)
    );
    const unsub = onSnapshot(q, (snap) => {
      // Sorting locally: ascending order (oldest at top, newest at bottom)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
      setFeedbackList(data);
    });
    return unsub;
  }, [projectId]);

  useEffect(() => {
    // Mark incoming feedback as read by the current user
    if (!user?.email || feedbackList.length === 0) return;
    
    const unreadItems = feedbackList.filter(f => !f.readBy?.includes(user.email));
    if (unreadItems.length > 0) {
      unreadItems.forEach(async (item) => {
        try {
          await updateDoc(doc(db, "feedback", item.id), {
            readBy: arrayUnion(user.email)
          });
        } catch (error) {
          console.error("Error marking feedback as read", error);
        }
      });
    }
  }, [feedbackList, user?.email]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;
    
    await addDoc(collection(db, "feedback"), {
      projectId,
      text: newFeedback,
      status: "Open",
      author: user.name,
      role: role,
      createdAt: serverTimestamp(),
      readBy: [user.email] // The author has read their own message
    });
    setNewFeedback("");
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (role !== "faculty") return; // Only faculty can resolve
    await updateDoc(doc(db, "feedback", id), {
      status: currentStatus === "Open" ? "Resolved" : "Open"
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Project Feedback</h2>
          <p className="text-sm text-slate-500 mt-1">Communicate with the team to provide guidance.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar min-h-[400px]">
        <div className="space-y-4 max-w-3xl mx-auto">
          {feedbackList.length === 0 && (
            <div className="text-center text-slate-400 py-10 font-medium">
              No feedback has been posted yet.
            </div>
          )}
          {feedbackList.map(item => (
            <div key={item.id} className={`p-4 rounded-xl border ${item.status === 'Resolved' ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'Resolved' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                    <MessageSquare size={14} className={item.status === 'Resolved' ? 'text-slate-500' : 'text-indigo-600'} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{item.author} <span className="text-xs font-normal text-slate-400">({item.role})</span></div>
                    <div className="text-xs text-slate-400">{item.createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Just now'}</div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleStatus(item.id, item.status)}
                  disabled={role !== "faculty"}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                    item.status === 'Open' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  } ${role !== "faculty" ? "opacity-70 cursor-default" : ""}`}
                >
                  {item.status === 'Open' ? <><CheckCircle size={12} /> {role === 'faculty' ? 'Resolve' : 'Open'}</> : <><RotateCcw size={12} /> {role === 'faculty' ? 'Reopen' : 'Resolved'}</>}
                </button>
              </div>
              <p className={`text-sm mt-3 ${item.status === 'Resolved' ? 'text-slate-500 line-through opacity-70' : 'text-slate-700'}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
        <form onSubmit={handleSend} className="flex gap-3 max-w-3xl mx-auto">
          <input 
            type="text" 
            placeholder="Type your feedback or reply..." 
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
