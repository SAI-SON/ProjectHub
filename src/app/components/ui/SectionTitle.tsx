import React from "react";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-600" />{children}</h2>;
}
