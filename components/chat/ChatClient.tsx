"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Loader2,
  Package,
  RotateCcw,
  Paperclip,
  FileText,
  Download,
  ExternalLink,
  Check,
  CheckCheck,
  ArrowLeft,
  Pencil,
  Maximize2,
  X,
} from "lucide-react";
import { useConversationsList } from "@/hooks/useConversationsList";
import { useShipmentChat } from "@/hooks/useShipmentChat";
import { useAuthStore } from "@/app/store/authStore";
import { IConversation, IConversationMessage } from "@/app/types/chat.types";
import { chatService } from "@/app/services/chat.service";
import { getErrorMessage } from "@/app/errorHelper/appError";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChatMessagesSkeleton, ConversationListSkeleton } from "./ChatSkeleton";
import { envConfig } from "@/app/config/env";
import { MessageReceiptTicks } from "./MessageReceiptTicks";

function isAttachmentContent(content?: string | null): boolean {
  if (!content) return false;
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

/**
 * Format timestamp to match reference UI:
 * "Today, 2:45pm", "Yesterday, 12:05pm", or "Sep 26, 2:45pm"
 */
function formatChatTimestamp(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
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

function renderChatContent(
  msg: IConversationMessage,
  isMe: boolean,
  onImageClick?: (url: string, name?: string) => void
): React.JSX.Element {
  const content = msg.content || "";
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
            className={`whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed font-normal ${
              isMe ? "text-white/95" : "text-[#0d2626]"
            }`}
          >
            {caption}
          </p>
        )}
      </div>
    );
  }

  // Direct FILE message or attachmentUrl
  const hasAttachment = msg.type === "FILE" || Boolean(msg.attachmentUrl);
  if (hasAttachment || /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    const rawUrl = msg.attachmentUrl || trimmed;
    const url = resolveAttachmentUrl(rawUrl);
    const isPdf = /\.pdf(\?.*)?$/i.test(url) || url.toLowerCase().includes(".pdf");
    const isImage = !isPdf && /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(url);
    const fileName =
      msg.attachmentName ||
      decodeURIComponent(url.split("/").pop()?.split("?")[0] || (isPdf ? "cargo_doc.pdf" : "attachment"));

    // Image preview
    if (isImage) {
      return (
        <div className="mt-1 space-y-1.5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onImageClick?.(url, fileName)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onImageClick?.(url, fileName);
              }
            }}
            className="group relative block overflow-hidden rounded-xl border border-white/10 hover:opacity-95 transition-opacity cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={fileName}
              className="max-w-60 sm:max-w-xs max-h-56 object-cover rounded-xl transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
              <Maximize2 className="size-4 text-[#00e5c0]" />
              <span>Zoom</span>
            </div>
          </div>
          {msg.content && msg.content !== rawUrl && !isAttachmentContent(msg.content) && (
            <p className={`whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed font-normal ${isMe ? "text-white/95" : "text-[#0d2626]"}`}>
              {msg.content}
            </p>
          )}
        </div>
      );
    }

    // PDF / Doc card
    return (
      <div className="mt-1 space-y-1.5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download={fileName}
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
        {msg.content && msg.content !== rawUrl && !isAttachmentContent(msg.content) && (
          <p className={`whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed font-normal ${isMe ? "text-white/95" : "text-[#0d2626]"}`}>
            {msg.content}
          </p>
        )}
      </div>
    );
  }

  return (
    <p
      className={`whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed font-normal ${
        isMe ? "text-white/95" : "text-[#0d2626]"
      }`}
    >
      {content}
    </p>
  );
}

