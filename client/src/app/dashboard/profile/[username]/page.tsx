"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { profileApi } from "@/features/profile/api/profileApi";
import { CATEGORIES, getCategoryStyles } from "@/constants";
import { type ProfileResponse } from "@/types";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBdjOVVpPF_CyFFwM0PKq5gTHLZoabu_iQdSTAzkNY_nO2fQ3rSoj41BnCu-QDkvsVKGYrd3kGXkUaOPB5NUlV3hiufvfd9X_3vZv7mIZTjfpNxNjVROiEL_YRmXIRYE1VE-kCJ7kNqzSC2Z6gjKDW43MCXJv1ije7ub3Ckpt-w8E4obDbQ6wL7buu2VtMaDkTHEGxhTRT_l-QRgPS_J3VP3ynNS1SOM17PZq67q04cMlIVR0wc45HnV0esb17f9mBpuanGFrrLMjet";

export default function PublicProfilePage() {
    const isMobile = useIsMobile();
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams<{ username: string }>();
    const username = params.username;
    
    

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

    /* ─── Loading skeleton ──────────────────────────────────────── */
    if (loading || !profile) {
        return (
        <div
            className={`max-w-[800px] mx-auto py-8 space-y-6 ${
            isMobile ? "px-4" : "px-0"
            }`}
        >
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
        <div
        className={`max-w-[800px] mx-auto py-8 space-y-6 ${
            isMobile ? "px-4" : "px-0"
        }`}
        >

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

        </div>
    );
}