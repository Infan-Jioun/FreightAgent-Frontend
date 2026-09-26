"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ShipmentChatModal } from "./ShipmentChatModal";

interface ShipmentChatButtonProps {
  shipmentId: string;
  trackingId?: string;
  routeTitle?: string;
  counterpartyName?: string;
  counterpartyRole?: string;
  counterpartyPhone?: string;
  counterpartyEmail?: string;
  unreadCount?: number;
  variant?: "button" | "icon" | "outline" | "white";
  className?: string;
  label?: string;
}

export function ShipmentChatButton({
  shipmentId,
  trackingId,
  routeTitle,
  counterpartyName,
  counterpartyRole,
  counterpartyPhone,
  counterpartyEmail,
  unreadCount = 0,
  variant = "button",
  className = "",
  label = "Dispatch Chat",
}: ShipmentChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Open chat with ${counterpartyName || "customer"} for #${trackingId || shipmentId}`}
          className={`relative flex size-8 items-center justify-center rounded-xl bg-[#0d1f1f] text-[#7ecfc4] hover:text-[#00e5c0] hover:bg-[#112a2a] border border-[#1a4a4a] hover:border-[#00c9a7]/50 transition-all outline-hidden cursor-pointer ${className}`}
        >
          <MessageSquare className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#00c9a7] text-[9px] font-bold text-[#0a0f0f] shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      ) : variant === "white" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Open chat with ${counterpartyName || "customer"} for #${trackingId || shipmentId}`}
          className={`relative inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#091b1b] font-bold shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] outline-hidden cursor-pointer px-3 py-1.5 text-xs ${className}`}
        >
          <MessageSquare className="size-3.5 text-[#091b1b]" />
          <span>{label}</span>
          {unreadCount > 0 && (
            <span className="ml-1 rounded-full bg-[#00c9a7] px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f0f]">
              {unreadCount}
            </span>
          )}
        </button>
      ) : variant === "outline" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Open chat with ${counterpartyName || "customer"} for #${trackingId || shipmentId}`}
          className={`relative inline-flex items-center gap-1.5 rounded-xl border border-[#1a4a4a] bg-[#0d1f1f] px-3 py-1.5 text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] hover:border-[#00c9a7]/50 hover:bg-[#112a2a] transition-all outline-hidden cursor-pointer ${className}`}
        >
          <MessageSquare className="size-3.5" />
          <span>{label}</span>
          {unreadCount > 0 && (
            <span className="ml-1 rounded-full bg-[#00c9a7] px-1.5 py-0.5 text-[10px] font-bold text-[#0a0f0f]">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Open chat with ${counterpartyName || "customer"} for #${trackingId || shipmentId}`}
          className={`relative inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#00c9a7] to-[#00b4d8] px-3.5 py-2 text-xs font-bold text-[#0a0f0f] shadow-[0_2px_10px_rgba(0,201,167,0.25)] hover:shadow-[0_4px_15px_rgba(0,201,167,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] outline-hidden cursor-pointer ${className}`}
        >
          <MessageSquare className="size-3.5" />
          <span>{label}</span>
          {unreadCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-[#0a0f0f] text-[9px] font-bold text-[#00e5c0]">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <ShipmentChatModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          shipmentId={shipmentId}
          trackingId={trackingId}
          routeTitle={routeTitle}
          counterpartyName={counterpartyName}
          counterpartyRole={counterpartyRole}
          counterpartyPhone={counterpartyPhone}
          counterpartyEmail={counterpartyEmail}
        />
      )}
    </>
  );
}

export default ShipmentChatButton;
