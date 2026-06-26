import React from "react";
import { Card } from "./Card";

export function StatCard({ label, value, sub, icon, color, bg }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <Card className="p-5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`} style={{ color }}>
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-800">{value}</span>
        <span className="text-xs font-semibold text-slate-400">{sub}</span>
      </div>
    </Card>
  );
}
