"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const decodeUser = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch (_error) {
    try {
      return JSON.parse(atob(value));
    } catch (_error2) {
      return null;
    }
  }
};

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState("Completing Google login...");

  const redirectByRole = useCallback((user) => {
    if (user.role_id === 1) {
      router.replace("/admin/dashboard");
    } else if (user.role_id === 2) {
      router.replace("/seller/dashboard");
    } else {
      router.replace("/movies");
    }
  }, [router]);

  useEffect(() => {
    const completeOAuth = async () => {
      const token = searchParams.get("token");
      const userParam = searchParams.get("user");
      const code = searchParams.get("code");

      if (token && userParam) {
        const userData = decodeUser(userParam);

        if (!userData) {
          setStatus("Login failed: unable to parse user details.");
          return;
        }

        login(token, userData);
        redirectByRole(userData);
        return;
      }

      if (!code) {
        setStatus("Login failed: missing callback data.");
        return;
      }

      try {
        setStatus("Completing Google login...");
        const redirectUri = `${window.location.origin}/auth/callback`;
        const res = await API.post("/auth/google/callback", {
          code,
          redirect_uri: redirectUri,
        });

        const { token: backendToken, user } = res.data;

        if (!backendToken || !user) {
          setStatus("Login failed: invalid server response.");
          return;
        }

        login(backendToken, user);
        redirectByRole(user);
      } catch (err) {
        setStatus(err.response?.data?.message || "Google login failed.");
      }
    };

    completeOAuth();
  }, [login, router, searchParams, redirectByRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900/90 border border-slate-700 p-10 text-center shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-white mb-4">Google OAuth</h1>
        <p className="text-slate-300 mb-6">{status}</p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex items-center justify-center rounded-full bg-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-600 transition"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
