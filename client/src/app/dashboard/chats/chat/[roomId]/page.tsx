"use client";

import { use, useEffect, useRef, useState } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { chatApi } from "@/features/chats/chatApi";
import { collaborationApi } from "@/features/collaboration/api/collaborationApi";
import { CATEGORIES, getCategoryStyles } from "@/constants";
import toast from "react-hot-toast";
import Image from "next/image";
import { socket } from "@/services/socket";
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
  ChevronUp,
  Star,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalMessage {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    email?: string;
    onboardingCompleted?: boolean;
    bio?: string;
  };
  _optimistic?: boolean; // locally appended before server confirms
}

interface PageProps {
  params: Promise<{ roomId: string }>;
}

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
  const [optimisticMessages, setOptimisticMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  // ── Scroll to bottom when initial messages load or optimistic messages added ──

  const scrollToBottom = () =>
    setTimeout(() => {
      const el = messagesAreaRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);

  // ── Socket Connection & Handlers ────────────────────────────────────────────

  useEffect(() => {
    // Ensure we are connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join room
    socket.emit("join_room", { roomId });

    // Handle incoming message
    const handleNewMessage = (msg: LocalMessage) => {
      queryClient.setQueryData(["messages", roomId], (oldData: any) => {
        if (!oldData) return oldData;
        const pages = [...oldData.pages];
        if (pages.length === 0) return oldData;

        // Since server query lists are ordered DESC, the first page (index 0)
        // contains the newest messages. Prepend new message to this first page.
        const updatedFirstPage = {
          ...pages[0],
          data: [msg, ...(pages[0].data || [])],
        };

        return {
          ...oldData,
          pages: [updatedFirstPage, ...pages.slice(1)],
        };
      });

      scrollToBottom();
    };

    // Handle typing events
    const handleTyping = (data: { userId: string; name: string }) => {
      if (data.userId !== user?.id) {
        setTypingName(data.name);
        setIsTyping(true);
        scrollToBottom();
      }
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      // Leave room and clean up listeners
      socket.emit("leave_room", { roomId });
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId, queryClient, user?.id]);

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
  const members: any[] = collabData?.members ?? [];
  const memberCount = collabData?.currentMembers ?? room?.memberCount ?? 1;

  // ── Fetch messages (cursor-based, load older on scroll-up) ──────────────────

  const {
    data: messagesPages,
    isLoading: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", roomId],
    queryFn: ({ pageParam }) =>
      chatApi.getRoomMessages(roomId, { cursor: pageParam as string | undefined, limit: 30 }),
    initialPageParam: undefined as string | undefined,
    // Server returns newest-first (DESC). nextCursor = oldest message id in this page.
    // Passing that as cursor fetches messages even older than the current set.
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
  });

  // Pages arrive newest-first. To display chronologically (oldest at top):
  //   • Reverse the pages array so older pages come first
  //   • Reverse each page's data array (server returned DESC, we want ASC)
  const serverMessages: LocalMessage[] = [...(messagesPages?.pages ?? [])]
    .reverse()
    .flatMap((page: any) => [...(page.data ?? [])].reverse());

  // Merge server messages with optimistic ones (dedup by id)
  const serverIds = new Set(serverMessages.map((m) => m.id));
  const messages: LocalMessage[] = [
    ...serverMessages,
    ...optimisticMessages.filter((m) => !serverIds.has(m.id)),
  ];

  // ── Scroll chat widget into view on mount ────────────────────────────────────

  useEffect(() => {
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);



  // Scroll to bottom once on first load
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (!isMessagesLoading && !initialLoadDone.current) {
      initialLoadDone.current = true;
      scrollToBottom();
    }
  }, [isMessagesLoading]);

  // ── Load older messages on scroll-up ─────────────────────────────────────────

  const prevScrollHeight = useRef(0);

  const handleMessagesScroll = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    // When user scrolls near the top and there are older pages available
    if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      // Save scroll height before fetch so we can restore position after prepend
      prevScrollHeight.current = el.scrollHeight;
      fetchNextPage();
    }
  };

  // After older messages prepend, restore scroll position so view doesn't jump
  useEffect(() => {
    const el = messagesAreaRef.current;
    if (el && prevScrollHeight.current > 0) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    }
  }, [serverMessages.length]);

  // ── Typing Indicator ────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      socket.emit("typing_start", { roomId, name: user?.name });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      socket.emit("typing_stop", { roomId, name: user?.name });
    }, 1500);
  };

  // ── Send ─────────────────────────────────────────────────────────────────────

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !user) return;
    setInput("");

    // Reset typing state
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isCurrentlyTypingRef.current = false;
    socket.emit("typing_stop", { roomId });

    // Optimistically append the message locally
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: LocalMessage = {
      id: optimisticId,
      message: text,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name ?? "Me",
        username: user.username ?? "me",
        avatarUrl: user.avatarUrl,
      },
      _optimistic: true,
    };
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      await chatApi.sendMessage(roomId, { message: text });
      // Invalidate to pull the confirmed message from server (removes optimistic)
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } catch {
      toast.error("Failed to send message");
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    }
  };

  // ── Leave ────────────────────────────────────────────────────────────────────

  const handleLeave = async() => {
    await collaborationApi.leaveCollaboration(collabId as string);
    router.push("/dashboard/chats");
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
          {showLeaveConfirm ? (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-full border border-rose-200/50">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 pl-1">Leave?</span>
              <button
                onClick={handleLeave}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-bold transition-colors active:scale-95 cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[var(--on-surface)] dark:text-white rounded-full text-[10px] font-bold transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <>
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
                onClick={() => setShowLeaveConfirm(true)}
                title="Leave room"
                className="p-2 rounded-full hover:bg-rose-50 transition-colors text-[var(--outline)] hover:text-rose-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
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
                <Link href={`/dashboard/profile/${collab.creator.username}`} className="font-semibold underline text-[var(--on-surface)]">
                  {collab.creator.name}
                </Link>
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
              <Link href={`/dashboard/profile/${collab.creator.username}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors">
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
              </Link>
            )}
            {/* Other members */}
            {members
              .filter((m) => m.id !== collab?.creator?.id)
              .map((m) => (
                <Link href={`/dashboard/profile/${m.username}`} key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors">
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
                </Link>
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
      <div
        ref={messagesAreaRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-[var(--background)]"
      >
        {/* "Loading older messages" indicator at top */}
        {isFetchingNextPage && (
          <div className="flex justify-center pb-2">
            <span className="text-[11px] text-[var(--outline)] font-semibold flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
              Loading older messages
            </span>
          </div>
        )}

        {/* Initial load indicator */}
        {isMessagesLoading && (
          <div className="flex justify-center py-8">
            <div className="flex gap-1.5 items-center text-[var(--outline)] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isMessagesLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--surface-container-low)] border border-[var(--border)] flex items-center justify-center mb-4">
              <Compass className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <p className="font-bold text-[var(--on-surface)]">No messages yet</p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">Be the first to say something!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender.id === user?.id;
          const prevMsg = messages[idx - 1];
          const showSender =
            !isMe &&
            (!prevMsg || prevMsg.sender.id !== msg.sender.id);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] ${
                isMe ? "ml-auto" : "mr-auto"
              } ${msg._optimistic ? "opacity-70" : ""}`}
            >
              {showSender && (
                <span className="text-[11px] font-semibold text-[var(--outline)] mb-1 ml-3">
                  {msg.sender.name}
                </span>
              )}

              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words [word-break:break-word] whitespace-pre-wrap shadow-xs ${
                  isMe
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-sm"
                    : "bg-white dark:bg-[var(--card)] text-[var(--on-surface)] border border-[var(--border)] rounded-tl-sm"
                }`}
              >
                {msg.message}
              </div>

              <span
                className={`text-[10px] mt-1 text-[var(--outline)] font-medium italic ${
                  isMe ? "mr-2" : "ml-2"
                }`}
              >
                {isMe
                  ? `${msg._optimistic ? "Sending…" : "Sent"} · ${formatTime(new Date(msg.createdAt))}`
                  : formatTime(new Date(msg.createdAt))}
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
          onChange={handleInputChange}
          maxLength={300}
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
