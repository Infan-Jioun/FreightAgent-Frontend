"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Loader2,
  Package,
  RotateCcw,
  Check,
  CheckCheck,
  Paperclip,
  FileText,
  Download,
  ExternalLink,
  MapPin,
  Users,
  Pencil,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useShipmentChat } from "@/hooks/useShipmentChat";
import { useAuthStore } from "@/app/store/authStore";
import { chatService } from "@/app/services/chat.service";
import { getErrorMessage } from "@/app/errorHelper/appError";
import { toast } from "sonner";
import { ChatMessagesSkeleton } from "./ChatSkeleton";
import { IChatMessage } from "@/app/types/chat.types";
import { envConfig } from "@/app/config/env";

function isAttachmentContent(content: string): boolean {
  const trimmed = content.trim();
  const attachmentRegex = /^📎\s*\[Attachment:\s*(.+?)\s*\((.+?)\)\](?:\n([\s\S]*))?$/;
  if (attachmentRegex.test(trimmed)) return true;
  const isUrl = /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/");
  if (isUrl) {
    const isDoc = /\.(pdf|jpeg|jpg|png|webp|gif|svg|doc|docx|xls|xlsx|csv|zip)(\?.*)?$/i.test(trimmed);
    if (isDoc) return true;
  }
  return false;
}


export interface ShipmentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  trackingId?: string;
  status?: string;
  shipmentStatus?: string;
  routeTitle?: string;
  counterpartyName?: string;
  counterpartyRole?: string;
  counterpartyPhone?: string;
  counterpartyEmail?: string;
}

