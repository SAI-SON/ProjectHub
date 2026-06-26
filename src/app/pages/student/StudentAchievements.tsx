import React from "react";
import { Card } from "../../components/ui/Card";
import { STUDENT_ACHIEVEMENTS } from "../../mockData";

export function StudentAchievements() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-3"><div className="text-3xl">🏆</div><div><div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>3</div><div className="text-slate-500 text-sm">Badges Earned</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><div className="text-3xl">🎯</div><div><div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>3</div><div className="text-slate-500 text-sm">Remaining</div></div></Card>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STUDENT_ACHIEVEMENTS.map((a) => (
          <Card key={a.id} className={`p-5 text-center transition ${!a.earned ? "opacity-50 grayscale" : ""}`}>
            <div className="text-4xl mb-3">{a.icon}</div>
            <h4 className="font-bold text-slate-900 text-sm mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{a.title}</h4>
            <p className="text-slate-400 text-xs mb-2">{a.desc}</p>
            {a.earned ? <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">Earned · {a.date}</span>
              : <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">Locked</span>}
          </Card>
        ))}
      </div>
    </div>
  );
}
