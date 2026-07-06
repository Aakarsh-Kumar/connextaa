"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  type Notification,
} from "@/types/index";

import {
  notificationsApi,
} from "@/features/notifications/api/notificationsApi";
import {
  Bell,
  CheckCheck,
  Loader2,
  BellOff,
  ArrowRight,
} from "lucide-react";
import { NOTIFICATION_CONFIG } from "@/constants";

// ─── Relative time helper (no date-fns needed) ────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfThisWeek = new Date(startOfToday);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfThisWeek) return "This Week";
  return "Earlier";
}

function groupNotificationsByDate(
  notifications: Notification[]
): { label: string; items: Notification[] }[] {
  const groupMap: Record<string, Notification[]> = {};
  const groupOrder: string[] = [];

  for (const n of notifications) {
    const label = getDateGroupLabel(n.createdAt);
    if (!groupMap[label]) {
      groupMap[label] = [];
      groupOrder.push(label);
    }
    groupMap[label].push(n);
  }

  return groupOrder.map((label) => ({ label, items: groupMap[label] }));
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  onRead,
  onClick,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;

  const timeAgo = formatRelativeTime(notification.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => e.key === "Enter" && onClick(notification)}
      className={`
        relative flex gap-4 p-4 rounded-2xl border cursor-pointer
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]
        ${config.cardBg} ${config.cardBorder}
        ${!notification.isRead ? "shadow-sm" : "opacity-80"}
      `}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
      )}

      {/* Icon */}
      <div
        className={`
          shrink-0 w-11 h-11 rounded-full flex items-center justify-center
          ${config.iconBg}
        `}
      >
        <Icon className={`w-5 h-5 ${config.iconColor}`} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p
            className={`text-sm font-semibold leading-snug text-[var(--on-surface)] ${
              !notification.isRead ? "font-bold" : ""
            }`}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-[var(--on-surface-variant)] whitespace-nowrap mt-0.5">
            {timeAgo}
          </span>
        </div>

        <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed line-clamp-2 mb-3">
          {notification.body}
        </p>

        {/* Action row */}
        <div className="flex items-center justify-between">
          <span
            className={`
              inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
              border transition-colors
              ${
                notification.type === "COLLABORATION_COMPLETED"
                  ? "bg-[var(--secondary)] text-white border-transparent"
                  : notification.type === "JOIN_REQUEST"
                  ? "bg-[var(--primary)] text-white border-transparent"
                  : "bg-[var(--card)] text-[var(--on-surface)] border-[var(--border)]"
              }
            `}
          >
            {config.actionLabel}
            <ArrowRight className="w-3 h-3" />
          </span>

          {/* Mark as read button */}
          {!notification.isRead && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification.id);
              }}
              className="text-xs text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] animate-pulse">
      <div className="w-11 h-11 rounded-full bg-[var(--surface-container-high)] shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-[var(--surface-container-high)] rounded-full w-3/4" />
        <div className="h-3 bg-[var(--surface-container-high)] rounded-full w-full" />
        <div className="h-3 bg-[var(--surface-container-high)] rounded-full w-2/3" />
        <div className="h-7 bg-[var(--surface-container-high)] rounded-full w-28 mt-1" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-[var(--surface-container-low)] flex items-center justify-center">
        <BellOff className="w-9 h-9 text-[var(--outline-variant)]" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-headline-md text-headline-md text-[var(--on-surface)]">
          All caught up!
        </h3>
        <p className="text-sm text-[var(--on-surface-variant)] max-w-xs">
          You have no notifications right now. We will let you know when something
          happens.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const observerRef = useRef<HTMLDivElement | null>(null);

  // ── Infinite query ────────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      notificationsApi.getNotifications({
        cursor: pageParam as string | undefined,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const notifications = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  // ── Intersection observer for infinite scroll ─────────────────────────────
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: markRead } = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ["notifications"],
        (old: typeof data) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              ),
            })),
          };
        }
      );
    },
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.setQueryData(
        ["notifications"],
        (old: typeof data) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((n) => ({ ...n, isRead: true })),
            })),
          };
        }
      );
    },
  });

  // ── Navigation on click ───────────────────────────────────────────────────
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) markRead(notification.id);
      const config = NOTIFICATION_CONFIG[notification.type];
      router.push(config.getRedirectPath(notification.referenceId));
    },
    [markRead, router]
  );

  // ── Derived state ─────────────────────────────────────────────────────────
  const hasUnread = notifications.some((n) => !n.isRead);
  const groups = groupNotificationsByDate(notifications);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1
            className={
              isMobile
                ? "font-headline-lg-mobile text-headline-lg-mobile text-on-surface"
                : "font-headline-lg text-headline-lg text-on-surface"
            }
          >
            Alerts
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            Stay updated with your collaborations and conversations.
          </p>
        </div>

        {/* Mark all read button */}
        {hasUnread && !isLoading && (
          <button
            type="button"
            onClick={() => markAllRead()}
            disabled={markingAll}
            className="shrink-0 mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-3 py-2 rounded-xl hover:bg-[var(--primary)]/10 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {markingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        )}
      </header>

      {/* ── Loading skeleton ────────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <Bell className="w-10 h-10 text-[var(--destructive)]/60" />
          <p className="text-sm text-[var(--on-surface-variant)]">
            Failed to load notifications. Please try again.
          </p>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!isLoading && !isError && notifications.length === 0 && <EmptyState />}

      {/* ── Notification groups ─────────────────────────────────────────── */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label} className="space-y-3">
              {/* Group label */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-high)] px-2 py-0.5 rounded-full">
                  {group.items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5">
                {group.items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onRead={markRead}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* ── Infinite scroll observer ──────────────────────────────── */}
          <div ref={observerRef} className="h-4" />

          {/* Loading more */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
            </div>
          )}

          {/* End of list */}
          {!hasNextPage && notifications.length > 0 && (
            <p className="text-center text-xs text-[var(--on-surface-variant)] py-4">
              You have seen all your notifications.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
