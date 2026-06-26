import React, { useState } from "react";
import { Search, Filter, Download, Layers } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PROJECTS_ALL } from "../../mockData";

export function AdminAllProjects() {
  const [search, setSearch] = useState("");
  const filtered = PROJECTS_ALL.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.dept.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={15} className="text-slate-400" />
          <input className="flex-1 text-sm text-slate-700 outline-none placeholder-slate-400" placeholder="Search projects by name or department…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition"><Filter size={15} /> Filter</button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition"><Download size={15} /> Export</button>
      </div>
      <Card>
        <div className="px-5 py-3 border-b border-slate-50 grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <span className="col-span-4">Project</span><span className="col-span-2">Dept</span><span className="col-span-2">Faculty</span><span className="col-span-2">Progress</span><span className="col-span-2">Status</span>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.map((p) => (
            <div key={p.id} className="px-5 py-3.5 grid grid-cols-12 items-center hover:bg-slate-50 transition">
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "18" }}>
                  <Layers size={13} style={{ color: p.color }} />
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
              </div>
              <span className="col-span-2 text-sm text-slate-500">{p.dept}</span>
              <span className="col-span-2 text-sm text-slate-500 truncate">{p.faculty}</span>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-16"><ProgressBar value={p.progress} color={p.color} thin /></div>
                <span className="text-xs font-bold" style={{ color: p.color }}>{p.progress}%</span>
              </div>
              <div className="col-span-2"><StatusBadge status={p.status} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
