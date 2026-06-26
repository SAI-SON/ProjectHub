import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Users, UserPlus, Shield, X, Award, Clock } from "lucide-react";

export function WorkspaceTeam({ projectId, user, role = "student" }: { projectId: string; user: any; role?: "student" | "faculty" }) {
  const [project, setProject] = useState<any>(null);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    fetchProject();
    
    const q = query(collection(db, "invitations"), where("projectId", "==", projectId), where("status", "==", "pending"));
    const unsub = onSnapshot(q, (snap) => {
      setInvitations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    const snap = await getDoc(doc(db, "projects", projectId));
    if (snap.exists()) setProject({ id: snap.id, ...snap.data() });
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;

    if (project.team.includes(email)) {
      alert("User is already in the team.");
      return;
    }

    if (invitations.some(inv => inv.inviteeEmail === email)) {
      alert("An invitation has already been sent to this email.");
      return;
    }

    await addDoc(collection(db, "invitations"), {
      projectId,
      projectName: project.name,
      inviterEmail: user.email,
      inviterName: user.name || user.email,
      inviteeEmail: email,
      status: "pending",
      createdAt: serverTimestamp()
    });
    
    setNewEmail("");
  };

  const cancelInvite = async (inviteId: string) => {
    await deleteDoc(doc(db, "invitations", inviteId));
  };

  const handleRemove = async (email: string) => {
    if (email === user.email) {
      alert("You cannot remove yourself.");
      return;
    }
    await updateDoc(doc(db, "projects", projectId), {
      team: arrayRemove(email)
    });
    fetchProject();
  };

  const makeLead = async (email: string) => {
    await updateDoc(doc(db, "projects", projectId), {
      lead: email
    });
    fetchProject();
  };

  if (loading || !project) return <div className="text-slate-500">Loading team...</div>;

  const lead = project.lead || project.team[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-6">
      {role === "student" && (
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <UserPlus size={18} className="text-indigo-600"/> Invite Member
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Enter a student's college email to invite them to this project workspace. They must accept the request to join.
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Student Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="student@college.edu" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition" />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm">
                Send Request
              </button>
            </form>
          </div>

          {invitations.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Clock size={16} className="text-amber-500"/> Pending Requests
              </h3>
              <div className="space-y-2">
                {invitations.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-medium text-slate-700 truncate pr-2">{inv.inviteeEmail}</span>
                    <button onClick={() => cancelInvite(inv.id)} className="text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition shrink-0">Cancel</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Members List */}
      <div className={`flex-1 ${role === "student" ? "" : "lg:w-2/3"} space-y-4`}>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <Users size={18} className="text-indigo-600"/> Current Team ({project.team.length})
        </h3>
        <div className="grid xl:grid-cols-2 gap-4">
          {project.team.map((email: string) => (
            <div key={email} className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold uppercase shrink-0">
                    {email.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{email.split("@")[0]}</h4>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{email}</p>
                  </div>
                </div>
                {email === lead && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                    <Shield size={10} /> TEAM LEAD
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs border-t border-slate-50 pt-3 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Award size={14} className="text-emerald-500"/> Contribution: <span className="font-bold text-slate-700">{Math.floor(Math.random() * 40) + 10}%</span>
                </div>
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {email !== lead && (
                  <button onClick={() => makeLead(email)} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-slate-400 shadow-sm transition" title="Make Team Lead">
                    <Shield size={14} />
                  </button>
                )}
                <button onClick={() => handleRemove(email)} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 shadow-sm transition" title="Remove Member">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
