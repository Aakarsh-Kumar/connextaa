"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      router.push("/onboarding");
    }
    if(!user){
      router.push("/")
    }
  }, [user, router]);

  if (user && !user.onboardingCompleted) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
