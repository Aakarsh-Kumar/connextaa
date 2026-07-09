"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { trendingApi } from "@/features/landing/api/trendingApi";
import { ActivityCard, SkeletonCard } from "@/components/dashboard/ActivityCard";


export default function TrendingSection() {
  const isMobile = useIsMobile();
  const { data, isLoading } = useQuery({
    queryKey: ["trending-collaborations"],
    queryFn: trendingApi.getTrending,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const activities = data?.data ?? [];

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                pendingRequests={[]}
                variant="landing"
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-on-surface-variant">
              No trending activities available.
            </div>
          )}
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
