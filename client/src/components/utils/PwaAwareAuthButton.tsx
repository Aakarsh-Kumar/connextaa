"use client";

import { Download, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useAuthStore } from "@/store/authStore";
import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";
import Link from "next/link";

interface PwaAwareAuthButtonProps {
  /** Visual size variant. Defaults to "md". */
  size?: "sm" | "md" | "lg";
  /** Extra class names applied to the wrapper div */
  className?: string;
  /** When true, pass compactOnMobile to GoogleLoginButton */
  compactOnMobile?: boolean;
}

const sizeMap = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

/**
 * Renders the correct CTA depending on auth + PWA install state:
 *
 * - Authenticated                        → "Go to Dashboard" link
 * - Mobile + canInstall (Android/Chrome) → "Install Connectify" button
 * - Mobile + iOS (no prompt)             → Info banner for Add-to-Home-Screen
 * - Desktop / already installed          → GoogleLoginButton
 */
export function PwaAwareAuthButton({
  size = "md",
  className = "",
  compactOnMobile = false,
}: PwaAwareAuthButtonProps) {
  const isMobile = useIsMobile();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isInstalled, canInstall, installing, triggerInstall } =
    usePwaInstall();

  const showInstallCTA = isMobile && !isInstalled && canInstall;
  const showIosBanner = isMobile && !isInstalled && !canInstall && !isAuthenticated;

  if (isAuthenticated) {
    return (
      <Link
        href="/dashboard"
        className={`bg-popover text-primary-foreground ${sizeMap[size]} rounded-[9999px] font-bold card-shadow active:scale-95 hover:bg-primary/95 transition-all cursor-pointer text-center ${className}`}
      >
        Go to Dashboard
      </Link>
    );
  }

  if (showInstallCTA) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <button
          onClick={triggerInstall}
          disabled={installing}
          className={`flex items-center justify-center gap-2.5 ${sizeMap[size]} bg-primary text-white rounded-[9999px] font-bold shadow-lg shadow-primary/30 active:scale-95 hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer`}
        >
          {installing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Installing…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Install Connectify
            </>
          )}
        </button>
        <p className="flex items-center gap-1 text-xs text-on-surface-variant">
          <Smartphone className="w-3.5 h-3.5" />
          Install the app to sign in &amp; get all features
        </p>
      </div>
    );
  }

  if (showIosBanner) {
    return (
      <div
        className={`flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl text-left ${className}`}
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Smartphone className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-on-surface">
            Get the Connectify app
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Tap the{" "}
            <span className="font-bold text-primary">Share</span> button in
            Safari, then{" "}
            <span className="font-bold text-primary">Add to Home Screen</span>{" "}
            to install.
          </p>
        </div>
      </div>
    );
  }

  // Desktop or already-installed PWA
  return <GoogleLoginButton compactOnMobile={compactOnMobile} />;
}
