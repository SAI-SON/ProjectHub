import React, { useState } from "react";
import { ClipboardList, Star, Edit3 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PROJECTS_ALL } from "../../mockData";

export function HodProjectReviews() {
  const [reviewed, setReviewed] = useState<number[]>([]);
  const projects = PROJECTS_ALL.filter((p) => p.progress > 60 && p.status !== "Completed");
  return (
    <div className="space-y-4 max-w-3xl">
      {projects.map((p) => (
        <Card key={p.id} className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "18" }}>
              <ClipboardList size={18} style={{ color: p.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
              <p className="text-xs text-slate-400">{p.faculty} · {p.tech}</p>
            </div>
            <StatusBadge status={p.status} />
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Completion</span><span className="font-semibold" style={{ color: p.color }}>{p.progress}%</span></div>
            <ProgressBar value={p.progress} color={p.color} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setReviewed((prev) => [...prev, p.id])}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${reviewed.includes(p.id) ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              <Star size={14} /> {reviewed.includes(p.id) ? "Recommended for Showcase" : "Recommend for Showcase"}
            </button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2">
              <Edit3 size={14} /> Add Remarks
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
