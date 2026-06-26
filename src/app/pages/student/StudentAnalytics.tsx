import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../../components/ui/Card";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { STUDENT_PROJECTS, ACTIVITY_DATA } from "../../mockData";

export function StudentAnalytics() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Avg Progress", value: "78%", color: "#4f46e5" }, { label: "Completed Tasks", value: "18", color: "#10b981" }, { label: "Pending Tasks", value: "5", color: "#f59e0b" }, { label: "Milestones Done", value: "4/6", color: "#06b6d4" }].map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <div className="text-2xl font-extrabold mb-1" style={{ color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div className="text-slate-500 text-sm">{s.label}</div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionTitle>Weekly Activity</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ACTIVITY_DATA} barGap={4}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="tasks" name="Tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="updates" name="Updates" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionTitle>Project Progress</SectionTitle>
          <div className="space-y-4">
            {STUDENT_PROJECTS.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-700">{p.name}</span><span className="font-bold" style={{ color: p.color }}>{p.progress}%</span></div>
                <ProgressBar value={p.progress} color={p.color} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
