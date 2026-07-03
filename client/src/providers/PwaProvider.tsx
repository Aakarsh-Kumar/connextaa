"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextValue {
  /** True when running inside the installed PWA (display-mode: standalone) */
  isInstalled: boolean;
  /** True when the browser has surfaced a native install prompt */
  canInstall: boolean;
  /** True while the install prompt dialog is open / awaiting user choice */
  installing: boolean;
  /** Trigger the native install prompt. No-op if unavailable. */
  triggerInstall: () => Promise<void>;
}

const PwaContext = createContext<PwaContextValue>({
  isInstalled: false,
  canInstall: false,
  installing: false,
  triggerInstall: async () => {},
});

/**
 * Global PWA install-prompt provider.
 *
 * Must be placed near the top of the provider tree so it registers the
 * `beforeinstallprompt` listener before any child component mounts.
 * The browser fires this event exactly once per page load; mounting late
 * (e.g. inside a page component) will always miss it.
 */
export function PwaProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Capture the one-shot beforeinstallprompt event as early as possible.
  useEffect(() => {
  console.log("PWA Provider Mounted");

  const handler = (e: Event) => {
    console.log("beforeinstallprompt FIRED");
    e.preventDefault();
    setInstallPrompt(e as BeforeInstallPromptEvent);
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
  };
}, []);

useEffect(() => {
  console.log("installPrompt", installPrompt);
}, [installPrompt]);

  // Detect standalone display mode (app already installed).
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mq.matches);
    const listener = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const triggerInstall = useCallback(async () => {
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
  }, [installPrompt]);

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canInstall: !!installPrompt,
        installing,
        triggerInstall,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

/** Consume the global PWA install state anywhere in the tree. */
export function usePwa(): PwaContextValue {
  return useContext(PwaContext);
}
