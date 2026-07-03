"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { usePwa } from "@/providers/PwaProvider";

const SESSION_KEY = "connectify-install-banner-dismissed";

export function InstallBanner() {
  const { canInstall, installing, triggerInstall, isInstalled } = usePwa();

  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadyDismissed = sessionStorage.getItem(SESSION_KEY) === "true";
    setDismissed(alreadyDismissed);
  }, []);

  // Small delay so users see the dashboard first before the banner slides in.
  useEffect(() => {
    if (dismissed || isInstalled || !canInstall) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [dismissed, isInstalled, canInstall]);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setDismissed(true);
    setVisible(false);
  };

  if (dismissed || isInstalled || !canInstall || !visible) {
    return null;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-primary/15 bg-primary/5 p-5">
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-4 rounded-full p-1 transition hover:bg-primary/10"
        aria-label="Dismiss install banner"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">
            Install Connectify
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Install Connectify for faster access, better performance and
            improved notification support.
          </p>

          <button
            onClick={triggerInstall}
            disabled={installing}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-60"
          >
            {installing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Installing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Install
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}