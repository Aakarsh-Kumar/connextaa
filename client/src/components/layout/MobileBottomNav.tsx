"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, MessageSquare, Bell, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Feed", href: "/dashboard", icon: Home },
    { label: "Create", href: "/dashboard/collaborations/create", icon: PlusSquare },
    { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Alerts", href: "/dashboard/notifications", icon: Bell },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-2 shadow-lg">
      <nav className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-popover font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
