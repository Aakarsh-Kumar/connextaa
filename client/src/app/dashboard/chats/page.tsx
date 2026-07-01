"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryIcon, getCategoryStyles } from "@/constants";
import { LucideMessageSquare, ArrowRightIcon, LucideUser, Search } from "lucide-react";
import { chatApi } from "@/features/chats/chatApi";
import { useRouter } from "next/navigation";
import { usePermissionStore } from "@/store/permissionStore";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

export default function ChatsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const notificationPermission = usePermissionStore((state) => state.notificationPermission);
  const setNotificationPermission = usePermissionStore((state) => state.setNotificationPermission);

  const handleRequestNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Notifications are not supported by this browser.");
      return;
    }

    if (Notification.permission === "denied") {
      toast.error(
        "Notifications are blocked in your settings. Please enable them in site configurations.",
        { duration: 5000 }
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationPermission("granted");
        toast.success("Notifications enabled successfully!");
      } else {
        setNotificationPermission(permission as any);
        toast.error("Notification permission denied.");
      }
    } catch (err) {
      toast.error("Failed to request notifications.");
    }
  };

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: chatApi.getChatRooms,
  });

  const handleChatClick = (roomId: string) => {
    router.push(`/dashboard/chats/chat/${roomId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-on-surface-variant font-body-lg">
        Loading chats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-20 text-error font-body-lg">
        Error loading chats.
      </div>
    );
  }

  const chatRoomsList = [...(response?.data ?? [])].sort(
    (a, b) =>
      new Date(a.collaboration.scheduledAt as string).getTime() -
      new Date(b.collaboration.scheduledAt as string).getTime()
  );

  if (chatRoomsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LucideMessageSquare className="text-[50px] text-outline-variant mb-4" />
        <p className="text-on-surface-variant font-body-lg">
          No chat rooms found. Join a collaboration to start chatting!
        </p>
      </div>
    );
  }

  const filteredChatRooms = chatRoomsList.filter((room) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      room.collaboration.title.toLowerCase().includes(query) ||
      room.collaboration.category.toLowerCase().includes(query) ||
      room.lastMessage?.toLowerCase().includes(query) ||
      room.lastMessageSenderName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Contextual Notification Permission Banner */}
      {notificationPermission !== "granted" && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-on-surface">
                Enable notifications to receive new messages.
              </p>
              <p className="text-xs text-on-surface-variant">
                Never miss instant messages from your activity partners.
              </p>
            </div>
          </div>
          <button
            onClick={handleRequestNotifications}
            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-amber-600 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            {notificationPermission === "denied" ? "How to Enable" : "Enable Notifications"}
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--outline)] group-focus-within:text-[var(--primary)] transition-colors" />
        <input
          className="w-full pl-12 pr-4 py-3 bg-[var(--surface-container-low)] border-none rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-body-md text-[var(--foreground)] placeholder:text-[var(--outline)]"
          placeholder="Search chats by title, message, or sender..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4" id="content-chats">
        {filteredChatRooms.length > 0 ? (
          filteredChatRooms.map((room) => {
            const CategoryIcon = getCategoryIcon(room.collaboration.category);
            const styleClasses = getCategoryStyles(room.collaboration.category);
            const lastSender = room.lastMessageSenderName;
            const lastMsg = room.lastMessage;

            const timeString = room.unreadCount > 0 
              ? `${room.unreadCount} unread` 
              : new Date(room.collaboration.scheduledAt as string).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });

            return (
              <div
                key={room.roomId}
                onClick={() => handleChatClick(room.roomId)}
                className={`bg-card rounded-lg card-elevation flex items-center border border-transparent hover:border-primary/20 cursor-pointer ${
                  isMobile ? "p-4 gap-3" : "p-5 gap-6"
                }`}
              >
                {/* Left Icon (Styled using category colors) */}
                <div
                  className={`rounded-2xl flex items-center justify-center shrink-0 border ${styleClasses} ${
                    isMobile ? "w-12 h-12" : "w-16 h-16"
                  }`}
                >
                  <CategoryIcon className={isMobile ? "w-5.5 h-5.5" : "w-8 h-8"} />
                </div>

                {/* Middle Details */}
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center mb-1 ${isMobile ? "gap-2" : "gap-3"}`}>
                    {/* <span
                      className={`px-3 py-0.5 rounded-full text-label-sm font-bold shrink-0 border uppercase tracking-wider text-[10px] ${styleClasses}`}
                    >
                      {room.collaboration.category.toLowerCase()}
                    </span> */}
                    <h3
                      className={`font-headline-md font-bold text-on-surface truncate ${
                        isMobile ? "text-base" : "text-body-lg"
                      }`}
                    >
                      {room.collaboration.title}
                    </h3>
                  </div>
                  <p className="text-on-surface-variant text-body-md truncate max-w-[90%] md:max-w-md">
                    {lastSender ? (
                      <>
                        <span className="font-bold text-on-surface">{lastSender}:</span>{" "}
                        {lastMsg}
                      </>
                    ) : (
                      <span className="italic text-outline">No messages yet.</span>
                    )}
                  </p>
                </div>

                {/* Right Status */}
                <div className={`flex items-center shrink-0 ${isMobile ? "gap-2" : "gap-6"}`}>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-on-surface-variant font-label-md mb-1">
                      <LucideUser className="w-4 h-4" />
                      <span>{room.memberCount}</span>
                    </div>
                    
                    {room.unreadCount > 0 ? (
                      <div className="flex items-center justify-end gap-1.5 text-primary font-bold font-label-md">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span>{timeString}</span>
                      </div>
                    ) : (
                      <div className="text-outline font-label-md italic">{timeString}</div>
                    )}
                  </div>
                  
                  <ArrowRightIcon className="w-4 h-4 text-outline shrink-0" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LucideMessageSquare className="text-[40px] text-outline-variant mb-3" />
            <p className="text-on-surface-variant font-body-md">
              No matching chats found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
