"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface UsePwaInstallReturn {
  /** True when running inside the installed PWA (display-mode: standalone) */
  isInstalled: boolean;
  /** True when the browser has surfaced a native install prompt (Android/Chrome) */
  canInstall: boolean;
  /** True while the install prompt is being shown / awaiting user choice */
  installing: boolean;
  /** Call this to trigger the native install prompt. No-op if unavailable. */
  triggerInstall: () => Promise<void>;
}

/**
 * Hook that encapsulates PWA install-prompt logic.
 *
 * Listens for `beforeinstallprompt` (Android / Chrome) and tracks whether
 * the app is already running in standalone mode.  Works in both "use client"
 * components and regular client components.
 */
export function usePwaInstall(): UsePwaInstallReturn {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Capture the browser's install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Detect standalone display mode (installed PWA)
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mq.matches);
    const listener = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
        setIsInstalled(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  return {
    isInstalled,
    canInstall: !!installPrompt,
    installing,
    triggerInstall,
  };
}
