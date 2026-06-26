import React, { useState, useRef } from "react";
import { Upload, X, Plus, Edit3 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db, secondaryAuth } from "../../../firebase";
import { Card } from "../../components/ui/Card";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Avatar } from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/StatusBadge";

function BulkImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setPreview(data);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    setStatusMsg("Starting import...");
    try {
      const admissionYear = String(new Date().getFullYear()).slice(2);
      
      const counters: Record<string, number> = {};
      const generatedUsers = [];
      
      for (const row of preview) {
        const dept = row.Department || row.department;
        const name = row.Name || row.name;
        if (!dept || !name) continue;
        
        if (counters[dept] === undefined) {
          const deptDocRef = doc(db, "departments", dept);
          const deptDoc = await getDoc(deptDocRef);
          if (deptDoc.exists()) {
            counters[dept] = deptDoc.data().currentStudentCount || 0;
          } else {
            counters[dept] = 0;
            await setDoc(deptDocRef, { currentStudentCount: 0, departmentCode: dept, departmentName: dept });
          }
        }
        
        counters[dept]++;
        const studentId = `${admissionYear}${dept}${String(counters[dept]).padStart(3, "0")}`;
        const email = `${studentId.toLowerCase()}@college.edu`;
        
        generatedUsers.push({ name, dept, studentId, email });
      }

      setStatusMsg("Creating accounts in Firebase...");
      for (const u of generatedUsers) {
        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, u.email, "student");
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: u.name,
            department: u.dept,
            studentId: u.studentId,
            email: u.email,
            role: "student",
            createdAt: new Date().toISOString()
          });
        } catch (err: any) {
          console.error("Error creating user", u.email, err);
        }
      }
      
      setStatusMsg("Updating department counters...");
      for (const [dept, count] of Object.entries(counters)) {
        await updateDoc(doc(db, "departments", dept), {
          currentStudentCount: count
        });
      }

      setStatusMsg("Import completed successfully!");
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800">Bulk Student Import</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {!file ? (
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} className="text-slate-400 mb-3" />
              <h3 className="font-semibold text-slate-700 mb-1">Click to upload Excel file</h3>
              <p className="text-sm text-slate-500">.xlsx or .xls files with 'Name' and 'Department' columns</p>
              <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-slate-700">Preview ({preview.length} rows)</span>
                <button onClick={() => { setFile(null); setPreview([]); }} className="text-sm text-red-600 font-semibold hover:text-red-700">Change File</button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-2 border-b border-slate-200">Name</th>
                      <th className="px-4 py-2 border-b border-slate-200">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-2">{row.Name || row.name}</td>
                        <td className="px-4 py-2">{row.Department || row.department}</td>
                      </tr>
                    ))}
                    {preview.length > 5 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-center text-slate-500 text-xs italic bg-slate-50/50">
                          ... and {preview.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {statusMsg && (
                <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg flex items-center justify-center gap-2">
                  {loading && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
                  {statusMsg}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition">Cancel</button>
          <button 
            onClick={handleImport} 
            disabled={!file || loading}
            className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-sm"
          >
            Import {preview.length > 0 ? preview.length : ""} Students
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [showBulkImport, setShowBulkImport] = useState(false);
  const users = [
    { name: "Sai Kiran", role: "Student", dept: "CSE", status: "Active", avatar: "SK", color: "#4f46e5" },
    { name: "Dr. Kumar", role: "Faculty", dept: "CSE", status: "Active", avatar: "DK", color: "#7c3aed" },
    { name: "Dr. Priya K.", role: "Faculty", dept: "CSE", status: "Active", avatar: "PK", color: "#0891b2" },
    { name: "Dr. S. Ramesh", role: "HOD", dept: "CSE", status: "Active", avatar: "SR", color: "#0891b2" },
    { name: "Meena R.", role: "Student", dept: "CSE", status: "Active", avatar: "MR", color: "#10b981" },
    { name: "Arjun K.", role: "Student", dept: "AI&DS", status: "Active", avatar: "AK", color: "#f59e0b" },
  ];
  const roleColor: Record<string, string> = { Student: "bg-indigo-100 text-indigo-700", Faculty: "bg-purple-100 text-purple-700", HOD: "bg-cyan-100 text-cyan-700", Admin: "bg-red-100 text-red-700" };
  return (
    <div className="max-w-4xl relative">
      <Card>
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <SectionTitle>All Users</SectionTitle>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowBulkImport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
            >
              <Upload size={14} /> Bulk Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"><Plus size={14} /> Add User</button>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {users.map((u) => (
            <div key={u.name} className="px-5 py-4 flex items-center gap-4">
              <Avatar initials={u.avatar} color={u.color} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-400">{u.dept}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColor[u.role] ?? "bg-slate-100 text-slate-600"}`}>{u.role}</span>
              <StatusBadge status={u.status} />
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"><Edit3 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {showBulkImport && <BulkImportModal onClose={() => setShowBulkImport(false)} />}
    </div>
  );
}