export function ChatClient() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title?: string } | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load all user conversations
  const {
    conversations,
    isLoading: isLoadingConversations,
    refreshConversations,
  } = useConversationsList(selectedConversation?.id);

  // Set default selected conversation once loaded on desktop
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setSelectedConversation(conversations[0]);
      }
    }
  }, [conversations, selectedConversation]);

  // Hook for the currently selected conversation
  const {
    messages,
    isLoading: isLoadingMessages,
    isLoadingOlder,
    hasMoreOlder,
    isSending,
    isCounterpartyTyping,
    isChatClosed,
    sendMessage,
    retrySendMessage,
    editMessage,
    sendTyping,
    loadOlderMessages,
    reloadMessages,
  } = useShipmentChat({
    conversationId: selectedConversation?.id,
    shipmentStatus: selectedConversation?.shipment?.status,
    autoJoin: !!selectedConversation?.id,
  });

  const safeMessages = Array.isArray(messages) ? messages : [];

  const isClosed =
    isChatClosed || selectedConversation?.shipment?.status === "DELIVERED";

  const [editingMessage, setEditingMessage] = useState<IConversationMessage | null>(null);

  // If chat is closed, cancel any active edit state
  useEffect(() => {
    if (isClosed && editingMessage) {
      setEditingMessage(null);
      setInput("");
    }
  }, [isClosed, editingMessage]);

  const startEditing = (message: IConversationMessage): void => {
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

  // Cursor pagination: scroll near top to load older messages
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (target.scrollTop < 60 && hasMoreOlder && !isLoadingOlder) {
        void loadOlderMessages();
      }
    },
    [hasMoreOlder, isLoadingOlder, loadOlderMessages]
  );

  // Safe internal auto-scroll that only scrolls the message list
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [safeMessages, isCounterpartyTyping]);

  const isCustomer = user?.role === "CUSTOMER";

  // Helper to extract clean Name & Email (No IDs)
  const getCounterpartyInfo = (conv?: IConversation | null) => {
    if (!conv) {
      return {
        name: "Direct Contact",
        email: "",
      };
    }
    if (isCustomer) {
      return {
        name: conv.agent?.name || "Carrier Agent",
        email: conv.agent?.email || "agent@freightagent.io",
      };
    }
    return {
      name: conv.customer?.name || "Customer",
      email: conv.customer?.email || "customer@freightagent.io",
    };
  };

  // Filter conversations by Name or Email only (clean user-friendly search)
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const info = getCounterpartyInfo(c);
      return (
        info.name.toLowerCase().includes(q) ||
        info.email.toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (isClosed) {
      toast.error("This shipment has been delivered. Chat is no longer active.");
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

    if (!selectedConversation?.id) {
      toast.error("Please select a conversation first.");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name} (max 10MB)...`);
    try {
      setIsUploadingFile(true);
      await chatService.uploadAttachment(selectedConversation.id, file);
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (isClosed) {
      toast.error("This shipment has been delivered. Chat is no longer active.");
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

  const selectedCounterparty = selectedConversation
    ? getCounterpartyInfo(selectedConversation)
    : { name: "", email: "" };

  const currentUserName = user?.name || (isCustomer ? "You (Customer)" : "You (Agent)");
  const counterpartyRole = isCustomer ? "Carrier Agent" : "Consignment Customer";

  return (
    <>
      <div className="relative w-full rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#091b1b]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row h-[calc(100vh-165px)] min-h-130 max-h-185">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-[#00c9a7]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-[#0077b6]/10 blur-3xl" />

        {/* ─────────────────────────────────────────────────────────────
            1. CONVERSATION SIDEBAR
            ───────────────────────────────────────────────────────────── */}
        <div
          className={`flex flex-col border-r border-white/10 bg-[#0e2626]/75 backdrop-blur-md z-10 ${
            selectedConversation
              ? "hidden md:flex md:w-72.5 lg:w-[320px]"
              : "w-full md:w-72.5 lg:w-[320px]"
          } shrink-0`}
        >
          {/* Search Header */}
          <div className="p-3.5 space-y-2.5 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-[#00c9a7]" />
                <h2 className="text-sm font-bold text-white tracking-wide">Messages</h2>
              </div>
              <button
                onClick={() => void refreshConversations()}
                title="Refresh inbox"
                className="p-1.5 text-white/60 hover:text-[#00c9a7] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>

            {/* Capsule Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#00c9a7]/60 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div className="grow overflow-y-auto p-2.5 flex flex-col gap-1.5 chat-sleek-scrollbar">
            {isLoadingConversations && conversations.length === 0 && (
              <ConversationListSkeleton count={5} />
            )}

            {!isLoadingConversations && filteredConversations.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-xs text-white/60">
                  {searchQuery ? "No matching contacts found." : "No active conversations yet."}
                </p>
              </div>
            )}

            {filteredConversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;
              const counterparty = getCounterpartyInfo(conv);
              const unread = conv.unreadCount || 0;
              const timeFormatted = formatChatTimestamp(conv.lastMessageAt);
              const isConvDelivered = conv.shipment?.status === "DELIVERED";

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left px-3 py-2 rounded-2xl transition-all flex items-center gap-2.5 outline-hidden cursor-pointer border ${
                    isSelected
                      ? "bg-[#1c4545]/90 border-[#00c9a7]/50 shadow-md shadow-black/25"
                      : "bg-[#143232]/50 border-white/5 hover:bg-[#193e3e]/70"
                  }`}
                >
                  {/* Compact Circular Avatar with status ring */}
                  <div className="relative shrink-0">
                    <div className="size-8.5 rounded-full bg-linear-to-tr from-[#00c9a7] to-[#0077b6] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {counterparty.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 border-2 border-[#143232]" />
                  </div>

                  {/* Name & Only Email */}
                  <div className="grow min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">
                        {counterparty.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {isConvDelivered && (
                          <span className="text-[9px] px-1 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                            🔒 Closed
                          </span>
                        )}
                        <span className="text-[10px] text-white/50 font-medium">
                          {timeFormatted || "Today"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className="text-[11px] text-[#7ecfc4]/90 truncate font-mono"
                        title={counterparty.email}
                      >
                        {counterparty.email}
                      </p>

                      {unread > 0 ? (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#0a1f1f] border border-[#00c9a7] text-[9px] font-bold text-[#00e5c0]">
                          {unread}
                        </span>
                      ) : (
                        <CheckCheck className="size-3 text-white/30 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. RIGHT MAIN CHAT AREA
            ───────────────────────────────────────────────────────────── */}
        <div
          className={`flex flex-col grow bg-[#081818]/90 z-10 ${
            !selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Header: Name & Email, Refresh History */}
              <div className="m-2.5 sm:m-3 rounded-2xl bg-[#143333]/85 border border-white/10 backdrop-blur-md px-3.5 py-2 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    shape="pill"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden text-white/70 hover:text-white"
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>

                  {/* Avatar with online pulse */}
                  <div className="relative shrink-0">
                    <div className="size-9 rounded-full bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs flex items-center justify-center shadow-xs">
                      {selectedCounterparty.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 border-2 border-[#143333]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {selectedCounterparty.name}
                      </h3>
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30 shrink-0">
                        {counterpartyRole}
                      </span>
                      {isClosed && (
                        <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 flex items-center gap-1">
                          <span>🔒</span>
                          <span>Closed</span>
                        </span>
                      )}
                    </div>

                    {/* Status: typing... vs Online */}
                    {isCounterpartyTyping ? (
                      <p className="text-[11px] text-[#00e5c0] font-semibold flex items-center gap-1.5 mt-0.5 animate-pulse">
                        <span className="inline-block size-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                        <span>typing...</span>
                      </p>
                    ) : (
                      <p className="text-[10px] sm:text-[11px] text-white/60 truncate mt-0.5 flex items-center gap-1.5">
                        <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                        <span>Online • {selectedCounterparty.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Refresh History */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-white/70">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    shape="pill"
                    onClick={() => void reloadMessages()}
                    title="Refresh Conversation History"
                    aria-label="Refresh Conversation History"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <RotateCcw className="size-3.5 sm:size-4" />
                  </Button>
                </div>
              </div>

              {/* Sub-strip displaying both participants: current user & counterparty */}
              <div className="mx-2.5 sm:mx-3 mb-1 px-3 py-1 text-[10px] sm:text-[11px] text-[#7ecfc4]/90 bg-[#102d2d]/60 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-white/50 text-[10px] sm:text-[11px]">Chatting:</span>
                  <span className="font-semibold text-white/95 text-[10px] sm:text-[11px] truncate">
                    {currentUserName}
                  </span>
                  <span className="text-[#00c9a7] font-bold">↔</span>
                  <span className="font-semibold text-[#00e5c0] text-[10px] sm:text-[11px] truncate">
                    {selectedCounterparty.name}
                  </span>
                </div>

                {selectedConversation.shipment?.trackingId && (
                  <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-[#00e5c0] shrink-0 pl-2">
                    <Package className="size-3 text-[#00c9a7]" />
                    <span>#{selectedConversation.shipment.trackingId}</span>
                  </div>
                )}
              </div>

              {/* Message Thread Canvas */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="grow overflow-y-auto px-3 sm:px-5 py-3 space-y-3 chat-sleek-scrollbar relative"
              >
                {/* Older messages loader */}
                {isLoadingOlder && (
                  <div className="flex justify-center py-1">
                    <Loader2 className="size-4 animate-spin text-[#00c9a7]" />
                  </div>
                )}

                {isLoadingMessages && safeMessages.length === 0 && (
                  <div className="pt-2">
                    <ChatMessagesSkeleton count={5} />
                  </div>
                )}

                {!isLoadingMessages && safeMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#143333]/60 text-[#00c9a7] border border-white/10 mb-2.5">
                      <Package className="size-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Direct Message Channel</h4>
                    <p className="text-xs text-white/60 max-w-xs mt-1">
                      Send a direct message or upload a consignment document (max 10MB) for {selectedCounterparty.name}.
                    </p>
                  </div>
                )}

                {safeMessages.map((msg) => {
                  if (!msg) return null;
                  const isMe = user?.id && msg.senderId === user.id;
                  const senderName =
                    msg.sender?.name || (isMe ? currentUserName : selectedCounterparty.name);
                  const senderAvatar =
                    msg.sender?.image ||
                    msg.sender?.avatar ||
                    (isMe
                      ? user?.image || user?.avatar
                      : selectedConversation?.agent?.avatar ||
                        selectedConversation?.customer?.avatar);
                  const senderRole =
                    msg.sender?.role || (isMe ? user?.role || "YOU" : counterpartyRole);
                  const initials = (senderName || "U").slice(0, 2).toUpperCase();
                  const canEdit =
                    isMe &&
                    !isClosed &&
                    msg.type !== "FILE" &&
                    !msg.attachmentUrl &&
                    !isAttachmentContent(msg.content);

                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
                          {/* Avatar */}
                          <div className="relative shrink-0 mt-0.5">
                            {senderAvatar ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={senderAvatar}
                                alt={senderName}
                                className="size-7.5 rounded-full object-cover border border-white/10 shadow-xs"
                              />
                            ) : (
                              <div className="size-7.5 rounded-full bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-[10px] flex items-center justify-center shadow-xs">
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
                            <div className="rounded-[20px] rounded-tl-1 bg-[#ebf4f2] text-[#0d2626] px-3.5 py-2 shadow-md shadow-black/10">
                              {renderChatContent(msg, false, (url, name) =>
                                setPreviewImage({ url, title: name })
                              )}
                              <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-[#4d7572]">
                                <span>{formatTimeOnly(msg.createdAt)}</span>
                                {msg.isEdited && (
                                  <span
                                    className="italic text-[9px] text-teal-700 font-medium"
                                    title={msg.updatedAt ? `Edited at ${formatTimeOnly(msg.updatedAt)}` : "Edited"}
                                  >
                                    (edited)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isMe && (
                        <div className="flex items-start justify-end gap-2.5 max-w-[85%] sm:max-w-[75%] group">
                          <div className="min-w-0 flex flex-col items-end">
                            {/* Name & Role tag */}
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md font-semibold bg-white/10 text-white/70 border border-white/10">
                                {user?.role || "YOU"}
                              </span>
                              <span className="text-[11px] font-bold text-teal-300 truncate">{currentUserName}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Edit button: shown on hover if text-only and not closed */}
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => startEditing(msg)}
                                  title="Edit message"
                                  aria-label="Edit message"
                                  className="group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded-md text-white/50 hover:text-[#00e5c0] hover:bg-white/10 cursor-pointer"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                              )}

                              {/* Outgoing message bubble: dark frosted teal capsule */}
                              <div className="rounded-[20px] rounded-br-1 bg-[#163838]/95 border border-white/10 text-white px-3.5 py-2 shadow-md shadow-black/20">
                                {renderChatContent(msg, true, (url, name) =>
                                  setPreviewImage({ url, title: name })
                                )}
                                <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-[#7ecfc4]/80">
                                  <span>{formatTimeOnly(msg.createdAt)}</span>
                                  {msg.isEdited && (
                                    <span
                                      className="italic text-[9px] text-[#00e5c0] font-medium"
                                      title={msg.updatedAt ? `Edited at ${formatTimeOnly(msg.updatedAt)}` : "Edited"}
                                    >
                                      (edited)
                                    </span>
                                  )}
                                  <MessageReceiptTicks message={msg} onRetry={retrySendMessage} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Current User Avatar */}
                          <div className="relative shrink-0 mt-0.5">
                            {senderAvatar ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={senderAvatar}
                                alt={currentUserName}
                                className="size-7.5 rounded-full object-cover border border-[#00c9a7]/30 shadow-xs"
                              />
                            ) : (
                              <div className="size-7.5 rounded-full bg-linear-to-tr from-[#0077b6] to-[#00c9a7] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
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
                    <div className="rounded-[20px] rounded-tl-xs bg-[#ebf4f2] border border-slate-200/50 text-[#0d2626] px-3.5 py-2 shadow-md flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-0.5">
                        <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.32s]" />
                        <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.16s]" />
                        <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-[#4d7572] font-medium italic">
                        {selectedCounterparty.name} is typing...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Bar or Read-Only Locked Banner */}
              {isClosed ? (
                <div className="m-2.5 sm:m-3 shrink-0 rounded-2xl bg-gray-900 border border-gray-800 p-3 sm:p-3.5 text-center shadow-md">
                  <p className="text-xs sm:text-sm text-gray-400 font-medium flex items-center justify-center gap-2">
                    <span>🔒</span>
                    <span>This shipment has been delivered. Chat is no longer active.</span>
                  </p>
                </div>
              ) : (
                <div className="m-2.5 sm:m-3 flex flex-col gap-1.5 shrink-0">
                  {/* Editing Mode Banner */}
                  {editingMessage && (
                    <div className="px-3.5 py-1.5 rounded-t-2xl bg-[#143232] border-t border-x border-[#00c9a7]/40 text-xs flex items-center justify-between shadow-lg">
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

                  <form
                    onSubmit={handleSubmit}
                    className={`rounded-full ${
                      editingMessage ? "rounded-t-lg" : ""
                    } bg-[#163939]/80 border border-white/10 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 shadow-xl transition-all`}
                  >
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                      className="hidden"
                      disabled={isSending || isUploadingFile || !!editingMessage}
                    />

                    {/* Paperclip Button for File Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending || isUploadingFile || !!editingMessage}
                      className="text-white/60 hover:text-[#00c9a7] transition-colors cursor-pointer p-1 shrink-0 disabled:opacity-30"
                      title="Upload cargo manifest or document (Max 10MB)"
                      aria-label="Upload cargo manifest or document"
                    >
                      {isUploadingFile ? (
                        <Loader2 className="size-4 animate-spin text-[#00c9a7]" />
                      ) : (
                        <Paperclip className="size-4" />
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
                      className="grow bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-hidden"
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
                      className="size-8 shrink-0 shadow-md shadow-[#00c9a7]/30 text-[#0a0f0f] font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                      aria-label={editingMessage ? "Save edit" : "Send message"}
                    >
                      {editingMessage ? (
                        <Check className="size-3.5 text-[#0a0f0f] stroke-[2.5]" />
                      ) : (
                        <Send className="size-3.5 text-[#0a0f0f]" />
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#143333]/60 text-[#00c9a7] border border-white/10 mb-2.5">
                <Package className="size-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Select a Contact</h3>
              <p className="text-xs text-white/60 max-w-xs mt-1">
                Choose a contact from the left list to review real-time messages and communicate with your shipper or agent.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="size-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage.url}
              alt={previewImage.title || "Full Preview"}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain border border-white/20 shadow-2xl"
            />
            {previewImage.title && (
              <p className="mt-3 text-xs sm:text-sm text-white/80 font-mono truncate max-w-md">
                {previewImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ChatClient;
