import {
  Car,
  Calendar,
  BookOpen,
  Briefcase,
  Flame,
  Compass,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/types";

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