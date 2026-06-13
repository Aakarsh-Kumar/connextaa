"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";

export default function CtaSection() {
  const isMobile = useIsMobile();

  return (
    <section className={`px-5 md:px-10 ${isMobile ? "py-16" : "py-24"} bg-background`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className={`font-display-lg text-on-surface ${isMobile ? "text-[28px] leading-[36px] tracking-[-0.01em] font-bold" : "text-display-lg"} mb-8`}
        >
          Ready to find your next collaboration?
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">
          Join community where people are already sharing rides, studying together, and building local communities.
        </p>
          {useAuthStore((state) => state.isAuthenticated) ? (
              <Link
              href="/dashboard"
              className={`bg-popover text-primary-foreground ${isMobile ? "px-8 py-4 text-lg" : "px-12 py-5 text-xl"} rounded-[9999px] font-bold card-shadow active:scale-95 hover:bg-primary/95 transition-all cursor-pointer mb-6`}
              >
              Go to Dashboard
              </Link>
              ) : (
                  <GoogleLoginButton />
          )}
      </div>
    </section>
  );
}
