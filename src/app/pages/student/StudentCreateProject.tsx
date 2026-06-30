import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { Card } from "../../components/ui/Card";

export function StudentCreateProject({ user }: { user: any }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tech, setTech] = useState("");
  const [outcome, setOutcome] = useState("");
  const [description, setDescription] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFaculty() {
      const q = query(collection(db, "users"), where("role", "==", "faculty"));
      const snap = await getDocs(q);
      const allFaculty = snap.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          email: data.email || d.id, 
          name: data.name || "Unknown Faculty" 
        };
      });
      
      // Deduplicate by email to handle any potential duplicate database entries
      const uniqueFaculty = Array.from(new Map(allFaculty.map(f => [f.email, f])).values());
      setFacultyList(uniqueFaculty);
    }
    fetchFaculty();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !facultyEmail) return alert("Please fill Title and assign a Faculty Guide.");
    setLoading(true);
    try {
      await addDoc(collection(db, "projects"), {
        name: title,
        tech: tech || "Not specified",
        outcome: outcome || "Not specified",
        description: description,
        facultyId: facultyEmail,
        facultyName: facultyList.find(f => f.email === facultyEmail)?.name || "Unknown Faculty",
        team: [user.email],
        dept: user.sub,
        status: "Pending",
        progress: 0,
        milestone: "Awaiting Approval",
        color: "#4f46e5",
        createdAt: serverTimestamp()
      });

      // Write notification for the faculty guide
      await addDoc(collection(db, "notifications"), {
        userId: facultyEmail,
        title: "New Project Proposal",
        message: `A new project proposal "${title}" has been submitted for your approval by ${user.name || user.email}.`,
        read: false,
        type: "proposal",
        createdAt: serverTimestamp()
      });

      alert("Proposal Submitted successfully! It is now pending Faculty Approval.");
      navigate("/student/projects");
    } catch (err) {
      console.error(err);
      alert("Error submitting proposal");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 h-full overflow-y-auto flex justify-center items-start">
      <Card className="w-full max-w-2xl p-7">
        <h3 className="font-extrabold text-slate-900 text-xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>New Project Proposal</h3>
        <p className="text-slate-400 text-sm mb-6">Fill in the details and submit for faculty approval.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter project title…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Technology Stack</label>
              <input value={tech} onChange={e => setTech(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g. React, Node.js" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign Faculty Guide *</label>
              <select required value={facultyEmail} onChange={e => setFacultyEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                <option value="">Select Faculty...</option>
                {facultyList.map(f => (
                  <option key={f.email} value={f.email}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Outcome</label>
            <input value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter expected outcome…" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" placeholder="Briefly describe your project..." />
          </div>
          <div className="flex gap-3 mt-5">
            <button type="button" onClick={() => navigate("/student/projects")} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
