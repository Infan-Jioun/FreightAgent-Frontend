export type NotificationType = "SHIPMENT" | "SYSTEM" | "SECURITY" | "FINANCE" | "DISPATCH";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  timestamp: string; // ISO string
  read: boolean;
  link?: string;
  metadata?: {
    trackingId?: string;
    status?: string;
    location?: string;
    amount?: number;
    channel?: string;
  };
}

export type NotificationFilter = "ALL" | "UNREAD" | "SHIPMENT" | "SYSTEM";
