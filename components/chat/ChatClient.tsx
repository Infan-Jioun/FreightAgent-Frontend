"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Search,
  Send,
  Loader2,
  Package,
  RotateCcw,
  Phone,
  Video,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  Camera,
} from "lucide-react";
import { useConversationsList } from "@/hooks/useConversationsList";
import { useShipmentChat } from "@/hooks/useShipmentChat";
import { useAuthStore } from "@/app/store/authStore";
import { IConversation } from "@/app/types/chat.types";
import { toast } from "sonner";

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

export function ChatClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [input, setInput] = useState<string>("");

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    isSending,
    isCounterpartyTyping,
    isConnected,
    sendMessage,
    sendTyping,
    reloadMessages,
  } = useShipmentChat({
    conversationId: selectedConversation?.id,
    autoJoin: !!selectedConversation?.id,
  });

  // Safe internal auto-scroll that only scrolls the message list
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isCounterpartyTyping]);

  const isCustomer = user?.role === "CUSTOMER";

  // Helper to extract clean Name & Email (No IDs)
  const getCounterpartyInfo = (conv: IConversation) => {
    if (isCustomer) {
      return {
        name: conv.agent?.name || "Carrier Agent",
        email: conv.agent?.email || "agent@freightagent.io",
        phone: conv.agent?.phone || "",
      };
    }
    return {
      name: conv.customer?.name || "Customer",
      email: conv.customer?.email || "customer@freightagent.io",
      phone: conv.customer?.phone || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping();
  };

  const selectedCounterparty = selectedConversation
    ? getCounterpartyInfo(selectedConversation)
    : { name: "", email: "", phone: "" };

  const handlePhoneCall = () => {
    if (selectedCounterparty.phone) {
      window.location.href = `tel:${selectedCounterparty.phone}`;
      toast.success(`Calling ${selectedCounterparty.name}: ${selectedCounterparty.phone}`);
    } else {
      toast.info(`VoIP dispatch call requested for ${selectedCounterparty.name}`);
    }
  };

  const handleVideoCall = () => {
    if (selectedConversation?.shipment?.trackingId) {
      toast.success("Opening live radar inspection");
      router.push(`/tracking?id=${encodeURIComponent(selectedConversation.shipment.trackingId)}`);
    } else {
      toast.info("Live cargo checkpoint inspection stream initiated");
    }
  };

  return (
    <div className="relative w-full rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#091b1b]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row h-[calc(100vh-165px)] min-h-[520px] max-h-[740px]">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-[#00c9a7]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-[#0077b6]/10 blur-3xl" />

      {/* ─────────────────────────────────────────────────────────────
          1. CONVERSATION SIDEBAR (Name & only Email, compact height, No ID)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-col border-r border-white/10 bg-[#0e2626]/75 backdrop-blur-md z-10 ${
          selectedConversation
            ? "hidden md:flex md:w-[290px] lg:w-[320px]"
            : "w-full md:w-[290px] lg:w-[320px]"
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
              className="w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-[#00c9a7]/60 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="grow overflow-y-auto p-2.5 space-y-1.5 chat-sleek-scrollbar">
          {isLoadingConversations && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="size-5 animate-spin text-[#00c9a7] mb-2" />
              <p className="text-xs text-white/60">Loading conversations...</p>
            </div>
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

                {/* Name & Only Email (No ID shown, compact height) */}
                <div className="grow min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate">
                      {counterparty.name}
                    </span>
                    <span className="text-[10px] text-white/50 shrink-0 font-medium">
                      {timeFormatted || "Today"}
                    </span>
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
          2. RIGHT MAIN CHAT AREA (Speech bubbles + Floating capsule input)
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-col grow bg-[#081818]/90 z-10 ${
          !selectedConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Floating Frosted Capsule Header (Name & Email, No ID) */}
            <div className="m-2.5 sm:m-3 rounded-2xl bg-[#143333]/70 border border-white/10 backdrop-blur-md px-3.5 py-2 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-1 -ml-1 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft className="size-4" />
                </button>

                {/* Avatar with online pulse */}
                <div className="relative shrink-0">
                  <div className="size-9 rounded-full bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs flex items-center justify-center shadow-xs">
                    {selectedCounterparty.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 border-2 border-[#143333]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                    {selectedCounterparty.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-white/60 truncate">
                    {isCounterpartyTyping ? (
                      <span className="text-[#00e5c0] font-medium animate-pulse">typing...</span>
                    ) : (
                      <span>Online • {selectedCounterparty.email}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Phone, Video, Reload */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-white/70">
                <button
                  type="button"
                  onClick={handlePhoneCall}
                  title="Audio Dispatch Call"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <Phone className="size-3.5 sm:size-4" />
                </button>

                <button
                  type="button"
                  onClick={handleVideoCall}
                  title="Live Radar / Video Inspection"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <Video className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void reloadMessages()}
                  title="Refresh Conversation History"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="size-3.5 sm:size-4" />
                </button>
              </div>
            </div>

            {/* Offline socket indicator banner */}
            {!isConnected && (
              <div className="mx-3 mb-1.5 bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-1 text-center text-[10px] text-amber-300">
                Reconnecting to live socket... Messages will sync via REST fallback.
              </div>
            )}

            {/* Message Stream Canvas */}
            <div
              ref={messagesContainerRef}
              className="grow overflow-y-auto px-3.5 py-1.5 space-y-3 chat-sleek-scrollbar"
            >
              {/* Centered Date Badge */}
              <div className="flex justify-center my-1.5">
                <span className="rounded-full bg-white/10 border border-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-md shadow-xs">
                  Today
                </span>
              </div>

              {isLoadingMessages && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Loader2 className="size-5 animate-spin text-[#00c9a7] mb-2" />
                  <p className="text-xs text-white/60">Loading messages...</p>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = user?.id && msg.senderId === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div className="flex items-start gap-2 max-w-[82%] sm:max-w-[70%]">
                        {/* Incoming message bubble: light off-white frosted capsule */}
                        <div className="rounded-[20px] rounded-tl-[4px] bg-[#ebf4f2] text-[#0d2626] px-3.5 py-2 shadow-md shadow-black/10">
                          <p className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed font-normal">
                            {msg.content}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-[#4d7572]">
                            <span>{formatTimeOnly(msg.createdAt)}</span>
                            <Check className="size-2.5 text-[#4d7572]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {isMe && (
                      <div className="flex items-end justify-end w-full">
                        {/* Outgoing message bubble: dark frosted teal capsule */}
                        <div className="max-w-[82%] sm:max-w-[70%] rounded-[20px] rounded-br-[4px] bg-[#163838]/95 border border-white/10 text-white px-3.5 py-2 shadow-md shadow-black/20">
                          <p className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed font-normal text-white/95">
                            {msg.content}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-[#7ecfc4]/80">
                            <span>{formatTimeOnly(msg.createdAt)}</span>
                            {msg.isRead ? (
                              <CheckCheck className="size-2.5 text-[#00e5c0]" />
                            ) : (
                              <Check className="size-2.5 text-white/60" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator bubble */}
              {isCounterpartyTyping && (
                <div className="flex items-start gap-2 max-w-[80%] animate-in fade-in duration-200">
                  <div className="rounded-[20px] rounded-tl-[4px] bg-[#ebf4f2] text-[#0d2626] px-3 py-1.5 shadow-md flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.32s]" />
                      <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.16s]" />
                      <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce" />
                    </div>
                    <span className="text-[10px] text-[#4d7572] italic">
                      {selectedCounterparty.name} is typing...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Frosted Capsule Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="m-2.5 sm:m-3 rounded-full bg-[#163939]/80 border border-white/10 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 shadow-xl shrink-0"
            >
              <button
                type="button"
                onClick={() => toast.info("Emoji panel")}
                className="text-white/50 hover:text-white transition-colors cursor-pointer p-1"
                title="Insert emoji"
              >
                <Smile className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => toast.info("Document / cargo image upload")}
                className="text-white/50 hover:text-white transition-colors cursor-pointer p-1"
                title="Attach file"
              >
                <Paperclip className="size-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                maxLength={2000}
                disabled={isSending}
                className="grow bg-transparent text-xs text-white placeholder-white/40 focus:outline-hidden"
              />

              <button
                type="button"
                onClick={() => toast.info("Camera inspection ready")}
                className="text-white/50 hover:text-white transition-colors cursor-pointer p-1 hidden sm:block"
                title="Capture photo"
              >
                <Camera className="size-4" />
              </button>

              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-[#00c9a7] text-[#0a0f0f] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 outline-hidden shadow-md shadow-[#00c9a7]/30 cursor-pointer"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="size-3.5 animate-spin text-[#0a0f0f]" />
                ) : (
                  <Send className="size-3.5 text-[#0a0f0f]" />
                )}
              </button>
            </form>
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
  );
}

export default ChatClient;
