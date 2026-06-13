"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/api/authApi";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-3 h-16">
        <Link href="/dashboard" className="font-bold text-xl tracking-tight text-popover flex items-center gap-2">
          <span>Connectify</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground/75">Dashboard</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/notifications" className="relative p-2 text-foreground/80 hover:text-popover hover:bg-accent rounded-full transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-background"></span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || "Avatar"}
                width={36}
                height={36}
                className="rounded-full border border-border"
              />
            ) : (
              <div className="h-9 w-9 bg-accent rounded-full flex items-center justify-center border border-border">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold">{user?.name || "User"}</span>
              <span className="text-xs text-muted-foreground">@{user?.username || "username"}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
