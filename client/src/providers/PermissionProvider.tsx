"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { usePermissionStore, PermissionState } from "@/store/permissionStore";

export function PermissionProvider({ children }: { children: ReactNode }) {
  const setPermissions = usePermissionStore((state) => state.setPermissions);

  const checkPermissions = useCallback(async () => {
    let locState: PermissionState = "prompt";
    let notifState: PermissionState = "prompt";

    // 1. Check Geolocation Permission silently
    if (typeof navigator !== "undefined") {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({
            name: "geolocation" as PermissionName,
          });
          locState = result.state as PermissionState;

          // Listen for change events on the permission status if supported
          result.onchange = () => {
            usePermissionStore.getState().setLocationPermission(result.state as PermissionState);
          };
        } catch (error) {
          // If query is unsupported or errors, default to prompt
          locState = "prompt";
        }
      } else {
        // Fallback for browsers without permissions.query
        locState = "prompt";
      }
    }

    // 2. Check Notification Permission silently
    if (typeof window !== "undefined" && "Notification" in window) {
      const current = Notification.permission;
      if (current === "default") {
        notifState = "prompt";
      } else {
        notifState = current as PermissionState;
      }
    } else {
      notifState = "denied";
    }

    setPermissions(locState, notifState);
  }, [setPermissions]);

  useEffect(() => {
    // Check immediately on mount
    checkPermissions();

    // Recheck silently when tab becomes active / window gets focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkPermissions();
      }
    };

    const handleFocus = () => {
      checkPermissions();
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [checkPermissions]);

  return <>{children}</>;
}
