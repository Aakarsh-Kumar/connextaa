
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, getCategoryStyles } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  Star,
  User,
  Users,
  MapPin,
  Calendar,
  Share2,
  Copy,
  Check,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import toast from "react-hot-toast";
import { CollaborationFeedItem } from "@/types";
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ActivityCardProps {
  activity: CollaborationFeedItem;
  pendingRequests: string[];
  onOpenJoin?: (act: CollaborationFeedItem) => void;
  isJoined?: boolean;
}

const formatDate = (dateString?: string) => {
if (!dateString) return "Today";
const date = new Date(dateString);
return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});
};

const formatDistance = (meters?: number | null) => {
if (meters === undefined || meters === null) return "0.0 km";
const km = meters / 1000;
return `${km.toFixed(1)} km away`;
};

export function ActivityCard({
  activity,
  pendingRequests,
  onOpenJoin,
  isJoined = false,
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isPending = activity.id ? pendingRequests.includes(activity.id) : false;
  const isCarpool = activity.category === "CARPOOLING";
  const CategoryIcon = CATEGORIES.find((c) => c.id === activity.category)?.icon ?? Compass;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard/collaborations/${activity.id}` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };
  const ctaText = isJoined
    ? "Joined"
    : isPending
    ? "Request Pending"
    : isCarpool
    ? "Request Seat"
    : "Join Activity";
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  console.log(activity, 'activity');
  return (
    <article className="bg-[var(--card)] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(31,41,55,0.05)] hover:shadow-[0px_6px_30px_rgba(31,41,55,0.1)] transition-all border border-[var(--surface-container-high)] flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${getCategoryStyles(activity.category)}`}>
          <CategoryIcon className="w-3.5 h-3.5" />
          {activity.category ? activity.category.toLowerCase() : "general"}
        </span>
        <div className="flex items-center gap-2">
          {activity.id && activity.id !== "preview" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="p-1.5 rounded-full hover:bg-[var(--surface-container-low)] text-[var(--outline)] hover:text-[var(--primary)] transition-colors cursor-pointer flex items-center justify-center border border-[var(--outline-variant)]/20 bg-white"
              title="Share Collaboration"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300 px-3 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{activity.status}</span>
          </span>
        </div>
      </div>

      {/* Title — always fully visible, no clamp */}
      <h3 className="font-headline-md text-headline-md text-[var(--on-surface)] leading-tight break-words [overflow-wrap:anywhere]">
        {activity.title}
      </h3>

      {/* Creator info */}
      <div className="flex items-center gap-2">
        {activity.creator?.avatarUrl ? (
          <Image
            alt="Creator Profile"
            width={24}
            height={24}
            className="rounded-full object-cover border border-[var(--border)] shrink-0"
            src={activity.creator.avatarUrl}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--surface-container-low)] text-[var(--outline)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
        )}
        <span className="font-label-md text-label-md text-[var(--on-surface-variant)] truncate">
          by{" "}
          <Link href={`/dashboard/profile/${activity.creator?.username}`}>
            <span className="font-bold text-[var(--on-surface)] underline">
              {activity.creator?.name || "Neighbor"}
            </span>
          </Link>
        </span>
        <span className="flex items-center text-yellow-600 font-bold text-label-sm gap-0.5 ml-auto shrink-0">
          <Star className="w-3.5 h-3.5 fill-yellow-600 text-yellow-600" />
          <span>{activity.rating?.toFixed(1) || 0}</span>
        </span>
      </div>

      {/* Description — expands in place, no fixed height */}
      <div>
        <p className={`font-body-md text-body-md text-[var(--on-surface-variant)] break-words [overflow-wrap:anywhere] ${isExpanded ? "" : "line-clamp-3"}`}>
          {activity.description}
        </p>
        {activity.description && activity.description.length > 140 && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`text-xs font-semibold text-[var(--primary)] hover:underline mt-1 disabled`}
            
          >
            {isExpanded ? "View less" : "View more"}
          </button>
        )}
      </div>

      {/* Location Route visualizer */}
      {/* Location Route visualizer */}
