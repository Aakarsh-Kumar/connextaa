"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants";
import type { Category } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/store/authStore";
import {collaborationApi} from "@/features/collaboration/api/collaborationApi";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  CalendarDays,
  Users,
  FileText,
  Sparkles,
  SendHorizonal,
  Minus,
  Plus,
  Eye,
  Loader2,
} from "lucide-react";
import { ActivityCard } from "@/components/dashboard/ActivityCard";

// ── Types ────────────────────────────────────────────────────────────────────

type LocationValue = {
  name: string;
  lat: number;
  lng: number;
} | null;

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

// ── Location Autocomplete Input ───────────────────────────────────────────────

type LocationInputProps = {
  id: string;
  label: string;
  placeholder: string;
  value: LocationValue;
  onChange: (val: LocationValue) => void;
  icon: React.ReactNode;
};

function LocationInput({ id, label, placeholder, value, onChange }: LocationInputProps) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=IN&featurecodes=adm1,adm2,ADM3,ADM4,ADM5`,
        { headers: { "Accept-Language": "en", "User-Agent": "Connectify/1.0" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    onChange(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    setQuery(result.display_name);
    onChange({
      name: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="flex-1 relative">
      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-0.5" htmlFor={id}>
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full bg-transparent border-none p-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-0 pr-5"
        />
        {loading && <Loader2 className="absolute right-0 w-4 h-4 text-on-surface-variant animate-spin" />}
        {value && !loading && <span className="absolute right-0 w-2 h-2 rounded-full bg-primary" title="Location confirmed" />}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-2 bg-card border border-outline-variant/40 rounded-xl shadow-lg overflow-hidden">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 font-body-md text-body-md text-on-surface hover:bg-surface-container transition-colors border-b border-outline-variant/20 last:border-0"
              >
                <span className="block font-medium text-sm text-on-surface truncate">
                  {r.display_name.split(",")[0]}
                </span>
                <span className="block text-xs text-on-surface-variant truncate mt-0.5">
                  {r.display_name.split(",").slice(1, 3).join(",")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CreateCollaborationPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const user = useAuthStore((state) => state.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("CARPOOLING");
  const [fromLocation, setFromLocation] = useState<LocationValue>(null);
  const [toLocation, setToLocation] = useState<LocationValue>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const selectedCat = CATEGORIES.find((c) => c.id === category);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const nowTimeStr = now.toTimeString().slice(0, 5);
  const minTime = date === todayStr ? nowTimeStr : undefined;

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in the title and description");
      return;
    }
    if (!fromLocation) {
      toast.error("Please select a starting location from the suggestions");
      return;
    }
    if (!toLocation) {
      toast.error("Please select a destination from the suggestions");
      return;
    }
    if (!date || !time) {
      toast.error("Please set a date and time");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        title,
        description,
        fromLocation,
        toLocation,
        scheduledAt: new Date(`${date}T${time}`).toISOString(),
        maxMembers,
      };
      console.log("Payload:", payload);
      
      const res = await collaborationApi.createCollaboration(payload);
      toast.success("Collaboration created successfully!");
      router.push(`/dashboard/chats/chat/${res.chatRoomId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-40 md:pb-8 space-y-6">

      {/* ── Page Header ── */}
      <header className="mb-stack-lg">
        <div className="flex items-center gap-3">
          {/* <Link
            href="/dashboard"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </Link> */}
          <div>
            <h1 className={isMobile
              ? "font-headline-lg-mobile text-headline-lg-mobile text-on-surface"
              : "font-headline-lg text-headline-lg text-on-surface"
            }>
              Create Activity
            </h1>
            <p className="text-on-surface-variant font-body-md mt-0.5">
              Post an opportunity and find people to work with.
            </p>
          </div>
        </div>
      </header>

      {/* ── Form sections ── */}
      <div className="space-y-4">

        {/* Section 1: What are you planning? */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">What are you planning?</h2>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="title">
                Activity Title
              </label>
              <span className={`font-label-sm text-label-sm tabular-nums ${title.length > 30 ? title.length >= 40 ? "text-error" : "text-warning" : "text-on-surface-variant/40"}`}>
                {title.length}/40
              </span>
            </div>
            <input
              id="title"
              type="text"
              maxLength={40}
              placeholder="e.g. Morning Neighborhood Run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full h-14 px-4 bg-background border rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 transition-all ${
                title.length >= 40
                  ? "border-error focus:border-error focus:ring-error/10"
                  : "border-outline-variant focus:border-primary focus:ring-primary/10"
              }`}
            />
          </div>
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Category
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
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
                          ? "bg-primary-container/20 text-on-primary-container border-primary"
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
        </section>

        {/* Section 2: Description */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Tell people more</h2>
          </div>
          <div className="space-y-1.5">
  <div className="flex items-center justify-between">
    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="description">
      Description
    </label>
    <span className={`font-label-sm text-label-sm tabular-nums ${description.length > 225 ? description.length >= 250 ? "text-error" : "text-warning" : "text-on-surface-variant/40"}`}>
      {description.length}/250
    </span>
  </div>
  <textarea
    id="description"
    rows={4}
    maxLength={250}
    placeholder="Describe the vibe, what people should bring, or any specific details..."
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className={`w-full px-4 py-3 bg-background border rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 transition-all resize-none ${
      description.length >= 250
        ? "border-error focus:border-error focus:ring-error/10"
        : "border-outline-variant focus:border-primary focus:ring-primary/10"
    }`}
  />
</div>
        </section>

        {/* Section 3: Location */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Location &amp; Route</h2>
          </div>
          <div className="space-y-3 relative">
            <div className="absolute left-6 top-10 bottom-10 border-l-2 border-dotted border-outline-variant pointer-events-none" />
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 z-10">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <LocationInput
                id="from"
                label="Starting from"
                placeholder="Central Park Entrance"
                value={fromLocation}
                onChange={setFromLocation}
                icon={<Navigation />}
              />
            </div>
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 z-10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <LocationInput
                id="to"
                label="Heading to"
                placeholder="The Local Coffee House"
                value={toLocation}
                onChange={setToLocation}
                icon={<MapPin />}
              />
            </div>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant/60">
            Type at least 3 characters and select a result to confirm the location.
          </p>
        </section>

        {/* Section 4: Schedule */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Schedule</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 px-4 bg-background border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                min={minTime}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-14 px-4 bg-background border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Members */}
        <section className="bg-card border border-outline-variant/30 rounded-2xl p-6 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-headline-md text-headline-md text-on-surface">Members</h2>
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
                onClick={() => setMaxMembers((v) => Math.min(30, v + 1))}
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

        {/* Live Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Eye className="w-4 h-4 text-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Live Preview</h2>
          </div>
          {/* <LivePreviewCard
            selectedCat={selectedCat}
            title={title}
            date={date}
            description={description}
            fromLocation={fromLocation}
            toLocation={toLocation}
            maxMembers={maxMembers}
            createdBy={user?.name || "You"}
          /> */}
          <ActivityCard
            key={"preview"}
            activity={{
            "id": "preview",
            "category": selectedCat?.id || "STUDY",
            "title": title || "Title",
            "description": description || "Description",
            "scheduledAt": date + "T" + time,
            "status": "OPEN",
            "currentMembers": 1,
            "maxMembers": maxMembers,
            "distanceMeters": 1500,
            "creator": {
              "id": user?.id || "",
              "email": user?.email || "",
              "name": user?.name || "You",
              "onboardingCompleted": true,
              "username": user?.username || "username",
              "avatarUrl": user?.avatarUrl || "",
              "bio": "bio"
            },
            "rating":4.8,
            "fromLocation": {
              "name": fromLocation?.name || "Location A",
              "lat": fromLocation?.lat || 0,
              "lng": fromLocation?.lng || 0
            },
            "toLocation": {
              "name": toLocation?.name || "Location B",
              "lat": toLocation?.lat || 0,
              "lng": toLocation?.lng || 0
            }}}
            pendingRequests={[]}
          />
        </div>

        {/* Desktop submit */}
        {!isMobile && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-label-md text-label-md rounded-xl card-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 text-base font-semibold"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
            <span>{submitting ? "Creating..." : "Create Activity"}</span>
          </button>
        )}
      </div>

      {/* ── Mobile sticky CTA ── */}
      {isMobile && (
        <div className="fixed bottom-16 left-0 right-0 px-4 z-40">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg shadow-primary/20"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
            <span>{submitting ? "Creating..." : "Create Activity"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// // ── Live Preview Card ─────────────────────────────────────────────────────────

// type LivePreviewCardProps = {
//   selectedCat: { icon: React.ElementType; name: string } | undefined;
//   title: string;
//   date: string;
//   description: string;
//   fromLocation: LocationValue;
//   toLocation: LocationValue;
//   maxMembers: number;
//   createdBy: string;
// };

// function LivePreviewCard({
//   selectedCat,
//   title,
//   date,
//   description,
//   fromLocation,
//   toLocation,
//   maxMembers,
//   createdBy,
// }: LivePreviewCardProps) {
//   const avatarColors = ["bg-blue-400", "bg-green-400", "bg-orange-400", "bg-purple-400"];
//   const visibleAvatars = avatarColors.slice(0, Math.min(2, maxMembers));
//   const overflow = Math.max(0, maxMembers - 2);

//   const displayDate = date
//     ? new Date(date).toLocaleDateString("en-US", {year:"2-digit", month: "short", day: "numeric" })
//     : "Date TBD";

//   return (
//     <div className="bg-surface-container-low rounded-[24px] p-6 border border-outline-variant/10 card-shadow transition-all group">

//       {/* Top Row: Category Chip + Avatars */}
//       <div className="flex justify-between items-start mb-4">
//         <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
//           {selectedCat && <selectedCat.icon className="w-3 h-3" />}
//           <span>{selectedCat?.name || "Category"}</span>
//         </span>
//         <div className="flex -space-x-2">
//           {visibleAvatars.map((color, i) => (
//             <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${color}`} />
//           ))}
//           {overflow > 0 && (
//             <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
//               +{overflow}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Created by */}
//       <p className="font-label-sm text-label-sm text-on-surface-variant/60 mb-2">
//         by{" "}
//         <span className="text-on-surface font-semibold">
//           {createdBy || "You"}
//         </span>
//       </p>

