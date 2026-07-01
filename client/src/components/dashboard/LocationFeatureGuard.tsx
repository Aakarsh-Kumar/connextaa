"use client";

import { ReactNode, useState } from "react";
import { usePermissionStore } from "@/store/permissionStore";
import { MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface LocationFeatureGuardProps {
  children: ReactNode;
  /** Optional callback triggered with coordinates when location is granted */
  onLocationGranted?: (coords: { lat: number; lng: number }) => void;
}

export function LocationFeatureGuard({
  children,
  onLocationGranted,
}: LocationFeatureGuardProps) {
  const locationPermission = usePermissionStore((state) => state.locationPermission);
  const setLocationPermission = usePermissionStore((state) => state.setLocationPermission);
  const [requesting, setRequesting] = useState(false);

  const handleRequestLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission("granted");
        setRequesting(false);
        toast.success("Location access granted!");
        if (onLocationGranted) {
          onLocationGranted({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      },
      (error) => {
        setRequesting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission("denied");
          toast.error(
            "Location access denied. Please enable location permission in your browser/app settings."
          );
        } else {
          toast.error("Failed to acquire location. Please try again.");
        }
      }
    );
  };

  if (locationPermission === "granted") {
    return <>{children}</>;
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--surface-container-high)] rounded-3xl p-8 max-w-lg mx-auto text-center shadow-lg flex flex-col items-center justify-center space-y-6 my-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Icon/Illustration Wrapper */}
      <div className="relative w-20 h-20 bg-[var(--primary-container)]/10 rounded-full flex items-center justify-center text-[var(--primary)] shrink-0 animate-pulse">
        <MapPin className="w-10 h-10 animate-bounce" />
      </div>

      {/* Text Info */}
      <div className="space-y-2">
        <h3 className="font-headline-md text-headline-md text-[var(--on-surface)] tracking-tight">
          Location Required
        </h3>
        <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md">
          Allow location access to discover nearby collaborations and calculate accurate distances.
        </p>
      </div>

      {/* Benefits List */}
      <div className="w-full max-w-sm bg-[var(--surface-container-low)] border border-[var(--surface-container-high)] rounded-2xl p-5 text-left space-y-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--outline)]">
          Benefits:
        </h4>
        <ul className="space-y-3">
          {[
            "Nearby activities",
            "Distance calculation",
            "Route matching",
          ].map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--on-surface-variant)] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={handleRequestLocation}
          disabled={requesting}
          className="w-full py-3.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-bold transition-all active:scale-[0.98] shadow-md hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          {requesting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Requesting Access…</span>
            </>
          ) : (
            <span>Allow Location</span>
          )}
        </button>

        {locationPermission === "denied" && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-red-500 font-semibold bg-red-500/5 py-2 px-3 border border-red-500/10 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Blocked in settings. Tap above to retry, or update browser options.</span>
          </p>
        )}
      </div>
    </div>
  );
}
