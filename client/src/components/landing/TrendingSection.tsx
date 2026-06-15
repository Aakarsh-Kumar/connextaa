"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Calendar } from "lucide-react";

const activities = [
  {
    category: "Carpooling",
    categoryBg: "bg-secondary/10",
    categoryText: "text-secondary",
    title: "SF to Tahoe Ski Weekend",
    desc: "Driving up Friday afternoon. Have space for 2 people and gear. Splitting gas and tolls.",
    location: "San Francisco",
    date: "Feb 24",
    avatarColors: ["bg-blue-400", "bg-green-400"],
    overflow: 2,
    cta: "Join Group Chat",
  },
  {
    category: "Sports",
    categoryBg: "bg-primary/10",
    categoryText: "text-primary",
    title: "Intermediate Pickleball",
    desc: "Looking for 2 more players for a 2v2 match at Central Park courts this Saturday.",
    location: "New York, NY",
    date: "Feb 18",
    avatarColors: ["bg-orange-400", "bg-purple-400"],
    overflow: 0,
    cta: "Request to Join",
  },
  {
    category: "Professional",
    categoryBg: "bg-on-background/10",
    categoryText: "text-on-background",
    title: "Startup Founder Coffee",
    desc: "Early-stage founder looking to chat with others building in the AI space. Casual networking.",
    location: "Austin, TX",
    date: "Feb 21",
    avatarColors: ["bg-teal-400"],
    overflow: 0,
    cta: "Send Message",
  },
];

export default function TrendingSection() {
  const isMobile = useIsMobile();

  return (
    <section id="features" className={`scroll-mt-16 bg-white px-5 md:px-10 ${isMobile ? "py-14" : "py-20"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={`flex justify-between items-end ${isMobile ? "mb-8" : "mb-12"}`}>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Trending Now
            </h2>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1">
              Discover active collaborations in your area.
            </p>
          </div>
          <button className="hidden md:block text-primary font-bold border-b-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
            View All Activities
          </button>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="bg-surface-container-low rounded-[24px] p-6 border border-outline-variant/10 card-shadow transition-all group"
            >
              {/* Top Row: Category Chip + Avatars */}
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`${activity.categoryBg} ${activity.categoryText} font-label-sm text-label-sm px-3 py-1 rounded-full font-bold`}
                >
                  {activity.category}
                </span>
                <div className="flex -space-x-2">
                  {activity.avatarColors.map((color, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white ${color}`}
                    />
                  ))}
                  {activity.overflow > 0 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      +{activity.overflow}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-headline-md text-on-surface mb-2 group-hover:text-primary transition-colors text-lg font-bold">
                {activity.title}
              </h3>

              {/* Description */}
              <p className="text-on-surface-variant font-body-md text-body-md mb-6 line-clamp-2">
                {activity.desc}
              </p>

              {/* Location & Date */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-label-sm text-label-sm">{activity.location}</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-label-sm text-label-sm">{activity.date}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full py-3 bg-popover text-primary-foreground rounded-[16px] font-bold hover:shadow-lg active:scale-95 transition-all cursor-pointer">
                {activity.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Mobile "View All" link (visible only on mobile) */}
        {isMobile && (
          <div className="mt-8 text-center">
            <button className="text-primary font-bold border-b-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
              View All Activities
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
