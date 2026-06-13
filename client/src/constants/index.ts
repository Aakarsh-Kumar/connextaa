export const CATEGORIES = [
  "CARPOOLING",
  "EVENTS",
  "STUDY",
  "PROFESSIONAL",
  "SPORTS",
  "TRIPS",
  "OTHER"
] as const;

export type Category = (typeof CATEGORIES)[number];
