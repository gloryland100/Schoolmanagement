import { useEffect, useState } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  Calendar,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import type { Student, Result } from "@/types";

const TeacherDashboard = () => {
  const { teacherProfile } = useStore();
  const navigate = useNavigate();
  const studentsHook = useFirestoreCollection<Student>("students");
  const resultsHook = useFirestoreCollection<Result>("results");
  

  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingResults: 0,
    subjectsCount: 0,
    classesCount: 0,
  });

  useEffect(() => {
    if (teacherProfile) {
      loadData();
    }
  }, [teacherProfile]);

  const loadData = async () => {
    try {
      const allStudents = await studentsHook.fetchAll();
      const teacherStudents = allStudents.filter((s) =>
        teacherProfile?.classes?.includes(s.class)
      );

      const allResults = await resultsHook.fetchAll();
      const teacherResults = allResults.filter(
        (r) => r.teacherId === teacherProfile?.id
      );

      setStats({
        totalStudents: teacherStudents.length,
        pendingResults: teacherResults.filter((r) => r.status === "draft").length,
        subjectsCount: teacherProfile?.subjects?.length || 0,
        classesCount: teacherProfile?.classes?.length || 0,
      });
    } catch (error) {
      console.error("Error loading teacher dashboard:", error);
    }
  };

  const quickActions = [
    { label: "Enter Results", icon: ClipboardList, path: "/teacher/results", color: "#1E3A8A" },
    { label: "My Students", icon: Users, path: "/teacher/students", color: "#059669" },
    { label: "Timetable", icon: Calendar, path: "/teacher/timetable", color: "#7C3AED" },
    { label: "Messages", icon: MessageSquare, path: "/teacher/messages", color: "#D97706" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102542] dark:text-white">
          Teacher Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome, {teacherProfile?.name || "Teacher"}! Manage your classes and results.
        </p>
      </div>

      {/* Assigned Info */}
      <Card className="bg-gradient-to-r from-[#102542] to-[#1E3A8A] text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-200 text-sm mb-1">Subjects</p>
              <p className="text-lg font-semibold">
                {teacherProfile?.subjects?.join(", ") || "None assigned"}
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Classes</p>
              <p className="text-lg font-semibold">
                {teacherProfile?.classes?.join(", ") || "None assigned"}
              </p>
            </div>
            {teacherProfile?.classTeacher && (
              <div>
                <p className="text-blue-200 text-sm mb-1">Class Teacher</p>
                <p className="text-lg font-semibold">{teacherProfile.classTeacher}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">My Students</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">{stats.totalStudents}</p>
              </div>
              <Users size={24} className="text-[#1E3A8A]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Draft Results</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">{stats.pendingResults}</p>
              </div>
              <ClipboardList size={24} className="text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Subjects</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">{stats.subjectsCount}</p>
              </div>
              <BookOpen size={24} className="text-[#059669]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Classes</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">{stats.classesCount}</p>
              </div>
              <TrendingUp size={24} className="text-[#7C3AED]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#D4A017] hover:shadow-md transition-all group"
            >
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${action.color}15` }}>
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#102542] dark:group-hover:text-white">
                {action.label}
              </span>
              <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-[#D4A017]" />
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
