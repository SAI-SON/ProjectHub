import React from "react";

export function ProgressBar({ value, color = "#4f46e5", thin = false }: { value: number; color?: string; thin?: boolean }) {
  return (
    <div className={`w-full bg-slate-100 rounded-full ${thin ? "h-1.5" : "h-2"}`}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  );
}
