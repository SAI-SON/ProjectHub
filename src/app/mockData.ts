import { Role, UserCredential } from "./types";

export const CREDENTIALS: Record<string, UserCredential> = {
  student: { role: "student", password: "student@12345", name: "Sai Kiran", sub: "CSE – 3rd Year", avatar: "SK", color: "#4f46e5", email: "student@university.edu" },
  hod:     { role: "hod",     password: "hod@12345",     name: "Dr. S. Ramesh",  sub: "HOD – CSE Dept.",    avatar: "SR", color: "#0891b2", email: "hod@university.edu" },
  faculty: { role: "faculty", password: "faculty@12345", name: "Dr. Priya K.",   sub: "Associate Professor", avatar: "PK", color: "#7c3aed", email: "faculty@university.edu" },
  admin:   { role: "admin",   password: "admin@12345",   name: "Admin",          sub: "Platform Admin",      avatar: "AD", color: "#dc2626", email: "admin@university.edu" },
};

export const PROJECTS_ALL: any[] = [];
export const FACULTY_DATA: any[] = [];
export const PROGRESS_DATA: any[] = [];
export const TECH_DATA: any[] = [];
export const ACTIVITY_DATA: any[] = [];
export const DEPT_DIST: any[] = [];
export const MONTHLY_PROJ: any[] = [];
export const PENDING_APPROVALS: any[] = [];
export const MILESTONES_FAC: any[] = [];
export const EVALUATIONS: any[] = [];
export const STUDENT_PROJECTS: any[] = [];
export const STUDENT_MILESTONES: any[] = [];
export const STUDENT_FEEDBACK: any[] = [];
export const STUDENT_ACHIEVEMENTS: any[] = [];
