"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCheck,
  Trash2,
  ExternalLink,
  Package,
  ShieldCheck,
  AlertCircle,
  Info,
  Clock,
  Laptop,
  X,
  DollarSign,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { INotification, NotificationType } from "@/types/notification";
import { notificationApi } from "@/services/notificationService";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useDesktopNotification } from "@/hooks/useDesktopNotification";
import { NotificationBell } from "./NotificationBell";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";

export interface NotificationCenterProps {
  currentUser?: {
    id: string;
    role: string;
  };
  align?: "left" | "right";
  className?: string;
}

type FilterCategory = "ALL" | "UNREAD" | "SHIPMENT" | "SYSTEM";

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffSecs = Math.floor((now - past) / 1000);

    if (diffSecs < 45) return "Just now";
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recent";
  }
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUser: propsUser,
  align = "right",
  className = "",
}) => {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const effectiveUser = propsUser || (authUser ? { id: authUser.id, role: authUser.role } : undefined);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { permission, requestPermission } = useDesktopNotification();

  // Prepend incoming real-time notifications from Socket.IO
  const handleNewNotification = useCallback((newNotif: INotification) => {
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // Real-time socket sync hook
  const { unreadCount, setUnreadCount } = useNotificationSocket({
    userId: effectiveUser?.id,
    role: effectiveUser?.role,
    onNewNotification: handleNewNotification,
  });

  // Load paginated notifications from REST API
  const loadNotifications = useCallback(async () => {
    if (!effectiveUser?.id) return;
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications(1, 30);
      if (res && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Fallback: network offline or backend initializing
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUser?.id, setUnreadCount]);

  useEffect(() => {
    if (effectiveUser?.id) {
      loadNotifications();
    }
  }, [effectiveUser?.id, loadNotifications]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Mark single notification as read & navigate to link
  const handleItemClick = async (notif: INotification) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Silently mark locally on failure
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item))
        );
      }
    }

    setIsOpen(false);
    // Navigate to dedicated notification details route
    router.push(`/dashboard/notifications/${notif.id}`);
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  // Delete notification
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // Request browser desktop push permission
  const handleEnableDesktopAlerts = async () => {
    const res = await requestPermission();
    if (res === "granted") {
      toast.success("Chrome & desktop notifications enabled!");
    } else {
      toast.info("Notification permission was dismissed or blocked.");
    }
  };

  // Category Icon resolver
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "ROLE_UPDATED":
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case "SHIPMENT_CREATED":
      case "SHIPMENT_STATUS_UPDATED":
      case "AGENT_ASSIGNED":
        return <Package className="w-4 h-4 text-[#00c9a7]" />;
      case "ACCOUNT_SUSPENDED":
        return <AlertCircle className="w-4 h-4 text-[#ff6b6b]" />;
      case "PAYMENT_SUCCESS":
        return <DollarSign className="w-4 h-4 text-[#00b4d8]" />;
      default:
        return <Info className="w-4 h-4 text-[#7ecfc4]" />;
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "UNREAD":
        return notifications.filter((n) => !n.isRead);
      case "SHIPMENT":
        return notifications.filter(
          (n) =>
            n.type === "SHIPMENT_CREATED" ||
            n.type === "SHIPMENT_STATUS_UPDATED" ||
            n.type === "AGENT_ASSIGNED"
        );
      case "SYSTEM":
        return notifications.filter(
          (n) =>
            n.type === "ROLE_UPDATED" ||
            n.type === "ACCOUNT_SUSPENDED" ||
            n.type === "ACCOUNT_ACTIVATED" ||
            n.type === "PAYMENT_SUCCESS" ||
            n.type === "GENERAL"
        );
      case "ALL":
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Navbar Bell with Live Unread Badge */}
      <NotificationBell
        unreadCount={unreadCount}
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
      />

      {/* Dropdown Notification Center */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2.5 w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] bg-[#0d1f1f] rounded-3xl shadow-2xl shadow-black/80 border border-[#1a4a4a] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1a4a4a]/80 bg-[#0a1a1a]/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#e0faf5] tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-bold text-[#00e5c0] bg-[#00c9a7]/15 px-2 py-0.5 rounded-full border border-[#00c9a7]/30">
                  {unreadCount} New
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-[#3a6b66] bg-[#0a0f0f] px-2 py-0.5 rounded-full border border-[#1a4a4a]">
                  Caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-[#00c9a7] hover:text-[#00e5c0] font-semibold px-2 py-1 rounded-lg hover:bg-[#112a2a] transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#3a6b66] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer"
                aria-label="Close notification panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Push Notification Permission Banner */}
          {permission === "default" && (
            <div className="px-4 py-2.5 bg-linear-to-r from-[#00c9a7]/10 to-[#00b4d8]/10 border-b border-[#1a4a4a]/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#e0faf5]">
                <Laptop className="w-4 h-4 text-[#00c9a7] shrink-0" />
                <span className="text-[11px] text-[#7ecfc4]">
                  Enable Chrome & desktop alerts
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnableDesktopAlerts}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] font-bold text-[10px] transition-colors cursor-pointer"
              >
                Enable
              </button>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="px-3 pt-2.5 pb-2 bg-[#0a1a1a]/40 border-b border-[#1a4a4a]/60 flex items-center justify-between gap-1 overflow-x-auto">
            <div className="flex items-center gap-1">
              {[
                { label: "All", value: "ALL" as const, count: notifications.length },
                { label: "Unread", value: "UNREAD" as const, count: unreadCount },
                { label: "Shipments", value: "SHIPMENT" as const },
                { label: "System", value: "SYSTEM" as const },
              ].map((tab) => {
                const isActive = activeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveFilter(tab.value)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/40 shadow-xs"
                        : "text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]/60 border border-transparent"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" && tab.count > 0 && (
                      <span className="ml-1 opacity-70">({tab.count})</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={loadNotifications}
              title="Refresh notifications"
              className="text-[10px] text-[#3a6b66] hover:text-[#00c9a7] flex items-center gap-1 font-mono transition-colors shrink-0 px-2 py-0.5 rounded cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Notification List Panel */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-[#1a4a4a]/40 scrollbar-thin">
            {isLoading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
                <p className="text-xs text-[#7ecfc4]">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-center text-[#3a6b66]">
                  <Info className="w-4.5 h-4.5" />
                </div>
                <p className="text-xs font-bold text-[#e0faf5]">No notifications found</p>
                <p className="text-[11px] text-[#7ecfc4]/70 max-w-xs">
                  {activeFilter === "UNREAD"
                    ? "You have caught up with all active dispatches."
                    : "Platform events and shipment telemetry will arrive in real time."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors relative group cursor-pointer ${
                    item.isRead
                      ? "bg-transparent hover:bg-[#0a1a1a]/60"
                      : "bg-[#00c9a7]/[0.04] hover:bg-[#00c9a7]/[0.08]"
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-[#0d1f1f] border border-[#1a4a4a] mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p
                        className={`text-xs truncate ${
                          item.isRead
                            ? "font-semibold text-[#c2ece3]"
                            : "font-black text-[#ffffff]"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[#3a6b66] font-mono shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#7ecfc4]/90 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-0.5">
                      <div className="flex items-center gap-2">
                        {item.link ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              router.push(item.link!);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#00c9a7] hover:underline cursor-pointer"
                          >
                            <span>Direct resource</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono text-[#3a6b66] uppercase">
                            {item.type.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#00c9a7] shrink-0 animate-pulse" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#3a6b66] hover:text-[#ff6b6b] transition-all p-1 cursor-pointer"
                          aria-label="Delete notification"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 bg-[#0a1a1a]/80 border-t border-[#1a4a4a]/80 flex items-center justify-between text-[11px]">
            <span className="text-[#3a6b66] flex items-center gap-1.5 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c9a7] animate-pulse" />
              Live Alerts
            </span>

            <Link
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[#00c9a7] hover:text-[#00e5c0] font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View all alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