function formatTimeOnly(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

function resolveAttachmentUrl(raw: string): string {
  let url = raw.trim();

  // If already full URL, clean any duplicate /api/v1/api/v1
  if (/^https?:\/\//i.test(url)) {
    return url.replace(/\/api\/v1\/api\/v1/g, "/api/v1");
  }

  // If relative path from backend
  if (url.startsWith("/")) {
    const apiBase = (envConfig.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
    if (url.startsWith("/api/v1/")) {
      const serverOrigin = apiBase.replace(/\/api\/v1$/, "");
      url = `${serverOrigin}${url}`;
    } else {
      url = `${apiBase}${url}`;
    }
  }

  return url.replace(/\/api\/v1\/api\/v1/g, "/api/v1");
}

function renderChatContent(content: string, isMe: boolean): React.JSX.Element {
  const trimmed = content.trim();

  // Handle structured attachment tag if present
  const attachmentRegex = /^📎\s*\[Attachment:\s*(.+?)\s*\((.+?)\)\](?:\n([\s\S]*))?$/;
  const match = trimmed.match(attachmentRegex);

  if (match) {
    const fileName = match[1];
    const fileSize = match[2];
    const caption = match[3]?.trim();

    return (
      <div className="space-y-1.5">
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl border ${
            isMe
              ? "bg-black/25 border-white/10 text-white"
              : "bg-slate-200/90 border-slate-300/80 text-slate-900"
          }`}
        >
          <div
            className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
              isMe ? "bg-[#00c9a7]/20 text-[#00e5c0]" : "bg-[#00c9a7]/20 text-[#0f766e]"
            }`}
          >
            <FileText className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" title={fileName}>
              {fileName}
            </p>
            <p className={`text-[10px] ${isMe ? "text-white/60" : "text-slate-500"}`}>
              {fileSize} • Consignment Document
            </p>
          </div>
        </div>
        {caption && (
          <p
            className={`whitespace-pre-wrap text-[13px] leading-relaxed font-normal ${
              isMe ? "text-white" : "text-[#0f172a]"
            }`}
          >
            {caption}
          </p>
        )}
      </div>
    );
  }

  const isUrl = /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/");
  if (!isUrl) {
    return (
      <p className={`whitespace-pre-wrap text-[13px] leading-relaxed font-normal ${isMe ? "text-white" : "text-[#0f172a]"}`}>
        {content}
      </p>
    );
  }

  const url = resolveAttachmentUrl(trimmed);
  const isPdf = /\.pdf(\?.*)?$/i.test(url) || url.toLowerCase().includes(".pdf");
  const isImage = !isPdf && /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(url);

  // ইমেজ হলে প্রিভিউ দেখাবে
  if (isImage) {
    return (
      <div className="mt-1 space-y-1.5">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-white/10 hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Cargo Attachment" className="max-w-[240px] sm:max-w-xs max-h-56 object-cover rounded-xl" />
        </a>
      </div>
    );
  }

  // PDF বা অন্য ডকুমেন্ট হলে ফাইল কার্ড ও ব্রাউজারে ওপেন করার বাটন দেখাবে
  const rawFileName = url.split("/").pop()?.split("?")[0] || (isPdf ? "cargo_document.pdf" : "cargo_document");
  const fileName = decodeURIComponent(rawFileName);

  return (
    <div className="mt-1">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
          isMe
            ? "bg-white/10 hover:bg-white/15 border-white/20 text-white"
            : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
        }`}
      >
        <div className={`p-2 rounded-lg ${isPdf ? "bg-rose-500/20 text-rose-400" : "bg-teal-500/20 text-teal-400"}`}>
          <FileText className="size-5 shrink-0" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate">{fileName}</p>
          <p className="text-[10px] opacity-70">
            {isPdf ? "PDF Document • Click to view in browser" : "Document • Click to download"}
          </p>
        </div>
        <ExternalLink className="size-4 shrink-0 opacity-70 hover:opacity-100" />
      </a>
    </div>
  );
}

export function ShipmentChatModal({
  isOpen,
  onClose,
  shipmentId,
  trackingId,
  status,
  shipmentStatus,
  routeTitle,
  counterpartyName,
  counterpartyRole,
  counterpartyPhone,
  counterpartyEmail,
}: ShipmentChatModalProps): React.JSX.Element | null {
  const { user } = useAuthStore();
  const [input, setInput] = useState<string>("");
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveStatus = shipmentStatus || status;

  const {
    conversation,
    messages,
    isLoading,
    isSending,
    isCounterpartyTyping,
    error,
    isConnected,
    isChatClosed,
    sendMessage,
    editMessage,
    sendTyping,
    reloadMessages,
  } = useShipmentChat({
    shipmentId: isOpen ? shipmentId : undefined,
    shipmentStatus: effectiveStatus,
    autoJoin: isOpen,
  });

  const isClosed =
    isChatClosed ||
    effectiveStatus === "DELIVERED" ||
    conversation?.shipment?.status === "DELIVERED";

  const isAdmin = user?.role === "ADMIN";

  const [editingMessage, setEditingMessage] = useState<IChatMessage | null>(null);

  // If chat is closed, cancel any active edit state
  useEffect(() => {
    if (isClosed && editingMessage) {
      setEditingMessage(null);
      setInput("");
    }
  }, [isClosed, editingMessage]);

  const startEditing = (message: IChatMessage): void => {
    setEditingMessage(message);
    setInput(message.content);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const cancelEditing = (): void => {
    setEditingMessage(null);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Escape" && editingMessage) {
      e.preventDefault();
      cancelEditing();
    }
  };

  // Auto-scroll inside chat messages container
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isCounterpartyTyping, isOpen]);

  // Focus input field on modal open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (isClosed) {
      toast.error(
        isAdmin
          ? "Successfully Delivered. Chat is closed."
          : "Your shipment already delivered. Chat is closed."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 10MB limit enforcement
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File size exceeds 10MB limit. Maximum allowed size is 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!conversation?.id) {
      toast.error("Conversation is not active yet. Please wait...");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name} (max 10MB)...`);
    try {
      setIsUploadingFile(true);
      await chatService.uploadAttachment(conversation.id, file);
      toast.dismiss(toastId);
      toast.success("File uploaded successfully");
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const msg = getErrorMessage(err, "Failed to upload file");
      toast.error(msg);
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isClosed) {
      toast.error(
        isAdmin
          ? "Successfully Delivered. Chat is closed."
          : "Your shipment already delivered. Chat is closed."
      );
      return;
    }

    const trimmed = input.trim();
    if (!trimmed || isSending || isUploadingFile) return;

    if (editingMessage) {
      const msgToEdit = editingMessage;
      cancelEditing();
      try {
        await editMessage(msgToEdit.id, trimmed);
        toast.success("Message updated");
      } catch {
        startEditing(msgToEdit);
      }
      return;
    }

    setInput("");
    try {
      await sendMessage(trimmed);
    } catch {
      setInput(trimmed);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
    sendTyping();
  };

  // Determine counterparty & participant information
  const isCustomer = user?.role === "CUSTOMER";
  const isAgent = user?.role === "AGENT";
  const agentInfo = conversation?.agent;
  const customerInfo = conversation?.customer;

  const displayCounterparty =
    counterpartyName ||
    (isCustomer ? agentInfo?.name || "Assigned Carrier Agent" : customerInfo?.name || "Consignment Shipper");

  const displayCounterpartyRole =
    counterpartyRole ||
    (isCustomer ? "Carrier Agent" : isAgent ? "Consignment Shipper" : "User");

  const currentUserName = user?.name || (isCustomer ? "You (Shipper)" : "You (Agent)");

  const displayEmail =
    counterpartyEmail ||
    (isCustomer
      ? agentInfo?.email || "agent@freightagent.io"
      : customerInfo?.email || "customer@freightagent.io");

  const effectiveTracking =
    trackingId || conversation?.shipment?.trackingId || shipmentId;
  const effectiveRoute =
    routeTitle ||
    (conversation?.shipment?.origin && conversation?.shipment?.destination
      ? `${conversation.shipment.origin} → ${conversation.shipment.destination}`
      : "Freight Consignment");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
      className="p-0 overflow-hidden bg-[#091b1b]/95 border border-white/15 rounded-[28px] sm:rounded-[32px] shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[92vh] h-[670px] flex flex-col relative"
      contentClassName="flex-1 min-h-0 flex flex-col overflow-hidden p-0"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 size-80 rounded-full bg-[#00c9a7]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-[#0077b6]/10 blur-3xl" />

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER: PROMINENT PARTICIPANT NAMES & STATUS (Call/Video Removed)
          ───────────────────────────────────────────────────────────── */}
      <div className="shrink-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="rounded-2xl sm:rounded-full bg-[#143333]/90 text-white border border-white/10 backdrop-blur-xl px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Counterparty Avatar with glowing online status */}
            <div className="relative shrink-0">
              <div className="size-10 rounded-full bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
                {displayCounterparty.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 border-2 border-[#143333]" />
            </div>

            {/* Names & Live Typing status */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {displayCounterparty}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30 shrink-0">
                  {displayCounterpartyRole}
                </span>
              </div>

              {/* Status: typing... vs Online */}
              {isCounterpartyTyping ? (
                <p className="text-[11px] sm:text-xs text-[#00e5c0] font-semibold flex items-center gap-1.5 mt-0.5 animate-pulse">
                  <span className="inline-block size-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                  <span>typing...</span>
                </p>
              ) : (
                <p className="text-[10px] sm:text-[11px] text-white/60 truncate mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                  <span>Online • {displayEmail}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Refresh & Close (Call & Video Call removed) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              shape="pill"
              onClick={() => void reloadMessages()}
              title="Refresh messages"
              aria-label="Refresh messages"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              shape="pill"
              onClick={onClose}
              title="Close Chat"
              aria-label="Close Chat"
              className="text-white/70 hover:text-rose-400 hover:bg-rose-500/20"
            >
              <X className="size-4.5" />
            </Button>
          </div>
        </div>

        {/* Secondary Sub-strip: Shows both Chat Participants & Consignment Context */}
        <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-[#7ecfc4]/90 bg-[#102d2d]/60 rounded-xl mt-1.5 border border-white/5">
          <div className="flex items-center gap-1.5 truncate">
            <Users className="size-3 text-[#00c9a7] shrink-0" />
            <span className="text-white/50 text-[10px] sm:text-[11px]">Chatting:</span>
            <span className="font-semibold text-white/95 text-[10px] sm:text-[11px] truncate">{currentUserName}</span>
            <span className="text-[#00c9a7] font-bold">↔</span>
            <span className="font-semibold text-[#00e5c0] text-[10px] sm:text-[11px] truncate">{displayCounterparty}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pl-2">
            <span className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
              <Package className="size-3 text-[#00c9a7] shrink-0" />
              <span className="text-[#00e5c0] font-bold">
                {effectiveTracking.includes("-") && effectiveTracking.length > 20
                  ? "Consignment"
                  : `#${effectiveTracking}`}
              </span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] text-white/60">
              <MapPin className="size-3 text-[#00c9a7] shrink-0" />
              <span className="truncate max-w-[140px]">{effectiveRoute}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Offline indicator banner */}
      {!isConnected && (
        <div className="shrink-0 mx-4 mt-2 bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-1 text-center text-[11px] text-amber-300">
          Reconnecting to live socket... Messages will send via REST fallback.
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MESSAGE CANVAS (Scrollable Middle Section with Sleek Scrollbar)
          ───────────────────────────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 space-y-3.5 chat-sleek-scrollbar relative z-10"
      >
        {/* Centered Date Badge */}
        <div className="flex justify-center my-1">
          <span className="rounded-full bg-white/10 border border-white/10 px-3.5 py-0.5 text-[11px] font-medium text-white/70 backdrop-blur-md shadow-xs">
            Today
          </span>
        </div>

        {isLoading && messages.length === 0 && (
          <div className="pt-2">
            <ChatMessagesSkeleton count={5} />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#143333]/70 text-[#00c9a7] border border-white/10 mb-3 shadow-inner">
              <Package className="size-7" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Direct Consignment Dispatch Channel
            </h4>
            <p className="text-xs text-white/60 max-w-xs mt-1 leading-relaxed">
              Real-time communication between {currentUserName} and {displayCounterparty}. You can send messages and upload documents or cargo photos (max 10MB).
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = user?.id && msg.senderId === user.id;
          const senderName = msg.sender?.name || (isMe ? currentUserName : displayCounterparty);
          const senderAvatar =
            msg.sender?.image ||
            msg.sender?.avatar ||
            (isMe
              ? user?.image || user?.avatar
              : conversation?.agent?.avatar || conversation?.customer?.avatar);
          const senderRole =
            msg.sender?.role || (isMe ? user?.role || "YOU" : displayCounterpartyRole);
          const initials = (senderName || "U").slice(0, 2).toUpperCase();

          return (
            <div
              key={msg.id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[78%]">
                  {/* Counterparty Profile image or Initials avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {senderAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={senderAvatar}
                        alt={senderName}
                        className="size-8 rounded-full object-cover border border-white/10 shadow-xs"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs flex items-center justify-center shadow-xs">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    {/* Name & Role tag */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-bold text-white/90 truncate">{senderName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md font-semibold bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30">
                        {senderRole}
                      </span>
                    </div>

                    {/* Incoming message bubble */}
                    <div className="rounded-[22px] rounded-tl-xs bg-[#eaeff2] text-[#0f172a] px-4 py-2.5 shadow-md">
                      {renderChatContent(msg.content, false)}
                      <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-500 font-mono">
                        <span>{formatTimeOnly(msg.createdAt)}</span>
                        {msg.isEdited && (
                          <span
                            className="italic text-[9px] text-teal-700 font-medium"
                            title={msg.updatedAt ? `Edited at ${formatTimeOnly(msg.updatedAt)}` : "Edited"}
                          >
                            (edited)
                          </span>
                        )}
                        <Check className="size-3 text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isMe && (
                <div className="flex items-start justify-end gap-2.5 max-w-[85%] sm:max-w-[78%] group">
                  <div className="min-w-0 flex flex-col items-end">
                    {/* Name & Role tag */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md font-semibold bg-white/10 text-white/70 border border-white/10">
                        {user?.role || "YOU"}
                      </span>
                      <span className="text-[11px] font-bold text-teal-300 truncate">{currentUserName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit button: shown on hover if not attachment and not closed */}
                      {!isAttachmentContent(msg.content) && !isClosed && (
                        <button
                          type="button"
                          onClick={() => startEditing(msg)}
                          title="Edit message"
                          aria-label="Edit message"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-lg text-white/50 hover:text-[#00e5c0] hover:bg-white/10 cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      )}

                      {/* Outgoing message bubble: dark frosted teal capsule */}
                      <div className="rounded-[22px] rounded-br-xs bg-[#143232]/95 border border-white/10 text-white px-4 py-2.5 shadow-md">
                        {renderChatContent(msg.content, true)}
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-teal-300/80 font-mono">
                          <span>{formatTimeOnly(msg.createdAt)}</span>
                          {msg.isEdited && (
                            <span
                              className="italic text-[9px] text-[#00e5c0] font-medium"
                              title={msg.updatedAt ? `Edited at ${formatTimeOnly(msg.updatedAt)}` : "Edited"}
                            >
                              (edited)
                            </span>
                          )}
                          {msg.isRead ? (
                            <CheckCheck className="size-3 text-[#00e5c0]" />
                          ) : (
                            <Check className="size-3 text-teal-300/80" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current user Profile image or Initials avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {senderAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={senderAvatar}
                        alt={currentUserName}
                        className="size-8 rounded-full object-cover border border-[#00c9a7]/30 shadow-xs"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-linear-to-tr from-[#0077b6] to-[#00c9a7] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isCounterpartyTyping && (
          <div className="flex items-start gap-2 max-w-[80%] animate-in fade-in duration-200">
            <div className="rounded-[22px] rounded-tl-xs bg-[#eaeff2] border border-slate-200/50 text-[#0f172a] px-4 py-2.5 shadow-md flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-0.5">
                <span className="size-2 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.32s]" />
                <span className="size-2 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.16s]" />
                <span className="size-2 rounded-full bg-[#00c9a7] animate-bounce" />
              </div>
              <span className="text-[11px] text-slate-600 font-medium italic">
                {displayCounterparty} is typing...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-950/40 border border-red-500/50 p-2.5 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Editing Mode Banner */}
      {editingMessage && (
        <div className="shrink-0 z-20 mx-3 sm:mx-4 -mb-2 px-4 py-1.5 rounded-t-2xl bg-[#143232] border-t border-x border-[#00c9a7]/40 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-[#00e5c0] min-w-0">
            <Pencil className="size-3.5 shrink-0" />
            <span className="font-semibold text-[11px] truncate">
              Editing message: <span className="text-white/80 font-normal italic">&quot;{editingMessage.content.slice(0, 35)}...&quot;</span>
            </span>
          </div>
          <button
            type="button"
            onClick={cancelEditing}
            className="text-white/60 hover:text-rose-400 text-[11px] font-medium flex items-center gap-1 shrink-0 ml-2 cursor-pointer transition-colors"
          >
            <span>Cancel</span>
            <span className="text-[10px] text-white/40">(Esc)</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. INPUT BAR OR LOCKED READ-ONLY BANNER
          ───────────────────────────────────────────────────────────── */}
      {isClosed ? (
        <div className="shrink-0 z-20 m-3 sm:m-4 rounded-2xl bg-gray-900 border border-gray-800 p-3 sm:p-4 text-center shadow-xl">
          <p className="text-xs sm:text-sm text-amber-400 font-medium flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>
              {isAdmin
                ? "Successfully Delivered. Chat is closed."
                : "Your shipment already delivered. Chat is closed."}
            </span>
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`shrink-0 z-20 m-3 sm:m-4 ${
            editingMessage ? "rounded-b-full rounded-t-lg mt-0" : "rounded-full"
          } bg-[#143232]/90 border border-white/15 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 shadow-2xl transition-all`}
        >
          {/* Hidden file input strictly allowing documents and images up to 10MB */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
            className="hidden"
            disabled={isSending || isUploadingFile || !!editingMessage}
          />

          {/* Paperclip Button for file upload max 10MB */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile || isSending || !!editingMessage}
            className="text-white/70 hover:text-[#00c9a7] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/5 shrink-0 disabled:opacity-30"
            title="Upload cargo manifest or document (Max 10MB)"
            aria-label="Upload document or image"
          >
            {isUploadingFile ? (
              <Loader2 className="size-4.5 animate-spin text-[#00c9a7]" />
            ) : (
              <Paperclip className="size-4.5" />
            )}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessage
                ? "Edit your message... (Enter to save, Esc to cancel)"
                : "Type your message here..."
            }
            maxLength={2000}
            disabled={isSending || isUploadingFile}
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-hidden py-0.5"
          />

          {/* Send message button */}
          <Button
            type="submit"
            variant="gradient"
            size="icon"
            shape="pill"
            disabled={!input.trim() || isSending || isUploadingFile}
            isLoading={isSending}
            title={editingMessage ? "Save edit" : "Send message"}
            className="size-9 shrink-0 shadow-md shadow-[#00c9a7]/30 text-[#0a0f0f] font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            aria-label={editingMessage ? "Save edit" : "Send message"}
          >
            {editingMessage ? (
              <Check className="size-4 text-[#0a0f0f] stroke-[2.5]" />
            ) : (
              <Send className="size-4 text-[#0a0f0f]" />
            )}
          </Button>
        </form>
      )}
    </Modal>
  );
}

export default ShipmentChatModal;