<button
  type="button"
  onClick={() => setIsLocationExpanded((prev) => !prev)}
  className="bg-[var(--surface-container-low)] p-4 rounded-xl flex items-center gap-4 border border-[var(--border)]/40 text-left w-full cursor-pointer hover:border-[var(--primary)]/40 transition-colors"
>
  <div className="flex flex-col items-center gap-1 shrink-0 self-stretch">
    <MapPin className="text-[var(--primary)] w-4.5 h-4.5" />
    <div className="w-0.5 flex-1 border-l-2 border-dashed border-[var(--outline-variant)]"></div>
    <MapPin className="text-[var(--secondary)] w-4.5 h-4.5" />
  </div>
  <div className="flex flex-col gap-3.5 justify-center py-0.5 min-w-0 flex-1">
    <span
      className={`font-label-md text-label-md text-[var(--on-surface)] font-medium break-words [overflow-wrap:anywhere] ${
        isLocationExpanded ? "" : "truncate"
      }`}
    >
      {activity.fromLocation?.name || "Starting Point"}
    </span>
    <span
      className={`font-label-md text-label-md text-[var(--on-surface)] font-medium break-words [overflow-wrap:anywhere] ${
        isLocationExpanded ? "" : "truncate"
      }`}
    >
      {activity.toLocation?.name || "Destination"}
    </span>
  </div>
</button>

      {/* Details Row */}
      <div className="flex justify-between items-center py-2 border-y border-[var(--outline-variant)]/30">
        <div className="flex items-center gap-3 text-[var(--outline)]">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{formatDate(activity.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Compass className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{formatDistance(activity.distanceMeters)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[var(--primary)]">
          <Users className="w-4.5 h-4.5 shrink-0" />
          <span className="text-label-md font-bold">
            {activity.currentMembers || 1} / {activity.maxMembers || 5} Members
          </span>
        </div>
      </div>

      {/* CTA Trigger — pinned to bottom */}
      <button
        disabled={isJoined || isPending || activity.id === "preview"}
        onClick={() => onOpenJoin?.(activity)}
        className={`mt-auto w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-sm text-sm cursor-pointer disabled:opacity-50 ${
          isJoined
            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-900 cursor-not-allowed font-semibold"
            : isPending
            ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-[var(--border)]"
            : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
        }`}
        
      >
        {ctaText}
      </button>

      {/* Share Collaboration Dialog */}
     <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
  <DialogContent
    className="
      w-[95vw]
      sm:max-w-md
      p-0
      gap-0
      rounded-3xl
      overflow-hidden
      border-0
      max-h-[90vh]
    "
  >
    {/* Accessibility */}
    <DialogHeader className="sr-only">
      <DialogTitle>Share Activity</DialogTitle>
      <DialogDescription>
        Share this collaboration with your friends.
      </DialogDescription>
    </DialogHeader>

    <div className="overflow-y-auto max-h-[90vh]">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-6 pt-8 pb-6 text-center border-b border-[var(--border)]">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/10">
          <Share2 className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-xl font-bold text-[var(--on-surface)]">
          Share Activity
        </h2>

        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Share it with your network to find collaborators faster.
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Share Link */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
            Share Link
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-3">
            <Share2 className="w-4 h-4 shrink-0 text-[var(--on-surface-variant)]" />

            <span className="flex-1 truncate font-mono text-xs text-[var(--on-surface)]">
              {shareUrl}
            </span>

            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native Share */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.share({
                  title: activity.title,
                  text: activity.description,
                  url: shareUrl,
                });
              } catch {}
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-3 text-sm font-semibold text-[var(--on-surface)] transition hover:bg-[var(--surface-container-low)] active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            Share via…
          </button>
        )}
      </div>
    </div>
  </DialogContent>
</Dialog>
    </article>
  );
}
/* ─── Skeleton Loading Cards ─────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="max-w-5xl w-full bg-[var(--card)] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(31,41,55,0.05)] border border-[var(--surface-container-high)] space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="flex justify-between items-center py-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}