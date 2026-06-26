import React, { useState } from "react";
import { GitBranch } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PROJECTS_ALL } from "../../mockData";

export function HodDeptProjects() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "In Progress", "In Development", "Testing", "Completed"];
  const visible = filter === "All" ? PROJECTS_ALL : PROJECTS_ALL.filter((p) => p.status === filter);
  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? "bg-cyan-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-cyan-300"}`}>{f}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {visible.map((p) => (
          <Card key={p.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.color + "18" }}>
                <GitBranch size={18} style={{ color: p.color }} />
              </div>
              <StatusBadge status={p.status} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{p.tech}</p>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Progress</span><span className="font-semibold" style={{ color: p.color }}>{p.progress}%</span></div>
              <ProgressBar value={p.progress} color={p.color} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 pt-3">
              <div><span className="text-slate-400">Faculty</span><p className="font-semibold text-slate-700">{p.faculty}</p></div>
              <div><span className="text-slate-400">Domain</span><p className="font-semibold text-slate-700">{p.domain}</p></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
