import React from "react";
import { Download } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { FACULTY_DATA } from "../../mockData";

export function HodFacultyMonitor() {
  return (
    <div className="space-y-5 max-w-4xl">
      <Card>
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <SectionTitle>Faculty Performance Overview</SectionTitle>
          <button className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"><Download size={13} /> Export</button>
        </div>
        <div className="divide-y divide-slate-50">
          {FACULTY_DATA.map((f) => (
            <div key={f.name} className="px-5 py-4 flex items-center gap-4">
              <Avatar initials={f.avatar} color={f.color} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm">{f.name}</div>
                <div className="text-xs text-slate-400">Projects Guided</div>
                <div className="mt-1.5 w-48"><ProgressBar value={(f.completed / f.guided) * 100} color={f.color} thin /></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center shrink-0">
                <div><div className="text-lg font-bold text-slate-900">{f.guided}</div><div className="text-xs text-slate-400">Total</div></div>
                <div><div className="text-lg font-bold text-emerald-600">{f.completed}</div><div className="text-xs text-slate-400">Done</div></div>
                <div><div className={`text-lg font-bold ${f.delay > 0 ? "text-red-500" : "text-slate-400"}`}>{f.delay}</div><div className="text-xs text-slate-400">Delays</div></div>
              </div>
              <div className="shrink-0 ml-2">
                {f.pending > 0 ? <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">{f.pending} pending</span>
                  : <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">Up to date</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
