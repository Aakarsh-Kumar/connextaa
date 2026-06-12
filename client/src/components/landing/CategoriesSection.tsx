"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Car, Ticket, BookOpen, Briefcase, Dumbbell, Plane, MoreHorizontal } from "lucide-react";

export default function CategoriesSection() {
  const isMobile = useIsMobile();

  const categories = [
    {
      name: "Carpooling",
      icon: Car,
      bgClass: "bg-primary/10",
      textClass: "text-primary",
    },
    {
      name: "Events",
      icon: Ticket,
      bgClass: "bg-secondary/10",
      textClass: "text-secondary",
    },
    {
      name: "Study",
      icon: BookOpen,
      bgClass: "bg-primary-container/10",
      textClass: "text-primary-container",
    },
    {
      name: "Professional",
      icon: Briefcase,
      bgClass: "bg-on-background/10",
      textClass: "text-on-background",
    },
    {
      name: "Sports",
      icon: Dumbbell,
      bgClass: "bg-secondary-container/10",
      textClass: "text-secondary-container",
    },
    {
      name: "Trips",
      icon: Plane,
      bgClass: "bg-primary/10",
      textClass: "text-primary",
    },
    {
      name: "Other",
      icon: MoreHorizontal,
      bgClass: "bg-outline-variant/10",
      textClass: "text-outline-variant",
    },
  ];

  return (
    <section id="categories" className={`scroll-mt-16 bg-surface-container-low px-5 md:px-10 ${isMobile ? "py-12" : "py-20"}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`text-center ${isMobile ? "mb-10" : "mb-16"}`}>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Browse Categories
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md">
            Whatever you&rsquo;re looking for, we have a community for it.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="bg-white p-6 rounded-[24px] card-shadow cursor-pointer hover:scale-105 transition-all flex flex-col items-center justify-center"
              >
                <div
                  className={`w-12 h-12 ${cat.bgClass} ${cat.textClass} rounded-full flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-on-surface text-base">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
