import { create } from "zustand";

export type PermissionState = "granted" | "prompt" | "denied";

export type PermissionStoreState = {
  locationPermission: PermissionState;
  notificationPermission: PermissionState;
  setPermissions: (location: PermissionState, notification: PermissionState) => void;
  setLocationPermission: (location: PermissionState) => void;
  setNotificationPermission: (notification: PermissionState) => void;
};

export const usePermissionStore = create<PermissionStoreState>((set) => ({
  locationPermission: "prompt",
  notificationPermission: "prompt",
  setPermissions: (location, notification) =>
    set({ locationPermission: location, notificationPermission: notification }),
  setLocationPermission: (location) => set({ locationPermission: location }),
  setNotificationPermission: (notification) => set({ notificationPermission: notification }),
}));
