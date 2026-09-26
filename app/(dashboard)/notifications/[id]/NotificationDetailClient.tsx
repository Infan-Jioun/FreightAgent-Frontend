"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  ShieldCheck,
  AlertCircle,
  Info,
  Trash2,
  DollarSign,
  Radio,
  Share2,
} from "lucide-react";
import { INotification, NotificationType } from "@/types/notification";
import { notificationApi } from "@/services/notificationService";
import { toast } from "sonner";
import { ROUTES } from "@/app/constants/routes";

interface NotificationDetailClientProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function NotificationDetailClient({ params }: NotificationDetailClientProps) {
  const resolvedParams =
    params && typeof (params as unknown as Promise<{ id: string }>).then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });

  const id = resolvedParams.id;
  const router = useRouter();

  const [notification, setNotification] = useState<INotification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotificationById(id);
      setNotification(data);

      // Auto-mark as read if not yet read
      if (data && !data.isRead) {
        await notificationApi.markAsRead(id);
        setNotification((prev) => (prev ? { ...prev, isRead: true } : prev));
      }
    } catch {
      toast.error("Failed to load notification details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this notification?")) return;
    setDeleting(true);
    try {
      await notificationApi.deleteNotification(id);
      toast.success("Notification deleted");
      router.push(ROUTES.NOTIFICATIONS);
    } catch {
      toast.error("Failed to delete notification");
      setDeleting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Notification URL copied to clipboard");
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "ROLE_UPDATED":
        return <ShieldCheck className="w-6 h-6 text-purple-400" />;
      case "SHIPMENT_CREATED":
      case "SHIPMENT_STATUS_UPDATED":
      case "AGENT_ASSIGNED":
        return <Package className="w-6 h-6 text-[#00c9a7]" />;
      case "ACCOUNT_SUSPENDED":
      case "ACCOUNT_ACTIVATED":
        return <AlertCircle className="w-6 h-6 text-[#ff6b6b]" />;
      case "PAYMENT_SUCCESS":
        return <DollarSign className="w-6 h-6 text-[#00b4d8]" />;
      default:
        return <Radio className="w-6 h-6 text-[#7ecfc4]" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
        <p className="text-xs font-semibold text-[#7ecfc4]">
          Loading notification dossier...
        </p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="max-w-2xl mx-auto p-10 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-center text-[#3a6b66]">
          <Info size={24} />
        </div>
        <h2 className="text-base font-bold text-[#e0faf5]">Notification Not Found</h2>
        <p className="text-xs text-[#7ecfc4]">
          This record may have been cleared from system history or deleted.
        </p>
        <Link
          href={ROUTES.NOTIFICATIONS}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Notifications</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.NOTIFICATIONS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Notifications</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs text-[#7ecfc4] hover:text-[#00e5c0] p-1.5 rounded-lg border border-[#1a4a4a] bg-[#0d1f1f] hover:bg-[#112a2a] transition-colors cursor-pointer"
            title="Share notification link"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 text-xs text-[#ff6b6b] hover:text-[#ff8787] p-1.5 px-2.5 rounded-lg border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 hover:bg-[#ff6b6b]/20 transition-colors cursor-pointer disabled:opacity-50"
            title="Delete notification"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-2xl space-y-6">
        {/* Category Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-center shrink-0">
              {getIcon(notification.type)}
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                {notification.type.replace(/_/g, " ")}
              </span>
              <p className="text-[11px] text-[#3a6b66] font-mono mt-1">
                Ref ID: #{notification.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#00e5c0] bg-[#00c9a7]/10 px-2.5 py-1 rounded-full border border-[#00c9a7]/20">
            <CheckCircle2 size={13} />
            <span>Acknowledged</span>
          </div>
        </div>

        {/* Title & Timestamp */}
        <div className="space-y-2 border-b border-[#1a4a4a]/60 pb-5">
          <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
            {notification.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#7ecfc4]/80 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#00c9a7]" />
              {new Date(notification.createdAt).toLocaleDateString([], {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#00c9a7]" />
              {new Date(notification.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#3a6b66]">
            Notification Message
          </h2>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-sm text-[#c2ece3] leading-relaxed whitespace-pre-line">
            {notification.message}
          </div>
        </div>

        {/* Structured Metadata Payload (if present) */}
        {notification.data && Object.keys(notification.data).length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3a6b66]">
              Consignment & Telematics Payload
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(notification.data).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-0.5"
                >
                  <span className="text-[10px] uppercase font-mono text-[#3a6b66] block">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-bold text-[#e0faf5] break-words">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button (Target Resource Navigation) */}
        {notification.link && (
          <div className="pt-2">
            <Link
              href={notification.link}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00c9a7]/20 cursor-pointer"
            >
              <span>Inspect Destination Consignment</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
