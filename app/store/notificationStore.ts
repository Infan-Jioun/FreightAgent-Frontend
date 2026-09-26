import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INotification } from "../types/notification.types";
import {
  playNotificationChime,
  showDeviceNotification,
  getDeviceNotificationPermission,
  requestDeviceNotificationPermission,
} from "../lib/browserNotification";

interface NotificationState {
  notifications: INotification[];
  soundEnabled: boolean;
  devicePermission: NotificationPermission;

  // Actions
  addNotification: (
    payload: Omit<INotification, "id" | "timestamp" | "read"> & {
      id?: string;
      timestamp?: string;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  requestPermission: () => Promise<NotificationPermission>;
  syncPermission: () => void;
  getUnreadCount: () => number;
}

const INITIAL_SEED_NOTIFICATIONS: INotification[] = [
  {
    id: "notif-seed-1",
    title: "Vessel Arrival at Maasvlakte 2",
    message: "Consignment FA-882910 arrived at Port of Rotterdam quay berth 4A. Telematics online.",
    type: "SHIPMENT",
    priority: "HIGH",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    read: false,
    link: "/tracking?id=FA-882910",
    metadata: {
      trackingId: "FA-882910",
      status: "AT_CUSTOMS",
      location: "Rotterdam Maasvlakte 2",
    },
  },
  {
    id: "notif-seed-2",
    title: "Air Cargo Charter Cleared",
    message: "Flight LH-8920 (Frankfurt -> Dubai DWC) has landed. Courier handover dispatched.",
    type: "DISPATCH",
    priority: "NORMAL",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    read: false,
    link: "/tracking?id=FA-771822",
    metadata: {
      trackingId: "FA-771822",
      status: "OUT_FOR_DELIVERY",
      location: "Dubai DWC Terminal",
    },
  },
  {
    id: "notif-seed-3",
    title: "Automated HS Customs Clearance",
    message: "Customs declaration CDS-9902 approved with zero hold. Electronic release note available.",
    type: "SECURITY",
    priority: "NORMAL",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    read: true,
    link: "/shipments",
    metadata: {
      trackingId: "FA-662910",
      status: "CLEARED",
      location: "UK HMRC Dover",
    },
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_SEED_NOTIFICATIONS,
      soundEnabled: true,
      devicePermission: "default",

      addNotification: (payload) => {
        const id = payload.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const timestamp = payload.timestamp || new Date().toISOString();

        const newNotification: INotification = {
          ...payload,
          id,
          timestamp,
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));

        // Play subtle synth chime if enabled
        if (get().soundEnabled) {
          playNotificationChime();
        }

        // Trigger native Chrome / OS Device notification pop-up
        showDeviceNotification(newNotification.title, {
          body: newNotification.message,
          link: newNotification.link,
          tag: newNotification.id,
        });
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () =>
        set({
          notifications: [],
        }),

      setSoundEnabled: (enabled) =>
        set({
          soundEnabled: enabled,
        }),

      requestPermission: async () => {
        const result = await requestDeviceNotificationPermission();
        set({ devicePermission: result });
        return result;
      },

      syncPermission: () => {
        const current = getDeviceNotificationPermission();
        set({ devicePermission: current });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: "freightagent_notification_center",
      partialize: (state) => ({
        notifications: state.notifications,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
