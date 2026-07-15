import {
  Car,
  Calendar,
  BookOpen,
  Briefcase,
  Flame,
  Compass,
  MoreHorizontal,
  PartyPopper,
  Ban,
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import type { Category, NotificationType } from "@/types";

export interface CategoryCard {
  id: Category;
  name: string;
  desc: string;
  icon: LucideIcon;
}

export const CATEGORIES: readonly CategoryCard[] = [
  {
    id: "CARPOOLING",
    name: "Carpooling",
    icon: Car,
    desc: "Share rides and travel together",
  },
  {
    id: "EVENTS",
    name: "Events",
    icon: Calendar,
    desc: "Organize or attend local get-togethers",
  },
  {
    id: "STUDY",
    name: "Study Groups",
    icon: BookOpen,
    desc: "Find peers to learn and study with",
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    icon: Briefcase,
    desc: "Network and collaborate on projects",
  },
  {
    id: "SPORTS",
    name: "Sports",
    icon: Flame,
    desc: "Play games, practice, and stay active",
  },
  {
    id: "TRIPS",
    name: "Trips & Travel",
    icon: Compass,
    desc: "Explore new places with neighbors",
  },
  {
    id: "OTHER",
    name: "Other",
    icon: MoreHorizontal,
    desc: "Any other kind of collaboration",
  },
] as const;

export const CATEGORY_STYLES: Record<Category, string> = {
  CARPOOLING:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50",
  EVENTS:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/50",
  STUDY:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/50",
  PROFESSIONAL:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800/50",
  SPORTS:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50",
  TRIPS:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800/50",
  OTHER:
    "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]",
};

export const getCategoryStyles = (id?: Category) =>
  CATEGORY_STYLES[id as Category] ?? CATEGORY_STYLES.OTHER;

export const getCategoryIcon = (id?: Category): LucideIcon =>
  CATEGORIES.find((c) => c.id === id)?.icon ?? MoreHorizontal;

// ─── Notification type config ───────────────────────────────────────────────

interface NotificationConfig {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  cardBorder: string;
  actionLabel: string;
  getRedirectPath: (referenceId: string) => string;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  JOIN_REQUEST: {
    icon: Users,
    iconBg: "bg-[var(--primary)]/10",
    iconColor: "text-[var(--primary)]",
    cardBg: "bg-[var(--surface-container-low)]",
    cardBorder: "border-[var(--primary)]/20",
    actionLabel: "Review Request",
    getRedirectPath: (referenceId) =>
      `/dashboard/chats/requests`,
  },
  JOIN_APPROVED: {
    icon: CheckCircle,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    cardBg: "bg-emerald-50/40",
    cardBorder: "border-emerald-200/60",
    actionLabel: "View Chat",
    getRedirectPath: (referenceId) =>
      `/dashboard/chats/chat/${referenceId}`,
  },
  JOIN_REJECTED: {
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    cardBg: "bg-red-50/30",
    cardBorder: "border-red-200/50",
    actionLabel: "Browse Activities",
    getRedirectPath: () => `/dashboard`,
  },
  CHAT_CREATED: {
    icon: MessageCircle,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    cardBg: "bg-violet-50/30",
    cardBorder: "border-violet-200/50",
    actionLabel: "Open Chat",
    getRedirectPath: (referenceId) =>
      `/dashboard/chats/chat/${referenceId}`,
  },
  NEW_MESSAGE: {
    icon: MessageSquare,
    iconBg: "bg-[var(--surface-container-high)]",
    iconColor: "text-[var(--on-surface-variant)]",
    cardBg: "bg-[var(--card)]",
    cardBorder: "border-[var(--border)]",
    actionLabel: "Open Chat",
    getRedirectPath: (referenceId) =>
      `/dashboard/chats/chat/${referenceId}`,
  },
  COLLABORATION_COMPLETED: {
    icon: PartyPopper,
    iconBg: "bg-[var(--secondary)]/10",
    iconColor: "text-[var(--secondary)]",
    cardBg: "bg-orange-50/40",
    cardBorder: "border-orange-200/50",
    actionLabel: "Rate Participants",
    getRedirectPath: (referenceId) =>
      `/dashboard/chats/chat/${referenceId}`,
  },
  COLLABORATION_CANCELLED: {
    icon: Ban,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    cardBg: "bg-slate-50/50",
    cardBorder: "border-slate-200/50",
    actionLabel: "View Details",
    getRedirectPath: (referenceId) =>
      `/dashboard`,
  },
};