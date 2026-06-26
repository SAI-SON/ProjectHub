export type Screen = "login" | "app";
export type Role = "student" | "hod" | "faculty" | "admin";

export type StudentView = "home" | "projects" | "create" | "team" | "tasks" | "updates" | "files" | "feedback" | "demo" | "analytics" | "achievements" | "profile" | "workspace";
export type HodView = "home" | "dept-projects" | "faculty-monitor" | "dept-analytics" | "project-reviews" | "top-projects" | "repository" | "announcements" | "profile";
export type FacultyView = "home" | "approvals" | "assigned" | "progress" | "feedback" | "milestones" | "evaluation" | "demo-review" | "repository" | "profile";
export type AdminView = "home" | "all-projects" | "users" | "departments" | "analytics" | "reports" | "settings" | "profile";
export type AnyView = StudentView | HodView | FacultyView | AdminView;

export interface UserCredential {
  role: Role;
  password?: string;
  name: string;
  sub: string;
  avatar: string;
  color: string;
  email: string;
}
