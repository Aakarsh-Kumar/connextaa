"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (!user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [user, loading, router]);

  if (loading) {
    return null; // or your spinner
  }

  if (!user) {
    return null;
  }

  if (!user.onboardingCompleted) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}