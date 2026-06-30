import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Layers, X, User, GraduationCap, CheckCircle } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import * as XLSX from "xlsx";

export function AdminAllProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    async function fetchAllProjects() {
      try {
        const snap = await getDocs(collection(db, "projects"));
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading project repository:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch = 
      (p.name || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.dept || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.facultyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tech || "").toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const handleExportWord = () => {
    try {
      let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>Project Repository Export</title>
          <style>
            body {
              font-family: 'Calibri', 'Arial', sans-serif;
              color: #334155;
            }
            h2 {
              color: #6366f1;
              font-family: 'Segoe UI', sans-serif;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th {
              background-color: #6366f1;
              color: #ffffff;
              font-weight: bold;
              text-align: left;
              padding: 10px;
              border: 1px solid #cbd5e1;
              font-size: 13px;
            }
            td {
              padding: 10px;
              border: 1px solid #e2e8f0;
              font-size: 12px;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .progress {
              font-weight: bold;
              color: #4f46e5;
            }
          </style>
        </head>
        <body>
          <h2>Project Repository Export</h2>
          <p style="font-size: 11px; color: #64748b; margin-top: -10px;">Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th style="width: 30%;">Project Title</th>
                <th style="width: 15%;">Department</th>
                <th style="width: 18%;">Faculty Guide</th>
                <th style="width: 10%;">Progress</th>
                <th style="width: 12%;">Status</th>
                <th style="width: 15%;">Tech Stack</th>
              </tr>
            </thead>
            <tbody>
      `;

      filtered.forEach(p => {
        htmlContent += `
          <tr>
            <td><strong>${p.name || ""}</strong></td>
            <td>${p.dept || "N/A"}</td>
            <td>${p.facultyName || "N/A"}</td>
            <td class="progress">${p.progress || 0}%</td>
            <td>${p.status || "Pending"}</td>
            <td>${p.tech || "Not specified"}</td>
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Create a Blob with UTF-8 BOM to ensure MS Word parses characters correctly and avoid data URI limits
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "Project_Repository_Export.doc";
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Word export failed:", err);
      alert("Failed to export Word file.");
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Loading repository...</div>;

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input 
            className="flex-1 text-sm text-slate-700 outline-none placeholder-slate-400 bg-transparent" 
            placeholder="Search by title, department, guide, tech stack..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm transition"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Export Button */}
          <button 
            onClick={handleExportWord}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-sm transition shrink-0 cursor-pointer"
          >
            <Download size={15} /> Export Word
          </button>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
          <span className="col-span-5">Project Title</span>
          <span className="col-span-2">Dept</span>
          <span className="col-span-2">Faculty Guide</span>
          <span className="col-span-2">Progress</span>
          <span className="col-span-1 text-right">Status</span>
        </div>

        <div className="divide-y divide-slate-100 bg-white">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-400 text-sm bg-white">
              No matching projects found in the repository.
            </div>
          ) : (
            filtered.map((p) => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProject(p)}
                className="px-5 py-4 grid grid-cols-12 items-center hover:bg-slate-50/80 transition cursor-pointer"
              >
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (p.color || "#4f46e5") + "15" }}>
                    <Layers size={15} style={{ color: p.color || "#4f46e5" }} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 truncate" title={p.name}>{p.name}</span>
                </div>
                <span className="col-span-2 text-sm text-slate-600 font-medium">{p.dept || "N/A"}</span>
                <span className="col-span-2 text-sm text-slate-600 truncate font-medium" title={p.facultyName}>{p.facultyName || "N/A"}</span>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-16"><ProgressBar value={p.progress || 0} color={p.color || "#4f46e5"} thin /></div>
                  <span className="text-xs font-bold text-slate-700">{p.progress || 0}%</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <StatusBadge status={p.status || "Pending"} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-slideUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: (selectedProject.color || "#4f46e5") + "15" }}>
                  <Layers size={14} style={{ color: selectedProject.color || "#4f46e5" }} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Project Details</h4>
              </div>
              <button 
                onClick={() => setSelectedProject(null)} 
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={17} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{selectedProject.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Dept: {selectedProject.dept}</span>
                  <StatusBadge status={selectedProject.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                <div className="flex items-center gap-2.5">
                  <User size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Faculty Guide</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedProject.facultyName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <GraduationCap size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedProject.dept}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Technology Stack</p>
                <p className="text-sm font-semibold text-indigo-700 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100 w-fit">
                  {selectedProject.tech || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProject.description || "No description provided."}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Expected Outcome</p>
                <p className="text-sm text-slate-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                  {selectedProject.outcome || "Not specified"}
                </p>
              </div>

              {selectedProject.team && (
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.team.map((email: string) => (
                      <span key={email} className="text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-xl">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
