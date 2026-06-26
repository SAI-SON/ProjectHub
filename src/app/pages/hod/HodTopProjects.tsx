import React from "react";
import { Trophy } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PROJECTS_ALL } from "../../mockData";

export function HodTopProjects() {
  const top = PROJECTS_ALL.filter((p) => p.progress >= 75).sort((a, b) => b.progress - a.progress);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-slate-500 text-sm">Projects recognized for innovation, quality, and faculty recommendation.</p>
      {top.map((p, i) => (
        <Card key={p.id} className="p-5 flex items-center gap-4">
          <div className="text-3xl">{medals[i] ?? "🏆"}</div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "18" }}>
            <Trophy size={18} style={{ color: p.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
            <p className="text-xs text-slate-400">{p.tech}</p>
            <div className="mt-1.5"><ProgressBar value={p.progress} color={p.color} thin /></div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-extrabold" style={{ color: p.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.progress}%</div>
            <div className="text-xs text-slate-400">{p.faculty}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
