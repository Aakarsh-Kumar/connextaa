"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { profileApi } from "@/features/profile/api/profileApi";
import { collaborationApi } from "@/features/collaboration/api/collaborationApi";
import { CATEGORIES, getCategoryStyles } from "@/constants";
import { type ProfileResponse, type CollaborationFeedItem } from "@/types";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityCard, SkeletonCard } from "@/components/dashboard/ActivityCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Star,
  Loader2,
  Compass,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

import { usePermissionStore } from "@/store/permissionStore";
import { LocationFeatureGuard } from "@/components/dashboard/LocationFeatureGuard";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBdjOVVpPF_CyFFwM0PKq5gTHLZoabu_iQdSTAzkNY_nO2fQ3rSoj41BnCu-QDkvsVKGYrd3kGXkUaOPB5NUlV3hiufvfd9X_3vZv7mIZTjfpNxNjVROiEL_YRmXIRYE1VE-kCJ7kNqzSC2Z6gjKDW43MCXJv1ije7ub3Ckpt-w8E4obDbQ6wL7buu2VtMaDkTHEGxhTRT_l-QRgPS_J3VP3ynNS1SOM17PZq67q04cMlIVR0wc45HnV0esb17f9mBpuanGFrrLMjet";

export default function PublicProfilePage() {
    const isMobile = useIsMobile();
    const router = useRouter();
    const locationPermission = usePermissionStore((state) => state.locationPermission);

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams<{ username: string }>();
    const username = params.username;

    // Collaborations state
    const [collabs, setCollabs] = useState<CollaborationFeedItem[]>([]);
    const [collabsLoading, setCollabsLoading] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Geolocation coordinates
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Join modal state
    const [isJoinSheetOpen, setIsJoinSheetOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<CollaborationFeedItem | null>(null);
    const [joinMessage, setJoinMessage] = useState("");
    const [joining, setJoining] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<string[]>([]);

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
                    // Fallback silently
                }
            );
        }
    }, [locationPermission]);

    useEffect(() => {
        const fetchProfile = async () => {
        try {
            const data = await profileApi.getPublicProfile(username);
            setProfile(data);
        }catch{
            router.back();
        } finally {
            setLoading(false);
        }
        };  
        if(!username) return;
        fetchProfile();
    }, [username,router]);

    useEffect(() => {
        if (!username) return;

        const loadCollabs = async () => {
            try {
                const data = await profileApi.getUserCollaborations(
                    username,
                    undefined,
                    coords?.lat,
                    coords?.lng
                );

                setCollabs(data.data ?? []);
                setNextCursor((data as any).nextCursor ?? null);
            } catch {
                // silently fail
            } finally {
                setCollabsLoading(false);
            }
        };

        loadCollabs();
    }, [username, coords]);

    const handleOpenJoin = (activity: CollaborationFeedItem) => {
        setSelectedActivity(activity);
        setJoinMessage("");
        setIsJoinSheetOpen(true);
    };

    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedActivity?.id) return;
        setJoining(true);
        try {
            await collaborationApi.joinCollaboration(selectedActivity.id, {
                message: joinMessage.trim() || undefined,
            });
            setPendingRequests((prev) => [...prev, selectedActivity.id!]);
            toast.success("Join request submitted!");
            setIsJoinSheetOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setJoining(false);
        }
    };

    const handleLoadMore = async () => {
        if (!nextCursor || loadingMore || !username) return;

        setLoadingMore(true);

        try {
            const data = await profileApi.getUserCollaborations(
                username,
                nextCursor,
                coords?.lat,
                coords?.lng
            );

            setCollabs((prev) => [...prev, ...(data.data ?? [])]);
            setNextCursor((data as any).nextCursor ?? null);
        } catch {
            // silently fail
        } finally {
            setLoadingMore(false);
        }
    };

    /* ─── Loading skeleton ──────────────────────────────────────── */
    if (loading || !profile) {
        return (
        <div className="max-w-5xl mx-auto py-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
            <Skeleton className="w-32 h-32 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full max-w-md" />
            <Skeleton className="h-10 w-32 rounded-full" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            </div>
            <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            </div>
        </div>
        );
    }

    const feedbackMetrics = [
        { label: "Showed Up", score: profile.rating.showUpRating },
        { label: "Friendly", score: profile.rating.friendlyRating },
        { label: "Safe", score: profile.rating.safeRating },
        { label: "Collaborative", score: profile.rating.collaborativeRating },
    ];

    /* ─── Page ──────────────────────────────────────────────────── */
    return (
        <div className="max-w-5xl mx-auto py-8 space-y-6">

        {/* ── Profile Header: centered, no banner ── */}
        <section className="flex flex-col items-center text-center pt-6 pb-8 space-y-4">

            {/* Avatar */}
            <div className="relative w-32 h-32">
            <Image
                alt="User Avatar"
                src={profile.user.avatarUrl || DEFAULT_AVATAR}
                width={100}
                height={100}
                className="w-full h-full rounded-full object-cover border-4 border-[var(--card)] shadow-md"
                onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                }}
            />
            </div>

            {/* Name & username */}
            <div className="space-y-1">
            <h1 className="font-headline-lg text-headline-lg text-[var(--foreground)] tracking-tight">
                {profile.user.name}
            </h1>
            <p className="font-body-md text-body-md text-[var(--outline)]">
                @{profile.user.username}
            </p>
            </div>

            {/* Bio */}
            <p className="font-body-md text-body-md text-[var(--on-surface-variant)] max-w-md leading-relaxed">
            {profile.user.bio ||
                "No bio added yet. Write something friendly about yourself!"}
            </p>

        </section>

        {/* ── Trust Score ── */}
        <section className="bg-[var(--card)] border border-[var(--surface-container-high)] rounded-2xl p-8 card-shadow text-center">
            <h2 className="font-label-md text-label-md uppercase tracking-widest text-[var(--outline)] mb-4">
            Trust Score
            </h2>
            <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
                <span className="font-display-lg text-display-lg text-[var(--primary)]">
                {profile.rating.overall > 0
                    ? profile.rating.overall.toFixed(1)
                    : "N/A"}
                </span>
                {profile.rating.overall > 0 && (
                <Star className="text-[var(--primary)] fill-[var(--primary)] w-9 h-9" />
                )}
            </div>
            <p className="font-label-md text-label-md text-[var(--primary-container)] font-semibold">
                Based on {profile.rating.totalReviews} community reviews
            </p>
            </div>
        </section>

        {/* ── Activity Stats ── */}
        <section className="grid grid-cols-3 gap-4">
            {[
            { label: "Created", count: profile.stats.created },
            { label: "Joined", count: profile.stats.joined },
            { label: "Completed", count: profile.stats.completed },
            ].map((stat) => (
            <div
                key={stat.label}
                className="bg-[var(--card)] border border-[var(--surface-container-high)] p-6 rounded-2xl text-center card-shadow"
            >
                <p className="font-headline-md text-headline-md text-[var(--on-surface)] mb-1">
                {stat.count}
                </p>
                <p className="font-label-sm text-label-sm text-[var(--outline)]">
                {stat.label}
                </p>
            </div>
            ))}
        </section>

        {/* ── Interests ── */}
        <section className="space-y-4">
            <h3 className="font-headline-md text-headline-md text-[var(--foreground)] px-1 tracking-tight">
            Interests
            </h3>

            {profile.user.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3 px-1">
                {profile.user.categories.map((catId) => {
                const matched = CATEGORIES.find((c) => c.id === catId);
                if (!matched) return null;
                const Icon = matched.icon;
                return (
                    <div
                    key={catId}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-full font-label-md text-label-md ${getCategoryStyles(
                        catId
                    )}`}
                    >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{matched.name}</span>
                    </div>
                );
                })}
            </div>
            ) : (
            <p className="text-sm text-[var(--muted-foreground)] px-1 italic">
                No interests added yet.
            </p>
            )}
        </section>

        
        {/* ── Community Feedback ── */}
        <section className="space-y-4">
            <h3 className="font-headline-md text-headline-md text-[var(--foreground)] px-1 tracking-tight">
            Community Feedback
            </h3>
            <div
            className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
            >
            {feedbackMetrics.map((metric) => (
                <div
                key={metric.label}
                className="bg-[var(--card)] px-6 py-4 rounded-2xl flex justify-between items-center border border-[var(--surface-container-high)] shadow-sm"
                >
                <span className="font-body-md text-body-md text-[var(--on-surface-variant)]">
                    {metric.label}
                </span>
                <div className="flex items-center gap-1">
                    <Star className="text-[var(--primary)] fill-[var(--primary)] w-[18px] h-[18px]" />
                    <span className="font-label-md text-label-md font-bold text-[var(--foreground)]">
                    {metric.score > 0 ? metric.score.toFixed(1) : "N/A"}
                    </span>
                </div>
                </div>
            ))}
            </div>
        </section>

        {/* ── Collaborations ── */}
        <LocationFeatureGuard onLocationGranted={setCoords}>
          <section className="space-y-4">
              <h3 className="font-headline-md text-headline-md text-[var(--foreground)] px-1 tracking-tight">
              Collaborations
              </h3>

              {collabsLoading ? (
              <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
              </div>
              ) : collabs.length === 0 ? (
              <div className="bg-[var(--card)] border border-[var(--surface-container-high)] rounded-2xl p-10 text-center space-y-3 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-container-low)] flex items-center justify-center">
                  <Compass className="w-6 h-6 text-[var(--outline)]" />
                  </div>
                  <p className="font-semibold text-[var(--on-surface)]">No collaborations yet</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">
                  {profile.user.name} hasn&apos;t posted any collaborations.
                  </p>
              </div>
              ) : (
              <div className="space-y-4">
                  {collabs.map((activity) => (
                  <ActivityCard
                      key={activity.id}
                      activity={activity}
                      pendingRequests={pendingRequests}
                      onOpenJoin={handleOpenJoin}
                      isJoined={(activity as any).isJoined}
                  />
                  ))}

                  {/* Load more */}
                  {nextCursor && (
                  <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                      {loadingMore ? (
                      <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                      </>
                      ) : (
                      "Load more"
                      )}
                  </button>
                  )}
              </div>
              )}
          </section>
        </LocationFeatureGuard>

        {/* ── Join Request Bottom Sheet ── */}
        <Sheet open={isJoinSheetOpen} onOpenChange={setIsJoinSheetOpen}>
            <SheetContent side="bottom" className="p-6 pb-20 md:pb-8 rounded-t-3xl border-t border-[var(--border)] max-w-lg mx-auto bg-[var(--card)] max-h-[88dvh] overflow-y-auto">
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
                    Hosted by{" "}
                    <Link href={`/dashboard/profile/${selectedActivity.creator?.username}`}>
                    <span className="font-bold text-[var(--on-surface)] underline">
                        {selectedActivity.creator?.name || "Neighbor"}
                    </span>
                    </Link>
                </p>
                </div>
            )}

            <form onSubmit={handleJoinSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                <label htmlFor="join-message" className="text-sm font-semibold text-[var(--foreground)]">
                    Message to creator{" "}
                    <span className="text-xs text-[var(--muted-foreground)]">
                    ({joinMessage.length}/120 characters)
                    </span>
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