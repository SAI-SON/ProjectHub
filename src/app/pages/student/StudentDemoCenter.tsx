import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { Video, ExternalLink, PlayCircle, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";

export function StudentDemoCenter({ user }: { user: any }) {
  const [demos, setDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDemos() {
      if (!user?.email) return;
      try {
        // Fetch projects the student is a part of
        const pQ = query(collection(db, "projects"), where("team", "array-contains", user.email));
        const pSnap = await getDocs(pQ);
        const projects = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        if (projects.length === 0) {
          setLoading(false);
          return;
        }

        // We can query files up to 10 project IDs at a time
        const projectIds = projects.map(p => p.id);
        const chunk = projectIds.slice(0, 10);

        const fQ = query(
          collection(db, "files"),
          where("projectId", "in", chunk),
          where("category", "==", "Demo")
        );
        const fSnap = await getDocs(fQ);
        
        const demoFiles = fSnap.docs.map(d => {
          const data = d.data();
          const proj = projects.find(p => p.id === data.projectId);
          return {
            id: d.id,
            projectName: proj?.name || proj?.title || "Unknown Project",
            ...data
          };
        });

        setDemos(demoFiles);
      } catch (err) {
        console.error("Failed to load demos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDemos();
  }, [user]);

  const handleDelete = async (demo: any) => {
    if (!confirm(`Are you sure you want to delete this demo?`)) return;
    try {
      // Delete from storage if it's a file
      if (demo.storagePath && demo.fileUrl && demo.fileUrl.includes('cloudinary')) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
        const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
        
        if (apiSecret && apiSecret !== "your_api_secret_here") {
          const timestamp = Math.round(new Date().getTime() / 1000).toString();
          const signatureStr = `public_id=${demo.storagePath}&timestamp=${timestamp}${apiSecret}`;
          const msgBuffer = new TextEncoder().encode(signatureStr);
          const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          const formData = new FormData();
          formData.append("public_id", demo.storagePath);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);

          const type = demo.type?.startsWith('image') ? 'image' : demo.type?.startsWith('video') ? 'video' : 'raw';
          await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/destroy`, {
            method: "POST",
            body: formData
          });
        }
      }
      
      await deleteDoc(doc(db, "files", demo.id));
      await addDoc(collection(db, "activityLogs"), {
        projectId: demo.projectId,
        message: `${user.name || user.email} deleted a demo`,
        createdAt: serverTimestamp()
      });
      
      setDemos(prev => prev.filter(d => d.id !== demo.id));
    } catch (err) {
      console.error("Error deleting demo:", err);
      alert("Could not delete demo.");
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Loading your demos...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Demo Center</h2>
        <p className="text-sm text-slate-500 mb-8 -mt-4">View all demo links submitted across your projects.</p>

        {demos.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
              <Video size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">No Demos Found</h3>
            <p className="text-slate-500 max-w-sm text-sm">You haven't uploaded any Demo Links for your projects yet. You can add them in the Files & Documents workspace.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {demos.map(demo => (
              <Card key={demo.id} className="p-0 overflow-hidden flex flex-col group">
                <div className="bg-slate-100 h-32 flex items-center justify-center group-hover:bg-slate-200 transition-colors relative">
                  <PlayCircle size={40} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 truncate" title={demo.fileName}>{demo.fileName}</h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">Project: <span className="font-semibold text-slate-700">{demo.projectName}</span></p>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-2">
                    <a 
                      href={demo.fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-semibold text-sm rounded-xl transition-colors"
                    >
                      <ExternalLink size={16} /> Open Demo
                    </a>
                    <button
                      onClick={() => handleDelete(demo)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors"
                      title="Delete Demo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
