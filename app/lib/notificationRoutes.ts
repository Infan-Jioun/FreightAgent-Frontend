/**
 * FreightAgent — Notification Routing & Destination Resolver
 * Domain Layer: Resolves safe, role-aware, production-valid application routes for all notifications.
 */

import { INotification, NotificationType } from "@/types/notification";
import { ROUTES } from "@/app/constants/routes";

export function resolveNotificationDestination(
  notification: Pick<INotification, "id" | "type" | "link" | "data">,
  userRole?: string | null
): string {
  const role = userRole?.toUpperCase() || "CUSTOMER";
  const rawLink = notification.link?.trim() || "";
  const data = (notification.data || {}) as Record<string, unknown>;

  // 1. Explicit rawLink provided
  if (rawLink) {
    // Handle shipments hub aliases
    if (rawLink === "/shipments" || rawLink === "/dashboard/shipments") {
      if (role === "ADMIN") return ROUTES.DASHBOARD_ADMIN_SHIPMENTS;
      if (role === "AGENT") return ROUTES.DASHBOARD_AGENT_SHIPMENTS;
      return ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
    }

    // Handle shipment creation aliases
    if (
      rawLink === "/shipments/create" ||
      rawLink === "/dashboard/shipments/create" ||
      rawLink === "/dashboard/shipments/new"
    ) {
      return ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS_NEW;
    }

    // Handle agent shipments route protection (Customers cannot access /dashboard/agent)
    if (rawLink.startsWith("/dashboard/agent/shipments")) {
      if (role === "CUSTOMER") {
        if (data.trackingId) {
          return ROUTES.TRACKING(String(data.trackingId));
        }
        return ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
      }
      return rawLink;
    }

    // Handle generic /dashboard/shipments/:id
    if (rawLink.startsWith("/dashboard/shipments/") || rawLink.startsWith("/shipments/")) {
      const parts = rawLink.split("/").filter(Boolean);
      const shipmentId = parts[parts.length - 1];
      if (role === "ADMIN") return ROUTES.DASHBOARD_ADMIN_SHIPMENTS;
      if (role === "AGENT") return ROUTES.DASHBOARD_AGENT_SHIPMENT_DETAIL(shipmentId);
      if (data.trackingId) return ROUTES.TRACKING(String(data.trackingId));
      return ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
    }

    // Handle tracking aliases
    if (rawLink.startsWith("/tracking")) {
      try {
        const url = new URL(rawLink, "http://localhost");
        const trackingId = url.searchParams.get("id") || url.searchParams.get("trackingId");
        if (trackingId) {
          return ROUTES.TRACKING(trackingId);
        }
      } catch {
        // Fallback to tracking page
      }
      return ROUTES.DASHBOARD_CUSTOMER_TRACKING;
    }

    // Handle legacy notifications routes
    if (rawLink === "/notifications") {
      return ROUTES.NOTIFICATIONS;
    }
    if (rawLink.startsWith("/notifications/")) {
      return `/dashboard${rawLink}`;
    }

    return rawLink;
  }

  // 2. Infer destination from notification type & metadata payload
  const type = notification.type as NotificationType;

  if (
    type === "SHIPMENT_CREATED" ||
    type === "SHIPMENT_STATUS_UPDATED" ||
    type === "AGENT_ASSIGNED"
  ) {
    if (role === "CUSTOMER") {
      if (data.trackingId) {
        return ROUTES.TRACKING(String(data.trackingId));
      }
      return ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
    }

    if (role === "AGENT") {
      const shipmentId = (data.shipmentId || data.id) as string | undefined;
      if (shipmentId) {
        return ROUTES.DASHBOARD_AGENT_SHIPMENT_DETAIL(shipmentId);
      }
      return ROUTES.DASHBOARD_AGENT_SHIPMENTS;
    }

    if (role === "ADMIN") {
      return ROUTES.DASHBOARD_ADMIN_SHIPMENTS;
    }

    return ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
  }

  if (type === "PAYMENT_SUCCESS") {
    if (role === "AGENT") return ROUTES.DASHBOARD_AGENT_EARNINGS;
    if (role === "ADMIN") return ROUTES.DASHBOARD_ADMIN_FINANCES;
    return ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
  }

  if (
    type === "ROLE_UPDATED" ||
    type === "ACCOUNT_ACTIVATED" ||
    type === "ACCOUNT_SUSPENDED"
  ) {
    return ROUTES.PROFILE;
  }

  // 3. Fallback to notification detail
  return ROUTES.NOTIFICATION_DETAIL(notification.id);
}
