"use client";

import { use, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { chatApi } from "@/features/chats/chatApi";
import { collaborationApi } from "@/features/collaboration/api/collaborationApi";
import { CATEGORIES, getCategoryStyles } from "@/constants";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  ArrowLeft,
  Info,
  X,
  MapPin,
  Calendar,
  Users,
  Send,
  LogOut,
  User,
  Compass,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  timestamp: Date;
  isSystem?: boolean;
}

interface PageProps {
  params: Promise<{ roomId: string }>;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const ME_ID = "me";

const SAMPLE_MESSAGES: MockMessage[] = [
  {
    id: "1",
    senderId: "aakarsh",
    senderName: "Aakarsh",
    text: "Hey guys, I've prepared some notes on Graph algorithms. Should we start with Dijkstra first tomorrow?",
    timestamp: new Date(Date.now() - 1000 * 60 * 40),
  },
  {
    id: "2",
    senderId: ME_ID,
    senderName: "Me",
    text: "That sounds great! I have some problems from LeetCode that we can solve together after the theory.",
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
  },
  {
    id: "3",
    senderId: "sneha",
    senderName: "Sneha",
    text: "I'll bring some snacks too! 🥨",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: "4",
    senderId: "sneha",
    senderName: "Sneha",
    text: "Also, does anyone have a spare charger? My laptop is dying.",
    timestamp: new Date(Date.now() - 1000 * 60 * 19),
  },
  {
    id: "sys-1",
    senderId: "system",
    senderName: "system",
    text: "Rahul joined the group",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isSystem: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (d: Date) =>
  d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const formatDate = (s?: string | null) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatRoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user } = useAuthStore();

  // UI state
  const [messages, setMessages] = useState<MockMessage[]>(SAMPLE_MESSAGES);
  const [input, setInput] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);

  // ── Data ────────────────────────────────────────────────────────────────────

