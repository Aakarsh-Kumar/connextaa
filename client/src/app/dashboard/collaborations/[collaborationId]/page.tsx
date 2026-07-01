"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { collaborationApi } from "@/features/collaboration/api/collaborationApi";
import { useAuthStore } from "@/store/authStore";
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
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { type CollaborationFeedItem, type JoinStatus } from "@/types";

export default function CollaborationDetailPage() {
  const { collaborationId } = useParams<{ collaborationId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  // Join sheet state
  const [isJoinSheetOpen, setIsJoinSheetOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joining, setJoining] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["collaboration", collaborationId],
    queryFn: () => collaborationApi.getCollaborationDetails(collaborationId),
    enabled: !!collaborationId,
  });

  const collab = data?.collaboration;
  const myJoinStatus = data?.myJoinStatus as JoinStatus | undefined;
  const isCreator = data?.isCreator ?? false;

  // Shape into CollaborationFeedItem
  const activity: CollaborationFeedItem | undefined = collab
    ? {
        id: collab.id,
        category: collab.category,
        title: collab.title,
        description: collab.description,
        scheduledAt: collab.scheduledAt,
        status: collab.status,
        currentMembers: data?.currentMembers ?? 0,
        maxMembers: collab.maxMembers,
        distanceMeters: null,
        rating: null,
        creator: collab.creator,
        fromLocation: collab.fromLocation,
        toLocation: collab.toLocation,
        isJoined: isCreator || myJoinStatus === "APPROVED",
        isPending: !isCreator && myJoinStatus === "PENDING",
      } as any
    : undefined;

  const isJoined = isCreator || myJoinStatus === "APPROVED";
  const isPending = !isCreator && myJoinStatus === "PENDING";

  const handleOpenJoin = () => {
    setJoinMessage("");
    setIsJoinSheetOpen(true);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaborationId) return;

    setJoining(true);
    try {
      await collaborationApi.joinCollaboration(collaborationId, {
        message: joinMessage.trim() || undefined,
      });
      setPendingRequests((prev) => [...prev, collaborationId]);
      toast.success("Join request submitted successfully!");
      setIsJoinSheetOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit join request.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Back Navigation */}
      <div className="flex items-center gap-3">
        <h1 className="font-headline-md text-headline-md text-[var(--on-surface)] tracking-tight">
          Collaboration Details
        </h1>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <SkeletonCard />
      ) : isError || !activity ? (
        <div className="bg-[var(--card)] border border-[var(--surface-container-high)] rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="font-headline-md text-headline-md text-[var(--on-surface)]">
              Collaboration not found
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)] max-w-sm">
              This collaboration may have been deleted or you may not have access to it.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-bold hover:opacity-90 transition-all text-sm"
          >
            Back to Feed
          </Link>
        </div>
      ) : (
        <ActivityCard
          activity={activity}
          pendingRequests={pendingRequests}
          onOpenJoin={handleOpenJoin}
          isJoined={isJoined}
        />
      )}

      {/* Join Request Bottom Sheet */}
      <Sheet open={isJoinSheetOpen} onOpenChange={setIsJoinSheetOpen}>
        <SheetContent
          side="bottom"
          className="p-6 pb-8 rounded-t-3xl border-t border-[var(--border)] max-w-lg mx-auto bg-[var(--card)]"
        >
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-xl font-bold font-headline-md text-[var(--foreground)]">
              Join Activity
            </SheetTitle>
            <SheetDescription className="text-sm text-[var(--muted-foreground)]">
              Submit a request to participate in this collaboration.
            </SheetDescription>
          </SheetHeader>

          {activity && (
            <div className="mt-4 p-4 bg-[var(--surface-container-low)] rounded-2xl border border-[var(--surface-container-high)] space-y-1.5">
              <h4 className="font-bold text-base text-[var(--foreground)] break-words">
                {activity.title}
              </h4>
              <p className="text-xs text-[var(--outline)] font-medium">
                Hosted by{" "}
                <Link href={`/dashboard/profile/${activity.creator?.username}`}>
                  <span className="font-bold text-[var(--on-surface)] underline">
                    {activity.creator?.name || "Neighbor"}
                  </span>
                </Link>
              </p>
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label
                htmlFor="join-message-detail"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Message to creator{" "}
                <span className="text-xs text-[var(--muted-foreground)]">
                  ({joinMessage.length}/120 characters)
                </span>
              </label>
              <textarea
                id="join-message-detail"
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
