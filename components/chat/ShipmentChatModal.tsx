"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Send,
  Loader2,
  Package,
  RotateCcw,
  Check,
  CheckCheck,
  Phone,
  Video,
  Smile,
  Paperclip,
  Camera,
  MapPin,
} from "lucide-react";
import { useShipmentChat } from "@/hooks/useShipmentChat";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";

interface ShipmentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  trackingId?: string;
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

export function ShipmentChatModal({
  isOpen,
  onClose,
  shipmentId,
  trackingId,
  routeTitle,
  counterpartyName,
  counterpartyRole,
  counterpartyPhone,
  counterpartyEmail,
}: ShipmentChatModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [input, setInput] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    conversation,
    messages,
    isLoading,
    isSending,
    isCounterpartyTyping,
    error,
    isConnected,
    sendMessage,
    sendTyping,
    reloadMessages,
  } = useShipmentChat({
    shipmentId: isOpen ? shipmentId : undefined,
    autoJoin: isOpen,
  });

  // Safe internal auto-scroll that only scrolls the message list, never ancestor elements
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isCounterpartyTyping, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const content = input;
    setInput("");
    await sendMessage(content);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping();
  };

  // Determine counterparty info from props or conversation payload
  const effectiveTracking =
    trackingId || conversation?.shipment?.trackingId || shipmentId;
  const effectiveRoute =
    routeTitle ||
    (conversation?.shipment?.origin && conversation?.shipment?.destination
      ? `${conversation.shipment.origin} → ${conversation.shipment.destination}`
      : "Freight Consignment");

  const isCustomer = user?.role === "CUSTOMER";
  const agentInfo = conversation?.agent;
  const customerInfo = conversation?.customer;

  const displayCounterparty =
    counterpartyName ||
    (isCustomer ? agentInfo?.name || "Assigned Agent" : customerInfo?.name || "Consignment Customer");

  const displayPhone =
    counterpartyPhone || (isCustomer ? agentInfo?.phone : customerInfo?.phone);

  const displayEmail =
    counterpartyEmail ||
    (isCustomer
      ? agentInfo?.email || "agent@freightagent.io"
      : customerInfo?.email || "customer@freightagent.io");

  const handlePhoneCall = () => {
    if (displayPhone) {
      window.location.href = `tel:${displayPhone}`;
      toast.success(`Dialing ${displayCounterparty}: ${displayPhone}`);
    } else {
      toast.info(`VoIP dispatch call requested for ${displayCounterparty}`);
    }
  };

  const handleVideoCall = () => {
    if (effectiveTracking) {
      toast.success(`Opening live radar tracking inspection`);
      router.push(`/dashboard/customer/tracking?trackingId=${encodeURIComponent(effectiveTracking)}`);
    } else {
      toast.info("Live cargo checkpoint inspection stream initiated");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ─────────────────────────────────────────────────────────────
          OUTER FROSTED GLASS WINDOW (Fixed Height, Strictly Constrained)
          ───────────────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col w-full h-[660px] max-h-[92vh] sm:max-w-[620px] md:max-w-[660px] rounded-[28px] sm:rounded-[32px] border border-white/15 bg-[#091b1b]/95 backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-32 -right-32 size-80 rounded-full bg-[#00c9a7]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-[#0077b6]/10 blur-3xl" />

        {/* ─────────────────────────────────────────────────────────────
            1. FLOATING FROSTED CAPSULE HEADER (Pinned, shrink-0, Never Scrolls)
            Dark frosted glass matching dashboard theme with Name & only Email
            ───────────────────────────────────────────────────────────── */}
        <div className="shrink-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="rounded-2xl sm:rounded-full bg-[#143333]/85 text-white border border-white/10 backdrop-blur-xl px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Counterparty Avatar with glowing online status */}
              <div className="relative shrink-0">
                <div className="size-9 sm:size-10 rounded-full bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-black text-xs sm:text-sm flex items-center justify-center shadow-sm">
                  {displayCounterparty.slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 border-2 border-[#143333]" />
              </div>

              {/* Name & Only Email (Strictly no database IDs) */}
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {displayCounterparty}
                </h3>

                {isCounterpartyTyping ? (
                  <p className="text-[10px] sm:text-[11px] text-[#00e5c0] font-semibold flex items-center gap-1.5 mt-0.5 animate-pulse">
                    <span className="inline-block size-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                    typing...
                  </p>
                ) : (
                  <p className="text-[10px] sm:text-[11px] text-white/60 truncate mt-0.5">
                    Online • {displayEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: Call, Video, Reload, Close */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-white/70 shrink-0">
              <button
                type="button"
                onClick={handlePhoneCall}
                title="Audio Dispatch Call"
                className="p-1.5 sm:p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <Phone className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleVideoCall}
                title="Checkpoint Radar Tracking"
                className="p-1.5 sm:p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <Video className="size-4.5" />
              </button>

              <button
                type="button"
                onClick={() => void reloadMessages()}
                title="Refresh messages"
                className="p-1.5 sm:p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Close Chat"
                className="p-1.5 sm:p-2 hover:text-rose-400 hover:bg-rose-500/20 rounded-full transition-colors cursor-pointer ml-0.5"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Consignment Context Sub-strip (Human-readable, no raw UUID) */}
          <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-[#7ecfc4]/80">
            <span className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] truncate">
              <Package className="size-3 text-[#00c9a7] shrink-0" />
              <span className="text-[#00e5c0] font-bold">
                {effectiveTracking.includes("-") && effectiveTracking.length > 20
                  ? "Consignment Transit"
                  : `#${effectiveTracking}`}
              </span>
            </span>
            <span className="flex items-center gap-1 truncate text-[10px] sm:text-[11px] text-white/60">
              <MapPin className="size-3 text-[#00c9a7] shrink-0" />
              <span className="truncate">{effectiveRoute}</span>
            </span>
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
            flex-1 min-h-0 guarantees scroll stays inside this container only
            ───────────────────────────────────────────────────────────── */}
        <div
          ref={messagesContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 space-y-3.5 chat-sleek-scrollbar relative z-10"
        >
          {/* Centered Date Badge matching reference */}
          <div className="flex justify-center my-1">
            <span className="rounded-full bg-white/10 border border-white/10 px-3.5 py-0.5 text-[11px] font-medium text-white/70 backdrop-blur-md shadow-xs">
              Today
            </span>
          </div>

          {isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Loader2 className="size-7 animate-spin text-[#00c9a7] mb-2" />
              <p className="text-xs text-white/60">Loading consignment messages...</p>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#143333]/70 text-[#00c9a7] border border-white/10 mb-3 shadow-inner">
                <Package className="size-7" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Consignment Dispatch Channel
              </h4>
              <p className="text-xs text-white/60 max-w-xs mt-1 leading-relaxed">
                Direct communication for cargo handover, container dispatch, and transit milestone queries.
              </p>
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
                  <div className="flex items-start gap-2 max-w-[85%] sm:max-w-[75%]">
                    {/* Incoming message bubble: light off-white frosted speech bubble matching reference */}
                    <div className="rounded-[22px] rounded-tl-[4px] bg-[#eaeff2] text-[#0f172a] px-4 py-2.5 shadow-md">
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed font-normal text-[#0f172a]">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 font-mono">
                        <span>{formatTimeOnly(msg.createdAt)}</span>
                        <Check className="size-3 text-slate-500" />
                      </div>
                    </div>
                  </div>
                )}

                {isMe && (
                  <div className="flex items-end justify-end w-full">
                    {/* Outgoing message bubble: dark frosted teal capsule matching reference */}
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-[22px] rounded-br-[4px] bg-[#143232]/95 border border-white/10 text-white px-4 py-2.5 shadow-md">
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed font-normal text-white">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-teal-300/80 font-mono">
                        <span>{formatTimeOnly(msg.createdAt)}</span>
                        {msg.isRead ? (
                          <CheckCheck className="size-3 text-[#00e5c0]" />
                        ) : (
                          <Check className="size-3 text-teal-300/80" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Bubble */}
          {isCounterpartyTyping && (
            <div className="flex items-start gap-2 max-w-[80%] animate-in fade-in duration-200">
              <div className="rounded-[22px] rounded-tl-[4px] bg-[#eaeff2] text-[#0f172a] px-4 py-2.5 shadow-md flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.32s]" />
                  <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.16s]" />
                  <span className="size-1.5 rounded-full bg-[#00c9a7] animate-bounce" />
                </div>
                <span className="text-[11px] text-slate-600 italic">
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

        {/* ─────────────────────────────────────────────────────────────
            3. FLOATING FROSTED CAPSULE INPUT BAR (Pinned, shrink-0, Never Moves)
            Matching reference image: Rounded pill with emoji, attachment, input, camera, send
            ───────────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 z-20 m-3 sm:m-4 rounded-full bg-[#143232]/90 border border-white/15 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 shadow-2xl"
        >
          <button
            type="button"
            onClick={() => toast.info("Emoji panel available")}
            className="text-amber-300/80 hover:text-amber-300 transition-colors cursor-pointer p-1"
            title="Insert emoji"
          >
            <Smile className="size-4.5" />
          </button>

          <button
            type="button"
            onClick={() => toast.info("Attach cargo document or photo")}
            className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
            title="Attach cargo manifest"
          >
            <Paperclip className="size-4.5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            maxLength={2000}
            disabled={isSending}
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-hidden py-0.5"
          />

          <button
            type="button"
            onClick={() => toast.info("Capture cargo inspection photo")}
            className="text-white/60 hover:text-white transition-colors cursor-pointer p-1 hidden sm:block"
            title="Cargo inspection snapshot"
          >
            <Camera className="size-4.5" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white hover:bg-slate-100 text-[#091b1b] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 outline-hidden shadow-md shadow-white/20 cursor-pointer"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin text-[#091b1b]" />
            ) : (
              <Send className="size-4 text-[#091b1b]" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ShipmentChatModal;
