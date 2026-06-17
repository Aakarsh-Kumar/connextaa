"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryIcon, getCategoryStyles } from "@/constants";
import toast from "react-hot-toast";
import type { Category } from "@/types";

interface ChatItem {
  id: number;
  category: Category;
  title: string;
  sender: string;
  message: string;
  members: number;
  unreadCount: number;
  time: string;
}

const CHATS_DATA: ChatItem[] = [
  {
    id: 1,
    category: "STUDY",
    title: "DSA Revision Session",
    sender: "Aakarsh",
    message: "See you tomorrow at the library! Bring your notes.",
    members: 6,
    unreadCount: 2,
    time: "2 unread",
  },
  {
    id: 2,
    category: "CARPOOLING",
    title: "Daily Commute to Tech Park",
    sender: "Me",
    message: "I'll be 5 mins late today, sorry everyone!",
    members: 4,
    unreadCount: 0,
    time: "Just now",
  },
  {
    id: 3,
    category: "SPORTS",
    title: "Weekend HIIT Warriors",
    sender: "Karan",
    message: "Great workout today! Same time next week?",
    members: 12,
    unreadCount: 0,
    time: "2h ago",
  },
];

export default function ChatsPage() {
  const isMobile = useIsMobile();

  const handleChatClick = (title: string) => {
    toast.success(`Opening chat: ${title}`);
  };

  return (
    <div className="flex flex-col gap-4" id="content-chats">
      {CHATS_DATA.map((chat) => {
        const CategoryIcon = getCategoryIcon(chat.category);
        const styleClasses = getCategoryStyles(chat.category);

        return (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.title)}
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
                <span
                  className={`px-3 py-0.5 rounded-full text-label-sm font-bold shrink-0 border uppercase tracking-wider text-[10px] ${styleClasses}`}
                >
                  {chat.category.toLowerCase()}
                </span>
                <h3
                  className={`font-headline-md font-bold text-on-surface truncate ${
                    isMobile ? "text-base" : "text-body-lg"
                  }`}
                >
                  {chat.title}
                </h3>
              </div>
              <p className="text-on-surface-variant text-body-md truncate max-w-[90%] md:max-w-md">
                <span className="font-bold text-on-surface">{chat.sender}:</span>{" "}
                {chat.message}
              </p>
            </div>

            {/* Right Status */}
            <div className={`flex items-center shrink-0 ${isMobile ? "gap-2" : "gap-6"}`}>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 text-on-surface-variant font-label-md mb-1">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  <span>{chat.members} Members</span>
                </div>
                
                {chat.unreadCount > 0 ? (
                  <div className="flex items-center justify-end gap-1.5 text-primary font-bold font-label-md">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span>{chat.time}</span>
                  </div>
                ) : (
                  <div className="text-outline font-label-md italic">{chat.time}</div>
                )}
              </div>
              
              <span className="material-symbols-outlined text-outline shrink-0">
                chevron_right
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
