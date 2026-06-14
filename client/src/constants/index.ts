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