  const { data: roomsData } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: chatApi.getChatRooms,
  });

  const room = roomsData?.data?.find((r) => r.roomId === roomId);
  const collabId = room?.collaboration?.id;

  const { data: collabData } = useQuery({
    queryKey: ["collab", collabId],
    queryFn: () => collaborationApi.getCollaborationDetails(collabId!),
    enabled: !!collabId,
  });

  const collab = collabData?.collaboration;
  const members = collabData?.members ?? [];
  const memberCount = collabData?.currentMembers ?? room?.memberCount ?? 1;

  // ── Scroll chat widget into view on mount ────────────────────────────────────

  useEffect(() => {
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // ── Scroll messages area to bottom (internally) ──────────────────────────────

  const scrollToBottom = () =>
    setTimeout(() => {
      const el = messagesAreaRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // ── Send ─────────────────────────────────────────────────────────────────────

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");

    const newMsg: MockMessage = {
      id: `msg-${Date.now()}`,
      senderId: ME_ID,
      senderName: user?.name ?? "Me",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Simulate a reply after 2s
    const bots = [
      { id: "aakarsh", name: "Aakarsh" },
      { id: "sneha", name: "Sneha" },
    ];
    const bot = bots[Math.floor(Math.random() * bots.length)];
    const replies = [
      "Sounds good! 👍",
      "I'll be there on time.",
      "Perfect, thanks for the heads up!",
      "Got it. See you then.",
      "Let's do it! Can't wait.",
    ];

    setTimeout(() => {
      setTypingName(bot.name);
      setIsTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            senderId: bot.id,
            senderName: bot.name,
            text: replies[Math.floor(Math.random() * replies.length)],
            timestamp: new Date(),
          },
        ]);
      }, 1800);
    }, 1200);
  };

  // ── Leave ────────────────────────────────────────────────────────────────────

  const handleLeave = () => {
    toast("Leave functionality coming soon!");
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const category = room?.collaboration?.category;
  const CategoryIcon = CATEGORIES.find((c) => c.id === category)?.icon ?? Compass;
  const styleClasses = getCategoryStyles(category);
  const title = room?.collaboration?.title ?? "Chat Room";

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col w-full max-w-3xl mx-auto bg-[var(--card)] rounded-2xl shadow-sm border border-[var(--surface-container-high)] overflow-hidden"
      style={{ height: isMobile ? "calc(100dvh - 120px)" : "calc(100dvh - 140px)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="px-4 py-3 flex items-center gap-3 border-b border-[var(--outline-variant)]/30 bg-[var(--card)] shrink-0">
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard/chats")}
          className="p-2 rounded-full hover:bg-[var(--surface-container-low)] transition-colors text-[var(--on-surface-variant)] active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {/* <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 flex items-center gap-1 ${styleClasses}`}
            >
              <CategoryIcon className="w-2.5 h-2.5" />
              {category?.toLowerCase() ?? "chat"}
            </span> */}
            <h1 className="font-bold text-[var(--on-surface)] text-base truncate">{title}</h1>
          </div>
          <p className="text-[var(--outline)] text-xs font-semibold">{memberCount} Members</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Members */}
          <button
            onClick={() => { setMembersOpen((v) => !v); setInfoOpen(false); }}
            title="Members"
            className="p-2 rounded-full hover:bg-[var(--surface-container-low)] transition-colors text-[var(--outline)] hover:text-[var(--primary)]"
          >
            <Users className="w-5 h-5" />
          </button>
          {/* Info */}
          <button
            onClick={() => { setInfoOpen((v) => !v); setMembersOpen(false); }}
            title="Collaboration info"
            className={`p-2 rounded-full hover:bg-[var(--surface-container-low)] transition-colors hover:text-[var(--primary)] ${
              infoOpen ? "text-[var(--primary)]" : "text-[var(--outline)]"
            }`}
          >
            <Info className="w-5 h-5" />
          </button>
          {/* Leave */}
          <button
            onClick={handleLeave}
            title="Leave room"
            className="p-2 rounded-full hover:bg-rose-50 transition-colors text-[var(--outline)] hover:text-rose-600"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Collaboration Info Panel (inline collapsible) ─────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)] ${
          infoOpen ? "max-h-[400px]" : "max-h-0 border-none"
        }`}
      >
        <div className="p-4 space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${styleClasses}`}>
                <CategoryIcon className="w-3 h-3" />
                {category?.toLowerCase()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                collab?.status === "OPEN"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}>
                {collab?.status ?? "—"}
              </span>
            </div>
            <button
              onClick={() => setInfoOpen(false)}
              className="text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors shrink-0 p-1 rounded-full"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

        <div>
            <p className={`font-body-md text-sm text-[var(--on-surface-variant)] break-words [overflow-wrap:anywhere] ${isExpanded ? "" : "line-clamp-3"}`}>
            {collab?.description}
            </p>
            {collab?.description && collab?.description.length > 140 && (
            <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className={`text-xs font-semibold text-[var(--primary)] hover:underline mt-1 disabled`}
                
            >
                {isExpanded ? "View less" : "View more"}
            </button>
            )}
        </div>

          {/* {collab?.description && (
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed line-clamp-3">
              {collab.description}
            </p>
          )} */}

          {/* Creator */}
          {collab?.creator && (
            <div className="flex items-center gap-2">
              {collab.creator.avatarUrl ? (
                <Image
                  src={collab.creator.avatarUrl}
                  alt={collab.creator.name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover border border-[var(--border)]"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--surface-container)] flex items-center justify-center border border-[var(--border)]">
                  <User className="w-3 h-3 text-[var(--outline)]" />
                </div>
              )}
              <span className="text-xs text-[var(--on-surface-variant)]">
                Created by{" "}
                <span className="font-semibold text-[var(--on-surface)]">
                  {collab.creator.name}
                </span>
              </span>
            </div>
          )}

          {/* Route */}
          <div className="bg-white dark:bg-[var(--card)] rounded-xl p-3 border border-[var(--border)]/50 flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 shrink-0 self-stretch pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
              <div className="w-px flex-1 border-l-2 border-dashed border-[var(--outline-variant)]" />
              <MapPin className="w-3.5 h-3.5 text-[var(--secondary)]" />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-xs font-medium text-[var(--on-surface)] truncate">
                {collab?.fromLocation?.name ?? "Starting Point"}
              </span>
              <span className="text-xs font-medium text-[var(--on-surface)] truncate">
                {collab?.toLocation?.name ?? "Destination"}
              </span>
            </div>
          </div>

          {/* Details row */}
          <div className="flex flex-wrap gap-4 text-xs text-[var(--outline)] font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDate(collab?.scheduledAt ?? room?.collaboration?.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--primary)]">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{memberCount} / {collab?.maxMembers ?? "?"} Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Members Panel (inline collapsible) ───────────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)] ${
          membersOpen ? "max-h-72" : "max-h-0 border-none"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[var(--on-surface)] text-sm">Members ({memberCount})</h3>
            <button
              onClick={() => setMembersOpen(false)}
              className="text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-44 pr-1">
            {/* Creator */}
            {collab?.creator && (
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors">
                {collab.creator.avatarUrl ? (
                  <Image
                    src={collab.creator.avatarUrl}
                    alt={collab.creator.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover border border-[var(--border)]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--surface-container)] flex items-center justify-center border border-[var(--border)]">
                    <User className="w-4 h-4 text-[var(--outline)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{collab.creator.name}</p>
                  <p className="text-xs text-[var(--outline)]">@{collab.creator.username} · Creator</p>
                </div>
                <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              </div>
            )}
            {/* Other members */}
            {members
              .filter((m) => m.id !== collab?.creator?.id)
              .map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors">
                  {m.avatarUrl ? (
                    <Image
                      src={m.avatarUrl}
                      alt={m.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--surface-container)] flex items-center justify-center border border-[var(--border)]">
                      <User className="w-4 h-4 text-[var(--outline)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{m.name}</p>
                    <p className="text-xs text-[var(--outline)]">@{m.username}</p>
                  </div>
                </div>
              ))}
            {/* Placeholder members when no API data yet */}
            {!collab && (
              <>
                {["Aakarsh", "Sneha", "Rahul"].map((name) => (
                  <div key={name} className="flex items-center gap-3 p-2 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-[var(--surface-container)] flex items-center justify-center border border-[var(--border)]">
                      <User className="w-4 h-4 text-[var(--outline)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--on-surface)]">{name}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── collab? Summary Strip ───────────────────────────────────────── */}
      {!infoOpen && !membersOpen && (
        <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)] shrink-0 select-none">
          <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] font-medium min-w-0">
            <MapPin className="text-[var(--primary)] w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {collab?.fromLocation?.name ?? "Starting Point"} → {collab?.toLocation?.name ?? "Destination"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[var(--outline)] shrink-0">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(collab?.scheduledAt ?? room?.collaboration?.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--primary)]">
              <Users className="w-3.5 h-3.5" />
              <span>{memberCount} / {collab?.maxMembers ?? "?"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages Area ────────────────────────────────────────────────── */}
      <div ref={messagesAreaRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-[var(--background)]">
        {messages.map((msg, idx) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--outline)] bg-[var(--surface-container)] px-3 py-1 rounded-full border border-[var(--border)]/40">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.senderId === ME_ID;
          const prevMsg = messages[idx - 1];
          const showSender =
            !isMe &&
            (!prevMsg || prevMsg.isSystem || prevMsg.senderId !== msg.senderId);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] ${
                isMe ? "ml-auto" : "mr-auto"
              }`}
            >
              {showSender && (
                <span className="text-[11px] font-semibold text-[var(--outline)] mb-1 ml-3">
                  {msg.senderName}
                </span>
              )}

              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words [overflow-wrap:anywhere] shadow-xs ${
                  isMe
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-sm"
                    : "bg-white dark:bg-[var(--card)] text-[var(--on-surface)] border border-[var(--border)] rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>

              <span
                className={`text-[10px] mt-1 text-[var(--outline)] font-medium italic ${
                  isMe ? "mr-2" : "ml-2"
                }`}
              >
                {isMe ? `Sent · ${formatTime(msg.timestamp)}` : formatTime(msg.timestamp)}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 px-3.5 py-2.5 bg-white dark:bg-[var(--card)] border border-[var(--border)] rounded-full shadow-xs items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-[var(--outline)] font-semibold">{typingName} is typing...</span>
          </div>
        )}
      </div>

      {/* ── Composer ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3 bg-[var(--card)] border-t border-[var(--outline-variant)]/30 flex items-center gap-3 shrink-0"
      >
        <input
          className="flex-1 bg-[var(--surface-container-low)] border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-[var(--foreground)] placeholder:text-[var(--outline)]"
          placeholder="Type a message..."
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-[var(--primary)] text-[var(--primary-foreground)] p-3 rounded-full hover:shadow-md active:scale-90 transition-all flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
