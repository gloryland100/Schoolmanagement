import { Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StudentManagement from "@/pages/admin/StudentManagement";
import TeacherManagement from "@/pages/admin/TeacherManagement";
import ResultApproval from "@/pages/admin/ResultApproval";
import TimetableManagement from "@/pages/admin/TimetableManagement";
import AnnouncementManagement from "@/pages/admin/AnnouncementManagement";
import PaymentManagement from "@/pages/admin/PaymentManagement";
import Messages from "@/pages/admin/Messages";
import AdminSettings from "@/pages/admin/Settings";

// Teacher Pages
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherStudents from "@/pages/teacher/TeacherStudents";
import TeacherResults from "@/pages/teacher/TeacherResults";
import TeacherTimetable from "@/pages/teacher/TeacherTimetable";
import TeacherMessages from "@/pages/teacher/TeacherMessages";

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentResults from "@/pages/student/StudentResults";
import StudentTimetable from "@/pages/student/StudentTimetable";
import StudentPayments from "@/pages/student/StudentPayments";
import StudentMessages from "@/pages/student/StudentMessages";
import StudentAnnouncements from "@/pages/student/StudentAnnouncements";

function App() {
  const { userRole } = useStore();

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes with Layout */}
      <Route element={<AppLayout />}>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/teachers" element={<TeacherManagement />} />
        <Route path="/admin/results" element={<ResultApproval />} />
        <Route path="/admin/timetable" element={<TimetableManagement />} />
        <Route path="/admin/announcements" element={<AnnouncementManagement />} />
        <Route path="/admin/payments" element={<PaymentManagement />} />
        <Route path="/admin/messages" element={<Messages />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/students" element={<TeacherStudents />} />
        <Route path="/teacher/results" element={<TeacherResults />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/teacher/messages" element={<TeacherMessages />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/results" element={<StudentResults />} />
        <Route path="/student/timetable" element={<StudentTimetable />} />
        <Route path="/student/payments" element={<StudentPayments />} />
        <Route path="/student/messages" element={<StudentMessages />} />
        <Route path="/student/announcements" element={<StudentAnnouncements />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={userRole ? `/${userRole}` : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
