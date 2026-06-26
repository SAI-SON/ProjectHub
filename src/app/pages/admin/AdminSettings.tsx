import React from "react";
import { Card } from "../../components/ui/Card";

export function AdminSettings() {
  return (
    <div className="max-w-2xl space-y-5">
      {[
        { title: "Academic Year", fields: ["Current Year: 2025-26", "Next Year: 2026-27"] },
        { title: "Submission Deadlines", fields: ["Proposal Deadline: March 15, 2026", "Final Report: April 30, 2026"] },
        { title: "Evaluation Criteria", fields: ["Innovation: 20 Marks", "Implementation: 30 Marks", "Documentation: 20 Marks", "Presentation: 15 Marks", "Team Contribution: 15 Marks"] },
      ].map((section) => (
        <Card key={section.title} className="p-5">
          <h3 className="font-bold text-slate-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{section.title}</h3>
          <div className="space-y-2">
            {section.fields.map((f) => {
              const [label, val] = f.split(": ");
              return (
                <div key={f} className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 w-44 shrink-0">{label}</span>
                  <input defaultValue={val} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition" />
                </div>
              );
            })}
          </div>
          <button className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">Save Changes</button>
        </Card>
      ))}
    </div>
  );
}
