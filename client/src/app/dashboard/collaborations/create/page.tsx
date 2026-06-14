"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants";
import type { Category } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  CalendarDays,
  Clock,
  Users,
  FileText,
  Sparkles,
  SendHorizonal,
  Minus,
  Plus,
  Eye,
} from "lucide-react";

export default function CreateCollaborationPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("CARPOOLING");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const selectedCat = CATEGORIES.find((c) => c.id === category);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in the title and description");
      return;
    }
    if (!fromLocation.trim() || !toLocation.trim()) {
      toast.error("Please fill in both locations");
      return;
    }
    if (!date || !time) {
      toast.error("Please set a date and time");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: wire up API call
      toast.success("Collaboration created successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to create collaboration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40 md:pb-8">

      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant/40 px-4 h-16 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </Link>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Create Activity
          </h1>
        </div>
        <div className="w-10" />
      </header>

      <main className="px-4 md:px-6 py-6 max-w-2xl mx-auto space-y-4">

        {/* Section 1: What are you planning? */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              What are you planning?
            </h2>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="title">
                Activity Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Morning Neighborhood Run"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-14 px-4 bg-background border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Category pills */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Category
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border font-label-md text-label-md whitespace-nowrap transition-all active:scale-95 ${
                        isSelected
                          ? "bg-primary-container/30 text-on-primary-container border-primary"
                          : "bg-background text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Tell people more */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Tell people more
            </h2>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the vibe, what people should bring, or any specific details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
            />
          </div>
        </section>

        {/* Section 3: Location & Route */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Location &amp; Route
            </h2>
          </div>

          <div className="space-y-3 relative">
            {/* Dotted connector line */}
            <div className="absolute left-6 top-10 bottom-10 border-l-2 border-dotted border-outline-variant pointer-events-none" />

            {/* From */}
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 z-10">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1" htmlFor="from">
                  Starting from
                </label>
                <input
                  id="from"
                  type="text"
                  placeholder="Central Park Entrance"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full bg-transparent border-none p-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* To */}
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 z-10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1" htmlFor="to">
                  Heading to
                </label>
                <input
                  id="to"
                  type="text"
                  placeholder="The Local Coffee House"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full bg-transparent border-none p-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Schedule */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Schedule
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="date">
                Date
              </label>
              <div className="relative">
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 px-4 bg-background border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="time">
                Time
              </label>
              <div className="relative">
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-14 px-4 bg-background border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Members */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary fill-primary" />
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Members
              </h2>
            </div>
            <div className="flex items-center bg-surface-container px-2 py-1 rounded-full gap-1">
              <button
                type="button"
                onClick={() => setMaxMembers((v) => Math.max(2, v - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4 text-on-surface" />
              </button>
              <span className="w-12 text-center font-headline-md text-headline-md text-on-surface">
                {maxMembers}
              </span>
              <button
                type="button"
                onClick={() => setMaxMembers((v) => Math.min(50, v + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4 text-on-surface" />
              </button>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            How many people can join this activity?
          </p>
        </section>

        {/* Section 6: Live Preview */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Live Preview
            </h2>
          </div>

          <div className="bg-card border border-outline-variant/30 rounded-2xl overflow-hidden card-shadow">
            <div className="relative h-40 bg-surface-container">
              {/* Category badge */}
              <div className="absolute top-4 left-4 bg-primary-container/90 backdrop-blur-sm px-3 py-1 rounded-full text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1.5">
                {selectedCat && <selectedCat.icon className="w-3 h-3" />}
                {selectedCat?.name || "Category"}
              </div>
              {/* Placeholder map-like gradient */}
              <div className="w-full h-full bg-gradient-to-br from-surface-container via-primary-container/10 to-surface-container-low flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary/20" />
              </div>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {title || "Activity Title"}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="font-label-md text-label-md">
                    {date || "Date"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-label-md text-label-md">
                    {time || "Time"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-label-md text-label-md">
                    {maxMembers} spots
                  </span>
                </div>
              </div>
              {description && (
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                  {description}
                </p>
              )}
              {(fromLocation || toLocation) && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Navigation className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-label-sm text-label-sm truncate">
                    {fromLocation || "From"} → {toLocation || "To"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Desktop Submit */}
        <div className="hidden md:block pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-primary hover:bg-on-primary-container text-white font-headline-md text-headline-md rounded-xl card-shadow active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <span>{submitting ? "Creating..." : "Create Activity"}</span>
            <SendHorizonal className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Mobile Sticky Bottom CTA — sits above the bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 px-4 z-40 md:hidden">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 bg-primary text-white font-headline-md text-headline-md rounded-xl card-shadow active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg shadow-primary/20"
        >
          <span>{submitting ? "Creating..." : "Create Activity"}</span>
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
