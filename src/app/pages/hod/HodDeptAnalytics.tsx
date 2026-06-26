import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "../../components/ui/Card";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { MONTHLY_PROJ, DEPT_DIST } from "../../mockData";

export function HodDeptAnalytics() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Completion Rate", value: "35%", color: "#10b981" }, { label: "In Progress", value: "50%", color: "#4f46e5" }, { label: "Pending", value: "15%", color: "#f59e0b" }].map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <div className="text-2xl font-extrabold mb-1" style={{ color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div className="text-slate-500 text-sm">{s.label}</div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionTitle>Monthly Project Activity</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_PROJ} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="new" name="New Projects" fill="#0891b2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionTitle>Project by Domain</SectionTitle>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={DEPT_DIST} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {DEPT_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {DEPT_DIST.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                  <span className="ml-auto font-bold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
