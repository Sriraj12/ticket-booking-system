"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleEditProfile = () => {
    alert("Edit profile page is coming soon.");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8 max-w-4xl mx-auto bg-slate-900/70 border border-slate-700/60 rounded-3xl p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center text-slate-950 text-2xl font-bold">
            👤
          </div>
          <div>
            <p className="text-slate-400 text-sm">Logged in as</p>
            <p className="text-white font-semibold">{user?.name || "User"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEditProfile}
            className="px-4 py-2 rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800 transition"
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}