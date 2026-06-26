import React, { useState } from "react";
import { Star, Award, Save } from "lucide-react";

export function FacultyEvaluationTab({ project, user }: { project: any, user: any }) {
  const [marks, setMarks] = useState({
    innovation: 0,
    implementation: 0,
    documentation: 0,
    presentation: 0,
    contribution: 0
  });

  const maxMarks = {
    innovation: 20,
    implementation: 30,
    documentation: 20,
    presentation: 15,
    contribution: 15
  };

  const total = Object.values(marks).reduce((a, b) => a + (Number(b) || 0), 0);
  
  let grade = "F";
  if (total >= 90) grade = "A+";
  else if (total >= 80) grade = "A";
  else if (total >= 70) grade = "B";
  else if (total >= 60) grade = "C";
  else if (total >= 50) grade = "D";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = parseInt(value) || 0;
    // @ts-ignore
    if (val > maxMarks[name]) val = maxMarks[name];
    if (val < 0) val = 0;
    setMarks(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = () => {
    alert(`Evaluation Saved! Total: ${total}, Grade: ${grade}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Final Evaluation</h2>
          <p className="text-sm text-slate-500 mt-1">Assign marks based on project criteria.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Marking Criteria</h3>
            
            {[
              { id: "innovation", label: "Innovation & Originality", max: 20, desc: "Uniqueness of the idea and approach" },
              { id: "implementation", label: "Implementation & Functionality", max: 30, desc: "Core features working as intended" },
              { id: "documentation", label: "Documentation & Reports", max: 20, desc: "Clarity of SRS, diagrams, and final report" },
              { id: "presentation", label: "Presentation & Demo", max: 15, desc: "Communication and video quality" },
              { id: "contribution", label: "Team Contribution", max: 15, desc: "Individual involvement and Git commits" }
            ].map(criterion => (
              <div key={criterion.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{criterion.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{criterion.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    name={criterion.id}
                    // @ts-ignore
                    value={marks[criterion.id] || ""}
                    onChange={handleChange}
                    className="w-16 h-10 text-center font-bold text-lg bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400 font-bold">/ {criterion.max}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Result</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-center">
                <div className="text-5xl font-black mb-2">{total}</div>
                <div className="text-indigo-100 font-medium text-sm">Total Marks / 100</div>
              </div>
              <div className="p-6 text-center border-b border-slate-100">
                <div className="text-sm text-slate-500 font-medium mb-1">Final Grade</div>
                <div className="text-4xl font-black text-slate-800">{grade}</div>
              </div>
              <div className="p-4">
                <button 
                  onClick={handleSave}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition"
                >
                  <Save size={16} /> Save Evaluation
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
