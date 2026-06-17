"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, MessageSquare, Bell, User } from "lucide-react";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Chats", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Create", href: "/dashboard/collaborations/create", icon: PlusCircle, highlight: true },
  { label: "Alerts", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-16 bg-surface-container flex justify-around items-center px-4 rounded-t-2xl shadow-[0px_-4px_20px_rgba(31,41,55,0.07)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.highlight) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-primary-container/70 text-on-primary-container"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-label-sm text-label-sm">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all duration-150 active:scale-90 ${
              isActive
                ? "text-primary"
                : "text-on-surface-variant hover:bg-outline-variant/30"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-label-sm text-label-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
