import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { WorkspaceTeam } from "./WorkspaceTeam";
import { Users, Mail, Check, X } from "lucide-react";

export function StudentTeam({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      if (!user?.email) return;
      const q = query(collection(db, "projects"), where("team", "array-contains", user.email));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchProjects();

    // Listen for invitations
    if (user?.email) {
      const invQ = query(collection(db, "invitations"), where("inviteeEmail", "==", user.email), where("status", "==", "pending"));
      const unsub = onSnapshot(invQ, (snap) => {
        setInvitations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return unsub;
    }
  }, [user]);

  const handleAccept = async (inv: any) => {
    // 1. Add to project team
    await updateDoc(doc(db, "projects", inv.projectId), {
      team: arrayUnion(user.email)
    });
    // 2. Mark invitation as accepted
    await updateDoc(doc(db, "invitations", inv.id), {
      status: "accepted"
    });
    // Refresh projects list
    const q = query(collection(db, "projects"), where("team", "array-contains", user.email));
    const snap = await getDocs(q);
    setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleDecline = async (invId: string) => {
    await updateDoc(doc(db, "invitations", invId), {
      status: "declined"
    });
  };

  if (selectedProjectId) {
    return (
      <div className="h-full flex flex-col p-6 pt-2">
        <button onClick={() => setSelectedProjectId(null)} className="mb-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition text-left inline-flex items-center gap-1 w-fit">
          ← Back to Project Teams
        </button>
        <div className="flex-1 min-h-0 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <WorkspaceTeam projectId={selectedProjectId} user={user} />
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-slate-500 font-medium">Loading your teams...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8">
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <Mail size={18} className="text-indigo-600" /> Pending Project Invitations ({invitations.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {invitations.map(inv => (
              <div key={inv.id} className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{inv.projectName}</h4>
                  <p className="text-xs text-slate-500">Invited by <span className="font-medium text-slate-700">{inv.inviterName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDecline(inv.id)} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition" title="Decline">
                    <X size={16} />
                  </button>
                  <button onClick={() => handleAccept(inv)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition flex items-center gap-1 shadow-sm">
                    <Check size={14} /> Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Teams */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Manage Your Teams</h2>
        
        {projects.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">No Teams Found</h3>
            <p className="text-slate-500 max-w-sm text-sm">You are not part of any project teams yet. Create a new project or ask your peers to invite you.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div key={p.id} onClick={() => setSelectedProjectId(p.id)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-2">{p.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">{p.status}</span>
                </div>
                
                <p className="text-sm text-slate-500 mb-5 font-medium">{p.team.length} Team Members</p>
                
                <div className="flex -space-x-3">
                  {p.team.slice(0, 5).map((email: string, i: number) => (
                    <div key={email} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase z-10 shadow-sm" style={{ zIndex: 10 - i }} title={email}>
                      {email.charAt(0)}
                    </div>
                  ))}
                  {p.team.length > 5 && (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 text-slate-600 flex items-center justify-center text-xs font-bold z-0 shadow-sm">
                      +{p.team.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
