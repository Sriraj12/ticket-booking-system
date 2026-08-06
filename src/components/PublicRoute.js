"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect authenticated users to their role-specific dashboard
      if (user?.role_id === 1) {
        router.push("/admin/dashboard");
      } else if (user?.role_id === 2) {
        router.push("/seller/dashboard");
      } else {
        router.push("/movies");
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return children;
}