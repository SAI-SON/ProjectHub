import React from "react";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

export function AdminDepartments() {
  const depts = [
    { name: "Computer Science & Eng.", short: "CSE", hod: "Dr. S. Ramesh", faculty: 15, students: 180, projects: 65, color: "#4f46e5" },
    { name: "Artificial Intelligence & DS", short: "AI&DS", hod: "Dr. M. Anand", faculty: 12, students: 140, projects: 48, color: "#7c3aed" },
    { name: "Information Technology", short: "IT", hod: "Dr. V. Lakshmi", faculty: 14, students: 200, projects: 55, color: "#0891b2" },
    { name: "Electronics & Communication", short: "ECE", hod: "Dr. K. Raj", faculty: 7, students: 200, projects: 47, color: "#10b981" },
  ];
  return (
    <div className="grid lg:grid-cols-2 gap-5 max-w-4xl">
      {depts.map((d) => (
        <Card key={d.short} className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: d.color }}>{d.short}</div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{d.name}</h3>
              <p className="text-xs text-slate-400">HOD: {d.hod}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ label: "Faculty", val: d.faculty }, { label: "Students", val: d.students }, { label: "Projects", val: d.projects }].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
          <ProgressBar value={(d.projects / 65) * 100} color={d.color} />
        </Card>
      ))}
    </div>
  );
}
