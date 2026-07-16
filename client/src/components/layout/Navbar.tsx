"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/api/authApi";
import {
  Home,
  PlusCircle,
  MessageSquare,
  Bell,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Logo from "@/../public/logo.png"
import LogoIcon from "@/../public/logo-icon.png"
import { useIsMobile } from "@/hooks/use-mobile";

const NAV_LINKS = [
  { label: "Feed", href: "/dashboard", icon: Home },
  { label: "Create", href: "/dashboard/collaborations/create", icon: PlusCircle },
  { label: "Chats", href: "/dashboard/chats", icon: MessageSquare },
  { label: "Alerts", href: "/dashboard/notifications", icon: Bell },
];

export function Navbar() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant/40 shadow-[0px_1px_8px_rgba(31,41,55,0.05)]">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 md:px-6 h-16 gap-4">

        {/* ── Brand ── */}
        <Link
          href="/dashboard"
          className="relative h-12 w-10 md:w-40 flex-shrink-0 flex items-center group"
        >
          <Image
            alt="Connextaa Logo"
            fill
            sizes="(max-width: 768px) 128px, 160px"
            priority
            className="object-contain object-left transition-transform duration-300 group-hover:scale-105"
            src={isMobile ? LogoIcon : Logo}
          />
        </Link>

        {/* ── Desktop centre nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-label-md text-label-md transition-all duration-150 ${
                  isActive
                    ? "bg-primary-container/30 text-on-primary-container font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: user + logout ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* <Link
            href="/dashboard/notifications"
            className="md:hidden relative p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background" />
          </Link> */}

          {/* Avatar + name */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-container transition-all group"
          >
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || "Avatar"}
                width={34}
                height={34}
                className="rounded-full border-2 border-outline-variant object-cover"
              />
            ) : (
              <div className="h-[34px] w-[34px] bg-primary-container/30 rounded-full flex items-center justify-center border-2 border-outline-variant shrink-0">
                <UserIcon className="h-4 w-4 text-on-primary-container" />
              </div>
            )}
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                {user?.name || "User"}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                @{user?.username || "username"}
              </span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-on-surface-variant hover:text-destructive hover:bg-destructive/10 rounded-full transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
