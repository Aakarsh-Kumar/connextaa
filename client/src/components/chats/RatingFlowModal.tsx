"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratingsApi } from "@/features/ratings/api/ratingsApi";
import { RatingQueueUser, SubmitRatingRequest } from "@/types";
import { Star, X, User, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RatingFlowModalProps {
  collaborationId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hovered: number;
  onHover: (v: number) => void;
  onLeave: () => void;
}

// ── Star Rating Control ────────────────────────────────────────────────────────

function StarRating({ label, value, onChange, hovered, onHover, onLeave }: StarRatingProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-[var(--on-surface-variant)] min-w-[110px]">
        {label}
      </span>
      <div className="flex items-center gap-1" onMouseLeave={onLeave}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => onHover(star)}
              className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={`w-7 h-7 transition-colors duration-100 ${
                  filled
                    ? "fill-[var(--secondary)] text-[var(--secondary)]"
                    : "text-[var(--outline-variant)]"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RatingFlowModal({ collaborationId, onClose, onComplete }: RatingFlowModalProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ratingQueue", collaborationId],
    queryFn: () => ratingsApi.getRatingQueue(collaborationId),
  });

  const participants: RatingQueueUser[] = data?.participants ?? [];

  const [showDone, setShowDone] = useState(false);

  // Per-participant ratings state
  const emptyRatings = () => ({
    showUpRating: 0,
    friendlyRating: 0,
    safeRating: 0,
    collaborativeRating: 0,
    comment: "",
  });

  const [ratings, setRatings] = useState(emptyRatings());
  const [hovered, setHovered] = useState({ showUp: 0, friendly: 0, safe: 0, collaborative: 0 });

  // Reset ratings when participant changes
  useEffect(() => {
  if (participants.length > 0) {
    setRatings(emptyRatings());
    setHovered({
      showUp: 0,
      friendly: 0,
      safe: 0,
      collaborative: 0,
    });
  }
}, [participants]);

  const mutation = useMutation({
    mutationFn: (body: SubmitRatingRequest) => ratingsApi.submitRating(body),
    onSuccess: () => {
      // Immediately move to next participant
      queryClient.invalidateQueries({ queryKey: ["ratingQueue", collaborationId] });
      queryClient.invalidateQueries({ queryKey: ["chatRoom"] });
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRatings"] });
    },
    onError: () => {
      toast.error("Failed to submit rating. Please try again.");
    },
  });

  const currentParticipant = participants[0];

  // Auto-complete when no participants remain
  useEffect(() => {
    if (!isLoading && !isError && participants.length === 0) {
      setShowDone(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isError, participants.length, onComplete]);

  const allRated =
    ratings.showUpRating > 0 &&
    ratings.friendlyRating > 0 &&
    ratings.safeRating > 0 &&
    ratings.collaborativeRating > 0;

  const handleSubmit = useCallback(async () => {
    if (!currentParticipant || !allRated) return;

    const body: SubmitRatingRequest = {
      collaborationId,
      reviewedUserId: currentParticipant.id,
      showUpRating: ratings.showUpRating,
      friendlyRating: ratings.friendlyRating,
      safeRating: ratings.safeRating,
      collaborativeRating: ratings.collaborativeRating,
      comment: ratings.comment || undefined,
    };

   await mutation.mutateAsync(body);

  }, [
  currentParticipant,
  allRated,
  ratings,
  collaborationId,
  mutation,
  onComplete,
]);

  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (participants.length > 0 && total === 0) {
      setTotal(participants.length);
    }
  }, [participants.length, total]);

  // ── Completion State ──────────────────────────────────────────────────────────

  if (showDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-[var(--card)] rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-[var(--on-surface)]">All Done!</h2>
          <p className="text-sm text-[var(--on-surface-variant)] text-center">
            Thank you for rating your fellow participants. Your feedback helps build a trusted community.
          </p>
        </div>
      </div>
    );
  }

  // ── Loading State ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-[var(--card)] rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm font-medium text-[var(--on-surface-variant)]">Loading participants…</p>
        </div>
      </div>
    );
  }

  if (isError || participants.length === 0) return null;

  const completed = total - participants.length;

  const progressPct =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  // ── Rating Form ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm overflow-hidden">
      <div
        className="bg-[var(--card)] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:fade-in sm:zoom-in-95 duration-300"
        style={{ maxHeight: "88dvh" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider mb-0.5">
              Rate Participant
            </p>
            <h2 className="text-lg font-bold text-[var(--on-surface)]">Share your experience</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--surface-container-low)] transition-colors text-[var(--outline)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--outline)] font-medium">
              {total - participants.length + 1} of {total}
            </span>
            <span className="text-xs text-[var(--primary)] font-semibold">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-[var(--surface-container-high)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Participant */}
          <div className="flex flex-col items-center py-5 gap-3">
            <div className="relative">
              {currentParticipant.avatarUrl ? (
                <Image
                  src={currentParticipant.avatarUrl}
                  alt={currentParticipant.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[var(--primary)]/20 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--surface-container)] flex items-center justify-center border-2 border-[var(--primary)]/20 shadow-md">
                  <User className="w-9 h-9 text-[var(--outline)]" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center shadow">
                <Star className="w-3 h-3 fill-white text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-[var(--on-surface)]">{currentParticipant.name}</p>
              <p className="text-sm text-[var(--outline)]">@{currentParticipant.username}</p>
            </div>
          </div>

          {/* Rating Dimensions */}
          <div className="bg-[var(--surface-container-low)] rounded-2xl p-4 space-y-4 border border-[var(--outline-variant)]/30">
            <StarRating
              label="Showed Up"
              value={ratings.showUpRating}
              onChange={(v) => setRatings((r) => ({ ...r, showUpRating: v }))}
              hovered={hovered.showUp}
              onHover={(v) => setHovered((h) => ({ ...h, showUp: v }))}
              onLeave={() => setHovered((h) => ({ ...h, showUp: 0 }))}
            />
            <div className="h-px bg-[var(--outline-variant)]/20" />
            <StarRating
              label="Friendly"
              value={ratings.friendlyRating}
              onChange={(v) => setRatings((r) => ({ ...r, friendlyRating: v }))}
              hovered={hovered.friendly}
              onHover={(v) => setHovered((h) => ({ ...h, friendly: v }))}
              onLeave={() => setHovered((h) => ({ ...h, friendly: 0 }))}
            />
            <div className="h-px bg-[var(--outline-variant)]/20" />
            <StarRating
              label="Safe"
              value={ratings.safeRating}
              onChange={(v) => setRatings((r) => ({ ...r, safeRating: v }))}
              hovered={hovered.safe}
              onHover={(v) => setHovered((h) => ({ ...h, safe: v }))}
              onLeave={() => setHovered((h) => ({ ...h, safe: 0 }))}
            />
            <div className="h-px bg-[var(--outline-variant)]/20" />
            <StarRating
              label="Collaborative"
              value={ratings.collaborativeRating}
              onChange={(v) => setRatings((r) => ({ ...r, collaborativeRating: v }))}
              hovered={hovered.collaborative}
              onHover={(v) => setHovered((h) => ({ ...h, collaborative: v }))}
              onLeave={() => setHovered((h) => ({ ...h, collaborative: 0 }))}
            />
          </div>

          {/* Optional Comment */}
          <div className="mt-4">
            <label className="text-xs font-semibold text-[var(--on-surface-variant)] block mb-1.5">
              Comment <span className="font-normal opacity-60">(optional)</span>
            </label>
            <textarea
              value={ratings.comment}
              onChange={(e) => setRatings((r) => ({ ...r, comment: e.target.value }))}
              maxLength={300}
              rows={2}
              placeholder="Anything you'd like to share about this person…"
              className="w-full px-4 py-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/40 rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none transition-all"
            />
            <p className="text-right text-xs text-[var(--outline)] mt-1">{ratings.comment.length}/300</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-6 pb-20 sm:pb-6 pt-2 shrink-0 border-t border-[var(--outline-variant)]/20">
          <button
            onClick={handleSubmit}
            disabled={!allRated || mutation.isPending}
            className="w-full py-4 bg-[var(--primary)] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting…</span>
              </>
            ) : participants.length > 1 ? (
              <>
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Submit</span>
              </>
            )}
          </button>
          {!allRated && (
            <p className="text-center text-xs text-[var(--outline)] mt-2">
              Please rate all 4 dimensions to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
