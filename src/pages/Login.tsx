import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, Eye, EyeOff, School } from "lucide-react";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, authLoading, currentUser, userRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId.trim() || !password.trim()) return;
    await login(schoolId.trim(), password);
  };

  if (currentUser && userRole) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#102542] via-[#1E3A8A] to-[#102542] p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* School Logo Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 px-8 pt-8 pb-6 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#102542] to-[#1E3A8A] rounded-full p-1 shadow-lg mb-4">
              <img
                src="/school-logo.png"
                alt="De-Best Gloryland School"
                className="w-full h-full rounded-full object-contain bg-white"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#102542] dark:text-white">
              De-Best Gloryland
            </h1>
            <p className="text-[#D4A017] font-medium text-sm mt-1">School Management System</p>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <School size={14} />
              <span>Excellence in Education</span>
            </div>
          </div>

          {/* Login Form */}
          <div className="px-8 py-6 bg-white dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  School ID or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    placeholder="Enter your School ID or email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all outline-none text-sm"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all outline-none text-sm"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#102542] to-[#1E3A8A] hover:from-[#1a3a5c] hover:to-[#264b9e] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your School ID and password to access your portal
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Admin: use your School ID or the email you registered with
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#102542] px-8 py-4 text-center">
            <p className="text-xs text-gray-400">
              De-Best Gloryland School &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
