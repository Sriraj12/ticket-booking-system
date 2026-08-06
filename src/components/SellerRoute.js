"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SellerRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Redirect to appropriate page if not seller
    if (user?.role_id !== 2) {
      if (user?.role_id === 1) {
        router.push("/admin/dashboard");
      } else {
        router.push("/movies");
      }
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Only render if user is seller
  if (!isAuthenticated || user?.role_id !== 2) {
    return null; // Will redirect
  }

  return children;
}
