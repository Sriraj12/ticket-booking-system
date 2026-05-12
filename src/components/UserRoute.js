"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function UserRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Redirect to appropriate page if admin or seller
    if (user?.role_id === 1) {
      router.push("/admin/dashboard");
    } else if (user?.role_id === 2) {
      router.push("/seller/dashboard");
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Only render if user is regular user (no admin or seller role)
  if (!isAuthenticated || user?.role_id === 1 || user?.role_id === 2) {
    return null; // Will redirect
  }

  return children;
}