//       {/* Title */}
//       <h3 className="font-headline-md text-on-surface mb-2 group-hover:text-primary transition-colors text-lg font-bold break-words">
//         {title || <span className="text-on-surface-variant/40">Activity Title</span>}
//       </h3>

//       {/* Description */}
//       <p className="text-on-surface-variant font-body-md text-body-md mb-6 min-h-[2.5rem] break-words">
//         {description || <span className="text-on-surface-variant/40">Your description will appear here…</span>}
//       </p>

//       {/* Location & Date */}
//   {/* Location & Date */}
// <div className="flex flex-col gap-1.5 mb-6">
//   <div className="flex items-center gap-1 text-on-surface-variant">
//     <Navigation className="w-3.5 h-3.5 shrink-0" />
//     <span className="font-label-sm text-label-sm">
//       {fromLocation?.name || <span className="text-on-surface-variant/40">Starting point</span>}
//     </span>
//   </div>
//   <div className="flex items-center gap-1 text-on-surface-variant">
//     <MapPin className="w-3.5 h-3.5 shrink-0" />
//     <span className="font-label-sm text-label-sm">
//       {toLocation?.name || <span className="text-on-surface-variant/40">Destination</span>}
//     </span>
//   </div>
//   <div className="flex items-center gap-1 text-on-surface-variant mt-0.5">
//     <CalendarDays className="w-3.5 h-3.5 shrink-0" />
//     <span className="font-label-sm text-label-sm">{displayDate}</span>
//   </div>
// </div>

//       {/* CTA Button */}
//       <button
//         type="button"
//         disabled
//         className="w-full py-3 bg-popover text-primary-foreground rounded-[16px] font-bold opacity-60 cursor-default"
//       >
//         Request to Join
//       </button>
//     </div>
//   );
// }