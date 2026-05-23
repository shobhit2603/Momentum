"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useToast } from "@/components/ToastProvider";

const SocketContext = createContext({ socketRef: null, lastReview: null });

export function SocketProvider({ children }) {
  const pathname = usePathname();
  const { addToast } = useToast();
  const [lastReview, setLastReview] = useState(null);
  const socketRef = useRef(null);
  const hasShownError = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (pathname === "/login" || pathname === "/auth") {
      disconnectSocket();
      socketRef.current = null;
      return undefined;
    }

    let activeSocket = null;
    let handleReview = null;
    let handleConnectError = null;
    let handleConnect = null;

    const attachSocket = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        disconnectSocket();
        socketRef.current = null;
        return;
      }

      activeSocket = connectSocket(token);
      if (!activeSocket) return;

      socketRef.current = activeSocket;

      handleReview = (payload) => {
        if (!payload?.review) return;
        setLastReview(payload);
        const reviewerName = payload.review.reviewerId?.name || "A friend";
        const message = payload.review.content
          ? `“${payload.review.content}”`
          : "Left feedback on your momentum.";
        addToast({
          type: "info",
          title: `${reviewerName} sent feedback`,
          message,
        });
      };

      handleConnectError = () => {
        if (hasShownError.current) return;
        hasShownError.current = true;
        addToast({
          type: "warning",
          title: "Realtime paused",
          message: "Could not connect to live updates.",
        });
      };

      handleConnect = () => {
        hasShownError.current = false;
      };

      activeSocket.off("review:received", handleReview);
      activeSocket.on("review:received", handleReview);
      activeSocket.off("connect_error", handleConnectError);
      activeSocket.on("connect_error", handleConnectError);
      activeSocket.off("connect", handleConnect);
      activeSocket.on("connect", handleConnect);
    };

    attachSocket();
    window.addEventListener("momentum:token", attachSocket);

    return () => {
      window.removeEventListener("momentum:token", attachSocket);
      if (activeSocket) {
        if (handleReview) activeSocket.off("review:received", handleReview);
        if (handleConnectError) activeSocket.off("connect_error", handleConnectError);
        if (handleConnect) activeSocket.off("connect", handleConnect);
      }
    };
  }, [addToast, pathname]);

  const value = useMemo(() => ({ socketRef, lastReview }), [lastReview]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
