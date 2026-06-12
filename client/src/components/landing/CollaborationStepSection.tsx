"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CollaborationStepSection() {
  const isMobile = useIsMobile();

  const steps = [
    {
      number: 1,
      title: "Create Activity",
      desc: "Post what you need or what you're doing.",
    },
    {
      number: 2,
      title: "People Join",
      desc: "Vetted neighbors apply to join your plan.",
    },
    {
      number: 3,
      title: "Meet & Rate",
      desc: "Connect via group chat and meet up safely.",
    },
  ];

  return (
    <section id="how-it-works" className={`px-5 md:px-10 ${isMobile ? "py-16" : "py-24"} bg-background`}>
      <div className="max-w-7xl mx-auto">
        <h2 className={`font-headline-lg text-headline-lg text-on-surface text-center ${isMobile ? "mb-10" : "mb-16"}`}>
          Collaboration Made Simple
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <React.Fragment key={step.number}>
                {/* Step Container */}
                <div className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-sm">
                    {step.number}
                  </div>
                  <h4 className="font-bold text-on-surface text-lg mb-2">{step.title}</h4>
                  <p className="font-label-md text-label-md text-on-surface-variant max-w-xs">
                    {step.desc}
                  </p>
                </div>

                {/* Connecting Line (Only visible on Desktop between steps) */}
                {!isLast && (
                  <div className="hidden md:flex items-center pt-8">
                    <div className="h-0.5 w-full bg-outline-variant/30"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
