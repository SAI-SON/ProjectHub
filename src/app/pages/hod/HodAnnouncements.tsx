import React, { useState } from "react";
import { Megaphone, Calendar, Users } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { SectionTitle } from "../../components/ui/SectionTitle";

export function HodAnnouncements() {
  const [sent, setSent] = useState(false);
  const [text, setText] = useState("");
  const existing = [
    { title: "Final Project Review on 15th March", date: "Mar 1, 2026", recipients: "All students & faculty" },
    { title: "Project Report Submission Deadline Extended", date: "Feb 20, 2026", recipients: "All students" },
    { title: "Department Project Expo Schedule Released", date: "Feb 10, 2026", recipients: "All students & faculty" },
  ];
  return (
    <div className="space-y-5 max-w-2xl">
      <Card className="p-5">
        <SectionTitle>Send Announcement</SectionTitle>
        <textarea rows={4} value={text} onChange={(e) => { setText(e.target.value); setSent(false); }}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none mb-3"
          placeholder="Type your announcement here…" />
        <div className="flex items-center gap-3">
          <div className="flex gap-2 flex-1 flex-wrap">
            {["All Students", "All Faculty", "All"].map((t) => (
              <label key={t} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked={t === "All"} />
                {t}
              </label>
            ))}
          </div>
          <button onClick={() => { if (text) setSent(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition">
            <Megaphone size={15} /> {sent ? "Sent!" : "Send"}
          </button>
        </div>
      </Card>
      <Card>
        <div className="px-5 py-4 border-b border-slate-50"><SectionTitle>Previous Announcements</SectionTitle></div>
        <div className="divide-y divide-slate-50">
          {existing.map((a) => (
            <div key={a.title} className="px-5 py-4">
              <h4 className="font-semibold text-slate-900 text-sm">{a.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
                <span className="flex items-center gap-1"><Users size={11} />{a.recipients}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
