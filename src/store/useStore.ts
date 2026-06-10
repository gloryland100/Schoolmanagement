import { create } from "zustand";
import type { User, UserRole, Student, Teacher, AcademicSession, SchoolSettings } from "@/types";

interface AppState {
  // Auth
  currentUser: User | null;
  userRole: UserRole | null;
  authLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  setUserRole: (role: UserRole | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // Student profile (for student role)
  studentProfile: Student | null;
  setStudentProfile: (profile: Student | null) => void;

  // Teacher profile (for teacher role)
  teacherProfile: Teacher | null;
  setTeacherProfile: (profile: Teacher | null) => void;

  // Academic session
  currentSession: AcademicSession | null;
  setCurrentSession: (session: AcademicSession | null) => void;

  // School settings
  schoolSettings: SchoolSettings | null;
  setSchoolSettings: (settings: SchoolSettings | null) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Notifications
  notifications: number;
  setNotifications: (count: number) => void;
  incrementNotifications: () => void;

  // Reset
  reset: () => void;
}

const getInitialDarkMode = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  userRole: null,
  authLoading: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserRole: (role) => set({ userRole: role }),
  setAuthLoading: (loading) => set({ authLoading: loading }),

  studentProfile: null,
  setStudentProfile: (profile) => set({ studentProfile: profile }),

  teacherProfile: null,
  setTeacherProfile: (profile) => set({ teacherProfile: profile }),

  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  schoolSettings: null,
  setSchoolSettings: (settings) => set({ schoolSettings: settings }),

  darkMode: getInitialDarkMode(),
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      localStorage.setItem("darkMode", String(newMode));
      return { darkMode: newMode };
    }),
  setDarkMode: (dark) => {
    localStorage.setItem("darkMode", String(dark));
    set({ darkMode: dark });
  },

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  notifications: 0,
  setNotifications: (count) => set({ notifications: count }),
  incrementNotifications: () => set((state) => ({ notifications: state.notifications + 1 })),

  reset: () =>
    set({
      currentUser: null,
      userRole: null,
      authLoading: false,
      studentProfile: null,
      teacherProfile: null,
      currentSession: null,
      notifications: 0,
    }),
}));
