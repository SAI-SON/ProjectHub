import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Card } from "../../components/ui/Card";
import { Trophy, Target } from "lucide-react";

export function StudentAchievements({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({ earned: 0, remaining: 6 });

  useEffect(() => {
    async function evaluateAchievements() {
      if (!user?.email) return;

      try {
        // 1. Check Projects (First Steps)
        const pQ = query(collection(db, "projects"), where("team", "array-contains", user.email));
        const pSnap = await getDocs(pQ);
        const projects = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const hasProject = projects.length > 0;
        let firstProjectDate = null;
        if (hasProject && projects[0].createdAt) {
          firstProjectDate = projects[0].createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        const projectIds = projects.map(p => p.id);
        const chunk = projectIds.slice(0, 10);

        // 2. Check Tasks (Task Master)
        let completedTasks = 0;
        if (chunk.length > 0) {
          const tQ = query(collection(db, "tasks"), where("projectId", "in", chunk), where("status", "==", "Completed"));
          const tSnap = await getDocs(tQ);
          completedTasks = tSnap.docs.length;
        }
        const isTaskMaster = completedTasks >= 5;

        // 3. Check Updates (Milestone Maker)
        let hasMilestone = false;
        if (chunk.length > 0) {
          const uQ = query(collection(db, "updates"), where("projectId", "in", chunk));
          const uSnap = await getDocs(uQ);
          hasMilestone = uSnap.docs.some(d => {
            const data = d.data();
            return data.author === user.email && data.milestone && data.milestone.trim() !== "";
          });
        }

        // 4. Check Files (Code Contributor & Demo Star)
        let hasCode = false;
        let hasDemo = false;
        if (chunk.length > 0) {
          const fQ = query(collection(db, "files"), where("projectId", "in", chunk));
          const fSnap = await getDocs(fQ);
          hasCode = fSnap.docs.some(d => d.data().category === "Source Code" && d.data().uploadedBy === user.email);
          hasDemo = fSnap.docs.some(d => d.data().category === "Demo" && d.data().uploadedBy === user.email);
        }

        // 5. Check Feedback (Feedback Pro)
        let hasFeedbackReply = false;
        if (chunk.length > 0) {
          const fbQ = query(collection(db, "feedback"), where("projectId", "in", chunk), where("author", "==", user.email));
          const fbSnap = await getDocs(fbQ);
          hasFeedbackReply = fbSnap.docs.length > 0;
        }

        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        const badges = [
          { id: "1", title: "First Steps", desc: "Created or joined your first project.", icon: "🚀", earned: hasProject, date: firstProjectDate || today },
          { id: "2", title: "Task Master", desc: "Completed 5 or more project tasks.", icon: "✅", earned: isTaskMaster, date: today },
          { id: "3", title: "Milestone Maker", desc: "Achieved and logged a project milestone.", icon: "🎯", earned: hasMilestone, date: today },
          { id: "4", title: "Code Contributor", desc: "Uploaded your first Source Code link.", icon: "💻", earned: hasCode, date: today },
          { id: "5", title: "Demo Star", desc: "Uploaded a video or demo link.", icon: "🎥", earned: hasDemo, date: today },
          { id: "6", title: "Feedback Pro", desc: "Replied to faculty feedback actively.", icon: "💬", earned: hasFeedbackReply, date: today },
        ];

        setAchievements(badges);
        const earnedCount = badges.filter(b => b.earned).length;
        setStats({ earned: earnedCount, remaining: 6 - earnedCount });

      } catch (err) {
        console.error("Error evaluating achievements:", err);
      } finally {
        setLoading(false);
      }
    }
    evaluateAchievements();
  }, [user]);

  if (loading) return <div className="p-8 text-slate-500 font-medium">Evaluating your achievements...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your Achievements</h2>
        <p className="text-sm text-slate-500 mb-6 -mt-4">Unlock badges by actively participating in your projects and completing milestones.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stats.earned}</div>
            <div className="text-slate-500 text-sm font-medium">Badges Earned</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stats.remaining}</div>
            <div className="text-slate-500 text-sm font-medium">Remaining</div>
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {achievements.map((a) => (
          <Card key={a.id} className={`p-6 text-center transition-all duration-300 ${!a.earned ? "opacity-60 grayscale hover:grayscale-0 hover:opacity-100" : "border-indigo-100 shadow-sm"}`}>
            <div className={`text-5xl mb-4 ${a.earned ? "scale-110 drop-shadow-md" : ""} transition-transform duration-300`}>{a.icon}</div>
            <h4 className="font-bold text-slate-900 text-base mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{a.title}</h4>
            <p className="text-slate-500 text-xs mb-4 min-h-[32px]">{a.desc}</p>
            {a.earned ? (
              <div className="inline-flex items-center text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                ⭐ Earned on {a.date}
              </div>
            ) : (
              <div className="inline-flex items-center text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                🔒 Locked
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
