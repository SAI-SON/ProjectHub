import React, { useState } from "react";
import { GraduationCap, AtSign, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Role } from "../types";

export function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const DEMO_ACCOUNTS = [
    { username: "student", password: "student", label: "Student",   color: "#4f46e5" },
    { username: "hod",     password: "hod12345",     label: "HOD",       color: "#0891b2" },
    { username: "faculty", password: "faculty",       label: "Faculty",   color: "#7c3aed" },
    { username: "admin",   password: "admin12345",   label: "Admin",     color: "#dc2626" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let loginEmail = username.toLowerCase().trim();
      if (!loginEmail.includes("@") && loginEmail !== "admin") {
        loginEmail = `${loginEmail}@projecthub.edu`;
      }
      
      if (loginEmail === "admin" || loginEmail === "admin@projecthub.edu") {
        loginEmail = "admin@projecthub.edu";
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const uid = userCredential.user.uid;

      let role: Role | null = null;
      let name = "";
      let userData: any = null;

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        userData = userDoc.data();
        role = userData.role as Role;
        name = userData.name;
      } else {
        const q = query(collection(db, "students"), where("email", "==", loginEmail));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          userData = querySnapshot.docs[0].data();
          role = userData.role as Role || "student";
          name = userData.name;
        } else {
          if (loginEmail === "admin@projecthub.edu") {
            role = "admin";
            name = "Admin";
            userData = { department: "Administration" };
          }
        }
      }

      if (role && name) {
        onLogin({
          role: role,
          name: name,
          email: loginEmail,
          sub: userData?.department || "Unknown",
          avatar: name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
          color: role === "student" ? "#4f46e5" : role === "hod" ? "#0891b2" : role === "faculty" ? "#7c3aed" : "#dc2626"
        });
      } else {
        setError("User profile not found in database.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message && err.message.includes("Cloud Firestore API has not been used")) {
        setError("Firestore Database is not enabled. Please go to Firebase Console and Create a Firestore Database.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        setError(err.message || "An error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fill = (u: string, p: string) => { setUsername(u); setPassword(p); setError(""); };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="hidden lg:flex flex-col justify-between p-12 w-[48%] relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ProjectHub</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            One platform.<br />Every role.
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-md">
            Students, Faculty, HOD, and Admins — all collaborating seamlessly to manage academic projects from proposal to completion.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: "Active Projects", value: "65+" },
            { label: "Faculty Mentors", value: "15" },
            { label: "Students", value: "180" },
            { label: "Departments", value: "4" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
              <div className="text-indigo-300 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-16 left-8 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <GraduationCap size={19} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ProjectHub</span>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account</p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Demo Accounts — click to fill</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <button key={d.username} onClick={() => fill(d.username, d.password)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition text-left group">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: d.color }}>
                    {d.label[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">{d.label}</p>
                    <p className="text-xs text-slate-400 truncate">{d.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm" autoComplete="username" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
                <AlertTriangle size={15} /> {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</> : "Sign In"}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-8">ProjectHub · Academic Year 2025–26</p>
        </div>
      </div>
    </div>
  );
}
