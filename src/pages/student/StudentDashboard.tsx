import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  CreditCard,
  Calendar,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";
import type { Result, Payment } from "@/types";
import { useFirestoreCollection } from "@/hooks/useFirestore";

const StudentDashboard = () => {
  const { studentProfile } = useStore();
  const navigate = useNavigate();
  const resultsHook = useFirestoreCollection<any>("results");
    const paymentsHook = useFirestoreCollection<any>("payments");

  const [stats, setStats] = useState({
    publishedResults: 0,
    averageScore: 0,
    totalPayments: 0,
    balance: 0,
  });

  useEffect(() => {
    if (studentProfile) {
      loadData();
    }
  }, [studentProfile]);

  const loadData = async () => {
    try {
      const allResults = await resultsHook.fetchAll();
      const myResults: Result[] = allResults.filter(
        (r) => r.studentId === studentProfile?.id && r.status === "published"
      );

      const avgScore = myResults.length > 0
        ? Math.round(myResults.reduce((sum: number, r: Result) => sum + r.total, 0) / myResults.length)
        : 0;

      const allPayments = await paymentsHook.fetchAll();
      const myPayments = allPayments.filter((p) => p.studentId === studentProfile?.id);
      const totalPaid = myPayments.reduce((sum: number, p: Payment) => sum + p.amountPaid, 0);
      const totalBalance = myPayments.reduce((sum: number, p: Payment) => sum + p.balance, 0);

      setStats({
        publishedResults: myResults.length,
        averageScore: avgScore,
        totalPayments: totalPaid,
        balance: totalBalance,
      });
    } catch (error) {
      console.error("Error loading student dashboard:", error);
    }
  };

  const quickActions = [
    { label: "My Results", icon: TrendingUp, path: "/student/results", color: "#1E3A8A" },
    { label: "Payments", icon: CreditCard, path: "/student/payments", color: "#0891B2" },
    { label: "Timetable", icon: Calendar, path: "/student/timetable", color: "#7C3AED" },
    { label: "Messages", icon: MessageSquare, path: "/student/messages", color: "#D97706" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="bg-gradient-to-r from-[#102542] to-[#1E3A8A] text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {studentProfile?.name?.charAt(0) || "S"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {studentProfile?.name || "Student"}!</h1>
              <p className="text-blue-200 text-sm">
                {studentProfile?.class} | {studentProfile?.session} | {studentProfile?.term}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-[#D4A017] rounded-full text-xs font-medium">
                  {studentProfile?.status || "Active"}
                </span>
                <span className="text-xs text-blue-200">ID: {studentProfile?.schoolId}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Results</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">{stats.publishedResults}</p>
              </div>
              <Award size={24} className="text-[#1E3A8A]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Score</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">{stats.averageScore}%</p>
              </div>
              <TrendingUp size={24} className="text-[#059669]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">N{stats.totalPayments.toLocaleString()}</p>
              </div>
              <CreditCard size={24} className="text-[#0891B2]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-red-600">N{stats.balance.toLocaleString()}</p>
              </div>
              <BookOpen size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Access</CardTitle>
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

export default StudentDashboard;
