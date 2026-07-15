"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShieldCheck, Star, UserCheck, Lock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Accounts",
    desc: "Mandatory Google authentication ensures real identities.",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    desc: "See feedback from previous collaborators before joining.",
  },
  {
    icon: UserCheck,
    title: "Community Reputation",
    desc: "Trust scores based on reliable attendance and helpfulness.",
  },
  {
    icon: Lock,
    title: "Secure Group Chats",
    desc: "Coordinate safely within our messaging platform.",
  },
];

export default function SafetySection() {
  const isMobile = useIsMobile();

  return (
    <section id="safety" className={`scroll-mt-16 bg-background px-5 md:px-10 ${isMobile ? "py-14" : "py-24"}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`text-center ${isMobile ? "mb-10" : "mb-16"}`}>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Your Safety is Primary
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md max-w-2xl mx-auto">
            We&rsquo;ve built Connextaa on a foundation of trust, so you can focus on making great connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-8 bg-white rounded-[24px] card-shadow flex flex-col gap-4"
              >
                <Icon className="w-9 h-9 text-primary" strokeWidth={1.75} />
                <h4 className="font-bold text-on-surface text-lg">{feature.title}</h4>
                <p className="font-label-md text-label-md text-on-surface-variant">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
