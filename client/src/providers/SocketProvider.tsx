"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { socket } from "@/services/socket";

export function SocketProvider({
  children,
}: {
  children: ReactNode;
}) {
    useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated && !socket.connected) {
      socket.connect();
    }

    if (!isAuthenticated && socket.connected) {
      socket.disconnect();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}