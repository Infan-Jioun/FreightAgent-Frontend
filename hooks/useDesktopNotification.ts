"use client";

import { useState, useEffect, useCallback } from "react";
import { playNotificationChime } from "@/app/lib/browserNotification";

export function useDesktopNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res;
    } catch {
      return "denied";
    }
  }, []);

  const showDesktopNotification = useCallback(
    (title: string, message: string, link: string | null = null) => {
      // Play audio chime
      playNotificationChime();

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

          // Auto-close after 8 seconds
          setTimeout(() => {
            notif.close();
          }, 8000);
        } catch {
          // Silently handle if notifications are blocked by system policy
        }
      }
    },
    []
  );

  return {
    permission,
    requestPermission,
    showDesktopNotification,
  };
}

export default useDesktopNotification;
