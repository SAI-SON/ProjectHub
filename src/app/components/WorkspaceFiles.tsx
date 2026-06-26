import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Folder, FileText, UploadCloud, File, Image as ImageIcon, Video, FileArchive, 
  Download, Eye, Trash2, Clock, MessageSquare, MoreVertical, Search, X, CheckCircle,
  Link as LinkIcon
} from "lucide-react";

const CATEGORIES = [
  "Project Proposal",
  "Documentation",
  "Design",
  "Research",
  "Reports",
  "Presentation",
  "Source Code",
  "Demo",
  "Other"
];

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return <FileText className="text-red-500" size={24} />;
  if (['doc', 'docx', 'txt'].includes(ext)) return <FileText className="text-blue-500" size={24} />;
  if (['xls', 'xlsx'].includes(ext)) return <FileText className="text-emerald-500" size={24} />;
  if (['ppt', 'pptx'].includes(ext)) return <FileText className="text-orange-500" size={24} />;
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return <ImageIcon className="text-purple-500" size={24} />;
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return <Video className="text-pink-500" size={24} />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive className="text-amber-600" size={24} />;
  if (filename.includes("Repository") || filename.includes("Link")) return <LinkIcon className="text-indigo-500" size={24} />;
  return <File className="text-slate-400" size={24} />;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function WorkspaceFiles({ projectId, user, role = "student" }: { projectId: string; user: any; role?: "student" | "faculty" }) {
  const [files, setFiles] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All Files");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCategory, setUploadCategory] = useState(CATEGORIES[0]);
  const [linkType, setLinkType] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "files"), where("projectId", "==", projectId));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by newest first
      fetched.sort((a, b) => (b.uploadedAt?.toMillis() || 0) - (a.uploadedAt?.toMillis() || 0));
      setFiles(fetched);
    });
    return unsub;
  }, [projectId]);

  const handleUploadLink = async (targetCategory: string, url: string) => {
    if (!url.trim()) return;
    
    const fileName = targetCategory === "Source Code" ? "GitHub Repository" : "Project Demo Link";
    
    // Calculate Version
    const existingFiles = files.filter(f => f.category === targetCategory);
    const newVersion = existingFiles.length + 1;

    try {
      await addDoc(collection(db, "files"), {
        projectId,
        fileName: fileName,
        storagePath: url, 
        fileUrl: url,
        category: targetCategory,
        size: 0,
        type: "link",
        version: newVersion,
        uploadedBy: user.name || user.email,
        uploadedAt: serverTimestamp(),
        status: "Pending",
        comments: []
      });

      await addDoc(collection(db, "activityLogs"), {
        projectId,
        message: `${user.name || user.email} added a link to ${targetCategory}`,
        createdAt: serverTimestamp()
      });
      setLinkType(null);
      setLinkUrl("");
    } catch (err: any) {
      alert("Failed to add link: " + err.message);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // 1. Calculate Version
    const existingFiles = files.filter(f => f.fileName === file.name && f.category === uploadCategory);
    const newVersion = existingFiles.length + 1;

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret || apiSecret === "your_api_secret_here") {
        throw new Error("Cloudinary configuration missing. Please add your API secret to the .env file.");
      }

      setUploadProgress(20);

      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      
      // Generate SHA-1 hash for Cloudinary signature
      const signatureStr = `timestamp=${timestamp}${apiSecret}`;
      const msgBuffer = new TextEncoder().encode(signatureStr);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      setUploadProgress(50);
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData
      });
      
      setUploadProgress(80);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error.message);
      
      const downloadURL = data.secure_url;
      const publicId = data.public_id;

      setUploadProgress(100);

      // Save Metadata to Firestore
      await addDoc(collection(db, "files"), {
        projectId,
        fileName: file.name,
        storagePath: publicId, // Store Cloudinary public_id for future deletion
        fileUrl: downloadURL,
        category: uploadCategory,
        size: file.size,
        type: file.type,
        version: newVersion,
        uploadedBy: user.name || user.email,
        uploadedAt: serverTimestamp(),
        status: "Pending", // Pending, Approved, Under Review
        comments: []
      });

      // Create Activity Log
      await addDoc(collection(db, "activityLogs"), {
        projectId,
        message: `${user.name || user.email} uploaded ${file.name} to ${uploadCategory}`,
        createdAt: serverTimestamp()
      });

      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      alert(`Upload failed: ${error.message}`);
    }
  };

  const handleDelete = async (fileDoc: any) => {
    if (!confirm(`Are you sure you want to delete ${fileDoc.fileName}?`)) return;
    try {
      // Delete from storage
      if (fileDoc.storagePath && fileDoc.fileUrl && fileDoc.fileUrl.includes('cloudinary')) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
        const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
        
        const timestamp = Math.round(new Date().getTime() / 1000).toString();
        const signatureStr = `public_id=${fileDoc.storagePath}&timestamp=${timestamp}${apiSecret}`;
        const msgBuffer = new TextEncoder().encode(signatureStr);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const formData = new FormData();
        formData.append("public_id", fileDoc.storagePath);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        // Cloudinary needs the correct resource_type to destroy
        const type = fileDoc.type?.startsWith('image') ? 'image' : fileDoc.type?.startsWith('video') ? 'video' : 'raw';
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/destroy`, {
          method: "POST",
          body: formData
        });
      }
      // Delete from firestore
      await deleteDoc(doc(db, "files", fileDoc.id));
      // Log activity
      await addDoc(collection(db, "activityLogs"), {
        projectId,
        message: `${user.name || user.email} deleted ${fileDoc.fileName}`,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Could not delete file. You may not have permission.");
    }
  };

  // Filtering
  let displayedFiles = activeCategory === "All Files" ? files : files.filter(f => f.category === activeCategory);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedFiles = displayedFiles.filter(f => f.fileName.toLowerCase().includes(q) || f.uploadedBy.toLowerCase().includes(q));
  }

  // Version grouping (only show latest version in main view)
  const groupedFiles = displayedFiles.reduce((acc, curr) => {
    const key = `${curr.category}-${curr.fileName}`;
    if (!acc[key] || acc[key].version < curr.version) {
      acc[key] = curr;
    }
    return acc;
  }, {} as Record<string, any>);

  const latestFiles = Object.values(groupedFiles).sort((a: any, b: any) => (b.uploadedAt?.toMillis() || 0) - (a.uploadedAt?.toMillis() || 0));

  return (
    <div className="flex h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
      
      {/* LEFT SIDEBAR: Categories */}
      <div className="w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Repository</h2>
          <p className="text-xs text-slate-500 mt-1">Manage project files</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
          <button 
            onClick={() => setActiveCategory("All Files")}
            className={`w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium transition-colors ${activeCategory === "All Files" ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <div className="flex items-center gap-2.5">
              <Folder size={16} className={activeCategory === "All Files" ? "text-indigo-600" : "text-slate-400"} />
              All Files
            </div>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{files.length}</span>
          </button>
          
          <div className="px-5 mt-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</div>
          
          {CATEGORIES.map(cat => {
            const count = files.filter(f => f.category === cat).length;
            return (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium transition-colors ${activeCategory === cat ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder size={16} className={activeCategory === cat ? "text-indigo-600" : "text-slate-400"} />
                  {cat}
                </div>
                {count > 0 && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT: File List */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            />
          </div>
          {role === "student" && (
            <div className="flex items-center gap-3">
              {(activeCategory === "Source Code" || activeCategory === "Demo") ? (
                linkType ? (
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-[400px] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="pl-3 pr-2 text-slate-400">
                      <LinkIcon size={16} />
                    </div>
                    <input 
                      type="url" 
                      placeholder={`Paste your ${linkType} URL here...`}
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      className="flex-1 py-1.5 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                      autoFocus
                    />
                    <div className="flex items-center gap-1 pr-1">
                      <button 
                        onClick={() => handleUploadLink(linkType, linkUrl)} 
                        disabled={!linkUrl.trim()}
                        className="px-4 py-1.5 bg-indigo-600 disabled:bg-indigo-300 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Save Link
                      </button>
                      <button 
                        onClick={() => { setLinkType(null); setLinkUrl(""); }} 
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X size={16}/>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setLinkType(activeCategory)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm whitespace-nowrap"
                  >
                    <LinkIcon size={16} /> Add Link
                  </button>
                )
              ) : (
                <>
                  <select 
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.filter(c => c !== "Source Code" && c !== "Demo").map(c => <option key={c} value={c}>Upload to: {c}</option>)}
                  </select>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold transition shadow-sm"
                  >
                    <UploadCloud size={16} />
                    {isUploading ? `Uploading ${Math.round(uploadProgress)}%` : "Upload File"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* File Table */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/30">
          
          {isUploading && (
            <div className="mb-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <UploadCloud className="text-indigo-600 animate-bounce" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1 font-semibold text-indigo-900">
                  <span>Uploading to {uploadCategory}...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {latestFiles.length === 0 && !isUploading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
              <FileArchive size={64} className="mb-4 text-slate-200" />
              <p className="font-semibold text-slate-600 mb-1">No files in {activeCategory}</p>
              <p className="text-sm">Upload documents to build your project repository.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4 font-bold">Name</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Version</th>
                    <th className="p-4 font-bold hidden md:table-cell">Uploaded By</th>
                    <th className="p-4 font-bold hidden lg:table-cell">Date</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">{getFileIcon(file.fileName)}</div>
                          <div className="min-w-0">
                            <a 
                              href={file.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="font-bold text-slate-800 hover:text-indigo-600 text-sm truncate max-w-[200px] lg:max-w-[300px] block transition-colors" 
                              title={file.fileName}
                            >
                              {file.fileName}
                            </a>
                            <p className="text-xs text-slate-400 mt-0.5 flex gap-2">
                              <span>{formatBytes(file.size)}</span>
                              <span className="hidden sm:inline text-slate-300">•</span>
                              <span className="hidden sm:inline">{file.category}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5
                          ${file.status === "Approved" ? "bg-emerald-100 text-emerald-700" : 
                            file.status === "Under Review" ? "bg-amber-100 text-amber-700" : 
                            "bg-slate-100 text-slate-600"}`}>
                          {file.status === "Approved" && <CheckCircle size={12} />}
                          {file.status === "Under Review" && <Clock size={12} />}
                          {file.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                          v{file.version || 1}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {file.uploadedBy?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{file.uploadedBy}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 hidden lg:table-cell">
                        {file.uploadedAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View/Download"
                          >
                            <Eye size={16} />
                          </a>
                          {/* Faculty Comment Indicator (Future expansion) */}
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Comments">
                            <MessageSquare size={16} />
                          </button>
                          {role === "student" && (
                            <button 
                              onClick={() => handleDelete(file)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
