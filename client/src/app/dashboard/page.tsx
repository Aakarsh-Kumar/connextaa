"use client";

import { useEffect, useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { collaborationApi } from "@/features/collaboration/api/collaborationApi";
import { profileApi } from "@/features/profile/api/profileApi";
import { type Category, type CollaborationFeedItem } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ActivityCard, SkeletonCard } from "@/components/dashboard/ActivityCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Search,
  MapPin,
  Compass,
  Plus,
  Map,
  Loader2
} from "lucide-react";
import { getCategoryStyles, CATEGORIES } from "@/constants";

import { usePermissionStore } from "@/store/permissionStore";
import { LocationFeatureGuard } from "@/components/dashboard/LocationFeatureGuard";

const CATEG_ITEMS = [{ id: "ALL", name: "All", icon: null }, ...CATEGORIES];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const locationPermission = usePermissionStore((state) => state.locationPermission);

  // Coordinates (default to SRM University)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.8230,
    lng: 80.0444,
  });

  const [search, setSearch] = useState("");
  const DISTANCE_OPTIONS = [
    { label: "2 km", value: 2 },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "25km+", value: 9999 },
  ];

  const [radius, setRadius] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
  } = useInfiniteQuery({
    queryKey: ["collaborations", coords.lat, coords.lng, radius, selectedCategory],
    queryFn: ({ pageParam }) =>
      collaborationApi.getCollaborations({
        cursor: pageParam as string | undefined,
        limit: 10,
        category: selectedCategory !== "ALL" ? (selectedCategory as Category) : undefined,
        lat: coords.lat,
        lng: coords.lng,
        radius: radius === 9999 ? undefined : radius,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const feed = feedData?.pages.flatMap((page) => page.data ?? []) ?? [];

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentEl = observerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const [userCategories, setUserCategories] = useState<Category[]>([]);

  // Join Flow Bottom Sheet States
  const [selectedActivity, setSelectedActivity] = useState<CollaborationFeedItem | null>(null);
  const [isJoinSheetOpen, setIsJoinSheetOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joining, setJoining] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  // Greeting dynamic based on time
  const greeting = (() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return "Good Morning";
    } else if (hours >= 12 && hours < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  })();

  // Request browser geolocation on mount only if already granted
  useEffect(() => {
    if (locationPermission === "granted" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation failed/unavailable. Using fallback location.");
        }
      );
    }
  }, [locationPermission]);

  // Fetch current user's profile interests
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const data = await profileApi.getMeProfile();
        if (data.user.categories) {
          setUserCategories(data.user.categories);
        }
      } catch (err) {
        console.error("Failed to load user profile categories", err);
      }
    };
    fetchInterests();
  }, []);



  const handleOpenJoin = (activity: CollaborationFeedItem) => {
    setSelectedActivity(activity);
    setJoinMessage("");
    setIsJoinSheetOpen(true);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !selectedActivity.id) return;

    setJoining(true);
    try {
      await collaborationApi.joinCollaboration(selectedActivity.id, {
        message: joinMessage.trim() || undefined,
      });

      setPendingRequests((prev) => [...prev, selectedActivity.id!]);
      toast.success("Join request submitted successfully!");
      setIsJoinSheetOpen(false);
    } finally {
      setJoining(false);
    }
  };

  // Filter activities locally by search input
  const filteredFeed = feed.filter((activity) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      activity.title?.toLowerCase().includes(query) ||
      activity.description?.toLowerCase().includes(query)
    );
  });

  // Calculate recommended activities matching user profile categories
  // const recommendedActivities = feed.filter((activity) =>
  //   activity.category ? userCategories.includes(activity.category) : false
  // );


  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Welcome Header */}
      <header className="mb-stack-lg">
        <h1 className={isMobile
          ? "font-headline-lg-mobile text-headline-lg-mobile text-on-surface"
          : "font-headline-lg text-headline-lg text-on-surface"
        }>
          {greeting}, {user?.name.split(" ")[0] || "Collaborator"}
        </h1>
        <p className="text-on-surface-variant font-body-md mt-1">
          Find something interesting nearby today.
        </p>
      </header>

      <LocationFeatureGuard onLocationGranted={setCoords}>
        {/* Search & Filters Container */}
        <section className="bg-[var(--card)] p-6 rounded-2xl shadow-[0px_4px_20px_rgba(31,41,55,0.05)] border border-[var(--surface-container-high)] space-y-6">
          
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--outline)] group-focus-within:text-[var(--primary)] transition-colors" />
            <input
              className="w-full pl-12 pr-4 py-4 bg-[var(--surface-container-low)] border-none rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-body-md text-[var(--foreground)] placeholder:text-[var(--outline)]"
              placeholder="What would you like to do today?"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Distance Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-[var(--on-surface)] font-medium">
                Distance
              </span>
              <span className="text-xs text-[var(--on-surface-variant)]">
                Showing activities within{" "}
                {radius === 9999 ? "25km+" : `${radius} km`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map((option) => {
                const isActive = radius === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRadius(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "bg-white border border-[var(--border)] text-[var(--on-surface)] hover:border-[var(--primary)] hover:text-[var(--primary)] "
                    }`}
                  >
                    <MapPin className="text-[var(--secondary)] w-3.5 h-3.5" /> {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {CATEG_ITEMS.map((item) => {
              const isActive = selectedCategory === item.id;
              const Icon = item.icon;
              const activeStyles =
                item.id === "ALL"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
                  : getCategoryStyles(item.id as Category);

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCategory(item.id)}
                  className={`px-5 py-2.5 rounded-full font-label-md text-label-md transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? `${activeStyles} font-bold shadow-md scale-[1.03]`
                      : "bg-[var(--card)] text-[var(--on-surface-variant)] border-[var(--outline-variant)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary-container)]/5"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 transition-transform ${
                        isActive ? "scale-110" : "opacity-70"
                      }`}
                    />
                  )}
                  {item.name}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Feed Grid */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-headline-md text-headline-md text-[var(--on-surface)] tracking-tight">
              Nearby Activities
            </h2>
            <button
              onClick={() => toast("Map view coming soon!")}
              className="text-[var(--primary)] font-label-md text-label-md flex items-center gap-1 hover:underline cursor-pointer"
            >
              View Map <Map className="w-4.5 h-4.5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredFeed.length > 0 ? (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
              {filteredFeed.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  pendingRequests={pendingRequests}
                  onOpenJoin={handleOpenJoin}
                />
              ))}
              
              {/* Observer element */}
              <div ref={observerRef} className="h-4" />

              {/* Loading more spinner */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[var(--card)] border border-[var(--surface-container-high)] rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto mt-8">
              <div className="w-40 h-40 text-[var(--primary)] opacity-80 flex items-center justify-center bg-[var(--primary-container)]/10 rounded-full">
                <Compass className="w-20 h-20 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline-md text-headline-md text-[var(--on-surface)] tracking-tight">
                  No activities nearby yet
                </h3>
                <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-sm">
                  Be the first to create one and invite others.
                </p>
              </div>
              <Link
                href="/dashboard/collaborations/create"
                className="px-8 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-bold transition-all active:scale-[0.98] shadow-md hover:opacity-90 inline-block text-sm"
              >
                Create Activity
              </Link>
            </div>
          )}
        </section>
      </LocationFeatureGuard>

      {/* FAB */}
      <Link
        href="/dashboard/collaborations/create"
        className="fixed bottom-24 right-8 w-14 h-14 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-full shadow-lg flex items-center justify-center md:bottom-12 transition-transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </Link>

      {/* Join Request Bottom Sheet Drawer */}
      <Sheet open={isJoinSheetOpen} onOpenChange={setIsJoinSheetOpen}>
        <SheetContent side="bottom" className="p-6 pb-8 rounded-t-3xl border-t border-[var(--border)] max-w-lg mx-auto bg-[var(--card)]">
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-xl font-bold font-headline-md text-[var(--foreground)]">
              Join Activity
            </SheetTitle>
            <SheetDescription className="text-sm text-[var(--muted-foreground)]">
              Submit a request to participate in this collaboration.
            </SheetDescription>
          </SheetHeader>

          {selectedActivity && (
            <div className="mt-4 p-4 bg-[var(--surface-container-low)] rounded-2xl border border-[var(--surface-container-high)] space-y-1.5">
              <h4 className="font-bold text-base text-[var(--foreground)] break-words">
                {selectedActivity.title}
              </h4>
              <p className="text-xs text-[var(--outline)] font-medium">
                Hosted by <Link href={`/dashboard/profile/${selectedActivity.creator?.id}`}><span className="font-bold text-[var(--on-surface)] underline">{selectedActivity.creator?.name || "Neighbor"}</span></Link>
              </p>
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="join-message" className="text-sm font-semibold text-[var(--foreground)]">
                Message to creator <span className="text-xs text-[var(--muted-foreground)]">({joinMessage.length}/120 characters)</span>
              </label>
              <textarea
                id="join-message"
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] focus:outline-none transition-all bg-transparent text-sm h-24 resize-none text-[var(--foreground)]"
                placeholder="Tell the creator why you'd like to join."
                required
                maxLength={120}
              />
              
            </div>

            <SheetFooter className="flex gap-2 pt-4 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsJoinSheetOpen(false)}
                disabled={joining}
                className="h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={joining}
                className="h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold hover:opacity-90 flex items-center justify-center min-w-[120px]"
              >
                {joining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-1" />
                    <span>Sending...</span>
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}