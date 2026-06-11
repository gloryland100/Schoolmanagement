import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = () => {
  const { currentUser, userRole, authLoading, darkMode, sidebarOpen } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Role-based route protection
    const path = location.pathname;
    if (path.startsWith("/admin") && userRole !== "admin") {
      navigate(userRole === "teacher" ? "/teacher" : "/student");
    } else if (path.startsWith("/teacher") && userRole !== "teacher") {
      navigate(userRole === "admin" ? "/admin" : "/student");
    } else if (path.startsWith("/student") && userRole !== "student") {
      navigate(userRole === "admin" ? "/admin" : "/teacher");
    }
  }, [currentUser, userRole, authLoading, location.pathname, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <img src="/school-logo.png" alt="De-Best Gloryland School" className="w-24 h-24 animate-pulse" />
          <div className="text-[#1E3A8A] dark:text-blue-400 font-semibold text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-200">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
