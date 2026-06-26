import React from "react";
import { Card } from "./ui/Card";
import { Avatar } from "./ui/Avatar";
import { SectionTitle } from "./ui/SectionTitle";

export function GenericProfile({ user }: { user: { name: string; email?: string; sub: string; avatar: string; color: string } }) {
  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-7">
        <div className="flex items-center gap-5 mb-6">
          <Avatar initials={user.avatar} color={user.color} size="lg" />
          <div>
            <h3 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.name}</h3>
            <p className="text-slate-400 text-sm">{user.sub}</p>
          </div>
          <button className="ml-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Edit Profile</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Email", value: user.email || `${user.name.toLowerCase().replace(/\s/g, ".")}@projecthub.edu` }, 
            { label: "Department", value: user.sub }, 
            { label: "Institution", value: "Nandhs Engineering college" }, 
            { label: "Academic Year", value: "2023-27" }
          ].map((f) => (
            <div key={f.label} className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
              <p className="text-sm font-semibold text-slate-800">{f.value}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle>Change Password</SectionTitle>
        <div className="space-y-3">
          {["Current Password", "New Password", "Confirm New Password"].map((label) => (
            <div key={label}>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
              <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
          ))}
          <button className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">Update Password</button>
        </div>
      </Card>
    </div>
  );
}
