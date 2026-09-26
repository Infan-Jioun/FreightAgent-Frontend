/**
 * Notification Domain Type Definitions
 * Exact mapping to Prisma model and backend REST API / WebSocket contracts.
 */

export type NotificationType =
  | "ROLE_UPDATED"
  | "SHIPMENT_CREATED"
  | "SHIPMENT_STATUS_UPDATED"
  | "AGENT_ASSIGNED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_ACTIVATED"
  | "PAYMENT_SUCCESS"
  | "GENERAL";

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface INotificationListResponse {
  success: boolean;
  message: string;
  data: INotification[];
  meta: INotificationMeta;
}

export interface IUnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}
