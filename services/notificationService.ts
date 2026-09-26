/**
 * Notification Service
 * Production API communication layer for all notification endpoints.
 */

import api from "@/app/lib/api";
import { API } from "@/app/constants/api";
import {
  INotificationListResponse,
  IUnreadCountResponse,
  INotification,
} from "@/types/notification";

export const notificationApi = {
  /**
   * Fetch paginated notifications with optional read status filter
   */
  getNotifications: async (
    page = 1,
    limit = 20,
    isRead?: boolean
  ): Promise<INotificationListResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (isRead !== undefined) {
      params.append("isRead", String(isRead));
    }

    const response = await api.get<INotificationListResponse>(
      `${API.NOTIFICATION.GET_ALL}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get unread notification counter for badge display
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<IUnreadCountResponse>(
      API.NOTIFICATION.GET_UNREAD_COUNT
    );
    return response.data?.data?.unreadCount ?? 0;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string): Promise<INotification> => {
    const response = await api.patch<{ success: boolean; data: INotification }>(
      API.NOTIFICATION.MARK_READ(id)
    );
    return response.data.data;
  },

  /**
   * Get single notification detail by ID
   */
  getNotificationById: async (id: string): Promise<INotification> => {
    try {
      const response = await api.get<{ success: boolean; data: INotification }>(
        API.NOTIFICATION.GET_BY_ID(id)
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data as unknown as INotification;
    } catch (err) {
      // Fallback: search in recent list if backend single get route is unavailable
      const list = await notificationApi.getNotifications(1, 100);
      const found = list.data?.find((n) => n.id === id);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Mark all notifications for the authenticated user as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.patch(API.NOTIFICATION.MARK_ALL_READ);
  },

  /**
   * Delete a notification record
   */
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(API.NOTIFICATION.DELETE(id));
  },
};

export default notificationApi;
