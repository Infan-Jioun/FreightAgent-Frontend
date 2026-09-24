"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Socket } from "socket.io-client";
import { INotification } from "@/types/notification";
import { toast } from "sonner";
import { playNotificationChime } from "@/app/lib/browserNotification";
import { useSocketContext } from "@/app/providers/SocketProvider";

let globalSocket: Socket | null = null;

interface UseNotificationSocketProps {
  userId?: string;
  role?: string;
  onNewNotification?: (notification: INotification) => void;
}

function getSocketServerUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const rawApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  try {
    const parsed = new URL(rawApi);
    return parsed.origin;
  } catch {
    return "http://localhost:5000";
  }
}

export const useNotificationSocket = ({
  userId,
  role,
  onNewNotification,
}: UseNotificationSocketProps) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { socket: contextSocket, subscribe } = useSocketContext();
  const onNewNotifRef = useRef(onNewNotification);
  onNewNotifRef.current = onNewNotification;

  // OS Desktop Notification
  const showDesktopNotification = useCallback(
    (title: string, message: string, link: string | null) => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          const notif = new Notification(title, {
            body: message,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });

          notif.onclick = () => {
            window.focus();
            if (link) {
              window.location.href = link;
            }
            notif.close();
          };

          setTimeout(() => {
            notif.close();
          }, 8000);
        } catch {
          // System notification policy fallback
        }
      }
    },
    []
  );

  // Incoming notification processor
  const handleIncomingNotification = useCallback(
    (incoming: INotification) => {
      // 1. Play audio chime
      playNotificationChime();

      // 2. Display in-app toast
      toast(incoming.title, {
        description: incoming.message,
        action: incoming.link
          ? {
              label: "View",
              onClick: () => {
                if (typeof window !== "undefined") {
                  window.location.href = incoming.link!;
                }
              },
            }
          : undefined,
        duration: 5000,
      });

      // 3. Desktop OS Notification if tab is hidden / backgrounded
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        showDesktopNotification(incoming.title, incoming.message, incoming.link);
      }

      // 4. Increment local unread counter
      setUnreadCount((prev) => prev + 1);

      // 5. Notify parent listener if registered
      if (onNewNotifRef.current) {
        onNewNotifRef.current(incoming);
      }
    },
    [showDesktopNotification]
  );

  // If SocketProvider is available in the React tree, bind to its pub/sub
  useEffect(() => {
    if (contextSocket) {
      const unsubNotif = subscribe("notification", (data) => {
        handleIncomingNotification(data as INotification);
      });

      const unsubCount = subscribe("unread_count_updated", (data) => {
        const payload = data as { unreadCount: number };
        if (payload && typeof payload.unreadCount === "number") {
          setUnreadCount(payload.unreadCount);
        }
      });

      return () => {
        unsubNotif();
        unsubCount();
      };
    }
  }, [contextSocket, subscribe, handleIncomingNotification]);

  // Fallback standalone socket connection if used outside SocketProvider
  useEffect(() => {
    if (contextSocket || !userId) return;

    let isCancelled = false;

    const setupStandaloneSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        if (isCancelled) return;

        const socketUrl = getSocketServerUrl();

        if (!globalSocket) {
          globalSocket = io(socketUrl, {
            query: { userId, role },
            auth: { userId, role },
            withCredentials: true,
            transports: ["websocket", "polling"],
          });
        }

        const onNotification = (incoming: INotification) => {
          if (isCancelled) return;
          handleIncomingNotification(incoming);
        };

        const onUnreadCountUpdated = ({ unreadCount }: { unreadCount: number }) => {
          if (isCancelled) return;
          setUnreadCount(unreadCount);
        };

        globalSocket.on("notification", onNotification);
        globalSocket.on("unread_count_updated", onUnreadCountUpdated);

        return () => {
          globalSocket?.off("notification", onNotification);
          globalSocket?.off("unread_count_updated", onUnreadCountUpdated);
        };
      } catch (err) {
        console.warn("Standalone socket setup error:", err);
      }
    };

    const cleanupPromise = setupStandaloneSocket();

    return () => {
      isCancelled = true;
      cleanupPromise.then((clean) => clean && clean());
    };
  }, [contextSocket, userId, role, handleIncomingNotification]);

  return { unreadCount, setUnreadCount };
};

export default useNotificationSocket;
