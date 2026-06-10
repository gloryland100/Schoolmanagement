import { Link, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Clock,
  LogOut,
  FileText,
  TrendingUp,
} from "lucide-react";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Students", path: "/admin/students" },
  { icon: GraduationCap, label: "Teachers", path: "/admin/teachers" },
  { icon: ClipboardList, label: "Results", path: "/admin/results" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: Calendar, label: "Timetable", path: "/admin/timetable" },
  { icon: Bell, label: "Announcements", path: "/admin/announcements" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/teacher" },
  { icon: Users, label: "My Students", path: "/teacher/students" },
  { icon: FileText, label: "Enter Results", path: "/teacher/results" },
  { icon: Clock, label: "Timetable", path: "/teacher/timetable" },
  { icon: MessageSquare, label: "Messages", path: "/teacher/messages" },
];

const studentNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student" },
  { icon: TrendingUp, label: "My Results", path: "/student/results" },
  { icon: CreditCard, label: "Payments", path: "/student/payments" },
  { icon: Calendar, label: "Timetable", path: "/student/timetable" },
  { icon: Bell, label: "Announcements", path: "/student/announcements" },
  { icon: MessageSquare, label: "Messages", path: "/student/messages" },
];

const Sidebar = () => {
  const { userRole, sidebarOpen, toggleSidebar } = useStore();
  const location = useLocation();

  const navItems =
    userRole === "admin" ? adminNavItems : userRole === "teacher" ? teacherNavItems : studentNavItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-[#102542] dark:bg-gray-950 text-white transition-all duration-300 z-50 flex flex-col",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link to={`/${userRole}`} className="flex items-center gap-3 overflow-hidden">
          <img
            src="/school-logo.png"
            alt="De-Best Gloryland School"
            className="w-10 h-10 rounded-full bg-white flex-shrink-0"
          />
          {sidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[#D4A017] truncate">DE-BEST</span>
              <span className="text-[10px] text-gray-300 truncate">Gloryland School</span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-[#D4A017] text-white font-medium"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon
                size={20}
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                )}
              />
              {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-all w-full"
          title={!sidebarOpen ? "Logout" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
