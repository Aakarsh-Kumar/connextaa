"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { socket } from "@/services/socket";

export function SocketProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
