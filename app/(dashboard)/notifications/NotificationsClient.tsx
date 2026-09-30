"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Package,
  ShieldCheck,
  AlertCircle,
  Info,
  Clock,
  Search,
  RotateCw,
  ChevronRight,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { INotification, NotificationType } from "@/types/notification";
import { notificationApi } from "@/services/notificationService";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";
import { ROUTES } from "@/app/constants/routes";

type FilterTab = "ALL" | "UNREAD" | "SHIPMENT" | "SYSTEM";

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
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
}

export default function NotificationsClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync real-time socket events
  const handleNewNotification = useCallback((incoming: INotification) => {
    setNotifications((prev) => [incoming, ...prev]);
  }, []);

  const { unreadCount, setUnreadCount } = useNotificationSocket({
    userId: user?.id,
    role: user?.role,
    onNewNotification: handleNewNotification,
  });

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications(1, 50);
      if (res && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  // Delete single notification
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // Icon resolver
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "ROLE_UPDATED":
        return <ShieldCheck className="w-5 h-5 text-purple-400" />;
      case "SHIPMENT_CREATED":
      case "SHIPMENT_STATUS_UPDATED":
      case "AGENT_ASSIGNED":
        return <Package className="w-5 h-5 text-[#00c9a7]" />;
      case "ACCOUNT_SUSPENDED":
      case "ACCOUNT_ACTIVATED":
        return <AlertCircle className="w-5 h-5 text-[#ff6b6b]" />;
      case "PAYMENT_SUCCESS":
        return <DollarSign className="w-5 h-5 text-[#00b4d8]" />;
      default:
        return <Info className="w-5 h-5 text-[#7ecfc4]" />;
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === "UNREAD" && item.isRead) return false;
      if (
        activeTab === "SHIPMENT" &&
        item.type !== "SHIPMENT_CREATED" &&
        item.type !== "SHIPMENT_STATUS_UPDATED" &&
        item.type !== "AGENT_ASSIGNED"
      ) {
        return false;
      }
      if (
        activeTab === "SYSTEM" &&
        item.type !== "ROLE_UPDATED" &&
        item.type !== "ACCOUNT_SUSPENDED" &&
        item.type !== "ACCOUNT_ACTIVATED" &&
        item.type !== "PAYMENT_SUCCESS" &&
        item.type !== "GENERAL"
      ) {
        return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesMessage = item.message?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMessage && !matchesType) return false;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] hover:border-[#00c9a7]/50 transition-all cursor-pointer"
            title="Reload from server"
          >
            <RotateCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00c9a7]/15 border border-[#00c9a7]/40 text-xs font-bold text-[#00e5c0] hover:bg-[#00c9a7]/25 transition-all cursor-pointer"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c9a7] animate-pulse" />
              Live Alerts Radar
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00b4d8]/15 text-[#00b4d8] border border-[#00b4d8]/30">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-[#7ecfc4]">
            Monitor all operational milestones, corridor checkpoints, security events, and platform alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#e0faf5]">{notifications.length}</p>
            <p className="text-[10px] text-[#3a6b66] uppercase font-mono">Total Recorded</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-center text-[#00c9a7]">
            <Bell size={22} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All", value: "ALL" as const, count: notifications.length },
            { label: "Unread", value: "UNREAD" as const, count: unreadCount },
            { label: "Shipments", value: "SHIPMENT" as const },
            { label: "System", value: "SYSTEM" as const },
          ].map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40 shadow-xs"
                    : "text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]/60 border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span className="ml-1.5 text-[10px] opacity-80">({tab.count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a6b66]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts or consignments..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:border-[#00c9a7] focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Notifications List Card Container */}
      <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden divide-y divide-[#1a4a4a]/50">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
            <p className="text-xs font-semibold text-[#7ecfc4]">
              Synchronizing notification logs...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-center text-[#3a6b66]">
              <Info size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#e0faf5]">No notifications found</h3>
            <p className="text-xs text-[#7ecfc4]/70 max-w-sm">
              {searchQuery
                ? `No alerts matching "${searchQuery}". Try a different search term.`
                : activeTab === "UNREAD"
                ? "You have acknowledged all active dispatches. You are all caught up!"
                : "Real-time dispatch milestones and telemetry alerts will appear here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/dashboard/notifications/${item.id}`)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-all relative group cursor-pointer ${
                item.isRead
                  ? "bg-transparent hover:bg-[#0a1a1a]/60"
                  : "bg-[#00c9a7]/[0.03] hover:bg-[#00c9a7]/[0.07]"
              }`}
            >
              {/* Type Category Icon */}
              <div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center bg-[#0a1a1a] border border-[#1a4a4a] mt-0.5">
                {getIcon(item.type)}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm truncate ${
                        item.isRead ? "font-semibold text-[#c2ece3]" : "font-black text-[#ffffff]"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#00c9a7] shrink-0 animate-pulse" />
                    )}
                  </div>

                  <span className="text-[11px] text-[#3a6b66] font-mono shrink-0 flex items-center gap-1">
                    <Clock size={11} />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-[#7ecfc4]/90 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                {/* Footer details & Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#1a4a4a]/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4]">
                      {item.type.replace(/_/g, " ")}
                    </span>

                    {item.link && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(item.link!);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00c9a7] hover:text-[#00e5c0] hover:underline cursor-pointer"
                      >
                        <span>Direct Resource</span>
                        <ExternalLink size={11} />
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, item.id)}
                        className="text-[11px] text-[#7ecfc4] hover:text-[#00e5c0] flex items-center gap-1 font-semibold p-1 hover:bg-[#112a2a] rounded-lg transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCircle2 size={13} />
                        <span className="hidden sm:inline">Mark read</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="text-[#3a6b66] hover:text-[#ff6b6b] p-1.5 hover:bg-[#112a2a] rounded-lg transition-colors cursor-pointer"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>

                    <span className="text-[#3a6b66] group-hover:text-[#00c9a7] transition-colors ml-1">
                      <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
