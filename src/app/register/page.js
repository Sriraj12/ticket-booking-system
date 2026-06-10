"use client";

import { useState } from "react";
import API, { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PublicRoute from "@/components/PublicRoute";
import { useAuth } from "@/contexts/AuthContext";
import BlackTicketIcon from "../icon/blackTicket";

function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/user/register", {
        name,
        email,
        password,
      });

      const { token, user } = res.data;
      login(token, user);

      alert("Registration successful! Welcome to CineBook.");
      router.push("/movies");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  const handleGoogleRegister = () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `${API_BASE_URL}/auth/google/register?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-100 to-white relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-black/10 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-black/5 backdrop-blur-xl border border-slate-300 rounded-2xl shadow-2xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <span className="text-4xl font-bold bg-clip-text text-transparent">
                <BlackTicketIcon width={180} height={100} />
              </span>
            </motion.div>
            {/* <h1 className="text-3xl font-bold text-white mb-2">CineBook</h1> */}
            <p className="text-slate-600">Create your account</p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-black/5 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-black/5 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-black/5 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-black/5 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <motion.button
              onClick={handleRegister}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3 mt-6 bg-gradient-to-r from-black to-slate-700 text-white font-semibold rounded-lg hover:from-slate-700 hover:to-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleGoogleRegister}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 mt-4 border border-slate-600 text-slate-900 font-semibold rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-300 shadow-sm"
            >
              Sign Up with Google
            </motion.button>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-sm mt-6">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-black font-semibold cursor-pointer hover:text-slate-900"
            >
              Sign in
            </span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterForm />
    </PublicRoute>
  );
}