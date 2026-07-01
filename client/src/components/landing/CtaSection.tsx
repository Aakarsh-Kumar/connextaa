"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PwaAwareAuthButton } from "@/components/utils/PwaAwareAuthButton";

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
        <PwaAwareAuthButton size={isMobile ? "md" : "lg"} />
      </div>
    </section>
  );
}
