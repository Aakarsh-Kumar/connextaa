"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/api/authApi";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getCurrentUser();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser, setLoading]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-semibold tracking-wide">Loading Connectify...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
