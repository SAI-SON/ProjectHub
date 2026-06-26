import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "In Progress":    "bg-indigo-100 text-indigo-700",
    "In Development": "bg-cyan-100 text-cyan-700",
    "Testing":        "bg-amber-100 text-amber-700",
    "Completed":      "bg-emerald-100 text-emerald-700",
    "Pending Review": "bg-slate-100 text-slate-600",
    "Approved":       "bg-emerald-100 text-emerald-700",
    "Needs Revision": "bg-red-100 text-red-600",
    "Rejected":       "bg-red-100 text-red-600",
    "Active":         "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
