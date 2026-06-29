import React, { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Avatar } from "./ui/Avatar";
import { SectionTitle } from "./ui/SectionTitle";
import { auth, db } from "../../firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";

export function GenericProfile({ user }: { user: { name: string; email?: string; sub: string; avatar: string; color: string; role?: string } }) {
  const [name, setName] = useState(user.name);
  const [sub, setSub] = useState(user.sub);
  const [institution, setInstitution] = useState("Nandhs Engineering college");
  const [academicYear, setAcademicYear] = useState("2023-27");
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        if (user.role === "student") {
          const q = query(collection(db, "students"), where("email", "==", currentUser.email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            setName(data.name || user.name);
            setSub(data.department || user.sub);
            setInstitution(data.institution || "Nandhs Engineering college");
            setAcademicYear(data.academicYear || "2023-27");
          }
        } else if (user.role === "faculty" || user.role === "hod") {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || user.name);
            setSub(data.department || user.sub);
            setInstitution(data.institution || "Nandhs Engineering college");
            setAcademicYear(data.academicYear || "2023-27");
          }
        }
      } catch (err) {
        console.error("Error fetching profile details:", err);
      }
    }
    fetchProfile();
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setProfileLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found.");
      }

      const calculatedAvatar = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      if (user.role === "student") {
        const q = query(collection(db, "students"), where("email", "==", currentUser.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docId = snap.docs[0].id;
          await updateDoc(doc(db, "students", docId), {
            name: name,
            department: sub,
            institution: institution,
            academicYear: academicYear
          });
        }
      } else if (user.role === "faculty" || user.role === "hod") {
        await updateDoc(doc(db, "users", currentUser.uid), {
          name: name,
          department: sub,
          institution: institution,
          academicYear: academicYear
        });
      }

      // Update localStorage
      const updatedUser = {
        ...user,
        name: name,
        sub: sub,
        avatar: calculatedAvatar,
        institution: institution,
        academicYear: academicYear
      };
      localStorage.setItem("projectHubUser", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Profile save error:", err);
      setError(err.message || "Failed to save profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("No authenticated user found.");
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Incorrect current password. Please try again.");
      } else {
        setError(err.message || "Failed to update password.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-7">
        {isEditing ? (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center gap-5 mb-6">
              <Avatar initials={user.avatar} color={user.color} size="lg" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit Profile</h3>
                <p className="text-slate-400 text-sm">Update your public details</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address (Read-Only)</label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-400 bg-slate-50 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-70"
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center gap-5 mb-6">
              <Avatar initials={user.avatar} color={user.color} size="lg" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.name}</h3>
                <p className="text-slate-400 text-sm">{user.sub}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Email", value: user.email || `${name.toLowerCase().replace(/\s/g, ".")}@projecthub.edu` }, 
                { label: "Department", value: sub }, 
                { label: "Institution", value: institution }, 
                { label: "Academic Year", value: academicYear }
              ].map((f) => (
                <div key={f.label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      
      <Card className="p-5">
        <SectionTitle>Change Password</SectionTitle>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 chars)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
            />
          </div>

          {error && (
            <div className="text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-70 flex items-center gap-2"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </Card>
    </div>
  );
}
