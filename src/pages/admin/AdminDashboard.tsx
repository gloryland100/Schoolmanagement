import { useEffect, useState } from "react";
import { useStudents, useTeachers, useResults, useMessages, useAnnouncements, usePayments } from "@/hooks/useFirestore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Bell,
  TrendingUp,
  ArrowRight,
  UserPlus,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { Student, Result, Message, Payment } from "@/types";

const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle }: any) => (
  <Card
    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
    style={{ borderLeftColor: color }}
    onClick={onClick}
  >
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-[#102542] dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const studentsHook = useStudents();
  const teachersHook = useTeachers();
  const resultsHook = useResults();
  const messagesHook = useMessages();
  const announcementsHook = useAnnouncements();
  const paymentsHook = usePayments();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingResults: 0,
    totalPayments: 0,
    unreadMessages: 0,
    announcements: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [students, teachers, results, messages, announcements, payments] = await Promise.all([
        studentsHook.fetchAll(),
        teachersHook.fetchAll(),
        resultsHook.fetchAll(),
        messagesHook.fetchAll(),
        announcementsHook.fetchAll(),
        paymentsHook.fetchAll(),
      ]);

      const pendingResults = results.filter((r: Result) => r.status === "pending").length;
      const unreadMessages = messages.filter((m: Message) => !m.read && m.senderRole !== "admin").length;
      const totalPayments = payments.reduce((sum: number, p: Payment) => sum + p.amountPaid, 0);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        pendingResults,
        totalPayments,
        unreadMessages,
        announcements: announcements.length,
      });

      // Class distribution
      const classDist: Record<string, number> = {};
      students.forEach((s: Student) => {
        classDist[s.class] = (classDist[s.class] || 0) + 1;
      });
      setClassDistribution(
        Object.entries(classDist).map(([name, count]) => ({ name, count }))
      );

      // Payment data for chart
      const monthlyPayments: Record<string, number> = {};
      payments.forEach((p: Payment) => {
        const month = new Date(p.createdAt).toLocaleString("default", { month: "short" });
        monthlyPayments[month] = (monthlyPayments[month] || 0) + p.amountPaid;
      });
      setPaymentData(
        Object.entries(monthlyPayments).map(([month, amount]) => ({ month, amount }))
      );

      // Recent activity
      const activity = [
        ...students.slice(0, 3).map((s: Student) => ({
          type: "student",
          message: `New student registered: ${s.name}`,
          time: s.createdAt,
        })),
        ...results.filter((r: Result) => r.status === "pending").slice(0, 3).map((r: Result) => ({
          type: "result",
          message: `Result pending approval: ${r.studentName} - ${r.subject}`,
          time: r.createdAt,
        })),
        ...messages.filter((m: Message) => !m.read).slice(0, 3).map((m: Message) => ({
          type: "message",
          message: `New message from ${m.senderName}`,
          time: m.createdAt,
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const quickActions = [
    { label: "Add Student", icon: UserPlus, path: "/admin/students", color: "#1E3A8A" },
    { label: "Add Teacher", icon: GraduationCap, path: "/admin/teachers", color: "#059669" },
    { label: "Review Results", icon: ClipboardList, path: "/admin/results", color: "#D97706" },
    { label: "Timetable", icon: Calendar, path: "/admin/timetable", color: "#7C3AED" },
    { label: "Announcements", icon: Bell, path: "/admin/announcements", color: "#DC2626" },
    { label: "Fee Settings", icon: CreditCard, path: "/admin/payments", color: "#0891B2" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening at De-Best Gloryland School.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/admin/students")}
            className="bg-[#1E3A8A] hover:bg-[#264b9e]"
          >
            <UserPlus size={16} className="mr-2" />
            Add Student
          </Button>
          <Button
            onClick={() => navigate("/admin/teachers")}
            className="bg-[#059669] hover:bg-[#047857]"
          >
            <GraduationCap size={16} className="mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="#1E3A8A"
          onClick={() => navigate("/admin/students")}
        />
        <StatCard
          title="Teachers"
          value={stats.totalTeachers}
          icon={GraduationCap}
          color="#059669"
          onClick={() => navigate("/admin/teachers")}
        />
        <StatCard
          title="Pending Results"
          value={stats.pendingResults}
          icon={ClipboardList}
          color="#D97706"
          onClick={() => navigate("/admin/results")}
          subtitle="Needs approval"
        />
        <StatCard
          title="Payments (N)"
          value={stats.totalPayments.toLocaleString()}
          icon={CreditCard}
          color="#0891B2"
          onClick={() => navigate("/admin/payments")}
        />
        <StatCard
          title="Messages"
          value={stats.unreadMessages}
          icon={MessageSquare}
          color="#7C3AED"
          onClick={() => navigate("/admin/messages")}
          subtitle="Unread"
        />
        <StatCard
          title="Announcements"
          value={stats.announcements}
          icon={Bell}
          color="#DC2626"
          onClick={() => navigate("/admin/announcements")}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users size={18} className="text-[#1E3A8A]" />
              Students by Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={classDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp size={18} className="text-[#059669]" />
              Payment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#059669" fill="#059669" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon size={18} style={{ color: action.color }} />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  {action.label}
                </span>
                <ArrowRight
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-[#D4A017]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === "student" ? "bg-blue-500" :
                      activity.type === "result" ? "bg-amber-500" :
                      activity.type === "message" ? "bg-purple-500" : "bg-gray-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
