"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShipmentChatModal } from "./ShipmentChatModal";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store/authStore";

export interface ShipmentChatButtonProps {
  shipmentId: string;
  trackingId?: string;
  status?: string;
  shipmentStatus?: string;
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
  status,
  shipmentStatus,
  routeTitle,
  counterpartyName,
  counterpartyRole,
  counterpartyPhone,
  counterpartyEmail,
  unreadCount = 0,
  variant = "button",
  className = "",
  label = "Dispatch Chat",
}: ShipmentChatButtonProps): React.JSX.Element {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const currentStatus = shipmentStatus || status;
  const isDelivered = currentStatus === "DELIVERED";

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const titleText = `Open chat with ${counterpartyName || "carrier / customer"} for #${trackingId || shipmentId}`;

  if (isDelivered) {
    const deliveredText = isAdmin
      ? "Successfully Delivered"
      : "Your shipment already delivered";
    const titleTextDelivered = isAdmin
      ? "Successfully Delivered. Chat is closed for this consignment."
      : "Your shipment already delivered. Chat is closed.";

    if (variant === "icon") {
      return (
        <button
          type="button"
          disabled
          aria-disabled="true"
          title={titleTextDelivered}
          aria-label={titleTextDelivered}
          className={cn(
            "relative inline-flex size-8 items-center justify-center rounded-lg bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed opacity-80 select-none",
            className
          )}
        >
          <span className="text-xs">🔒</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={titleTextDelivered}
        className={cn(
          "px-3 py-1.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg text-xs cursor-not-allowed inline-flex items-center gap-2 opacity-80 select-none font-medium",
          className
        )}
      >
        <span>🔒</span>
        <span>{deliveredText}</span>
      </button>
    );
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          shape="box"
          onClick={handleOpen}
          title={titleText}
          aria-label={titleText}
          className={cn("relative hover:border-[#00c9a7]/50", className)}
        >
          <MessageSquare className="size-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#00c9a7] text-[9px] font-bold text-[#0a0f0f] shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      ) : variant === "white" ? (
        <Button
          type="button"
          variant="white"
          size="sm"
          shape="default"
          onClick={handleOpen}
          title={titleText}
          className={cn("relative", className)}
        >
          <MessageSquare className="size-3.5 text-[#091b1b]" />
          <span>{label}</span>
          {unreadCount > 0 && (
            <span className="ml-1 rounded-full bg-[#00c9a7] px-1.5 py-0.2 text-[10px] font-bold text-[#0a0f0f]">
              {unreadCount}
            </span>
          )}
        </Button>
      ) : variant === "outline" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          shape="default"
          onClick={handleOpen}
          title={titleText}
          className={cn("relative", className)}
        >
          <MessageSquare className="size-3.5" />
          <span>{label}</span>
          {unreadCount > 0 && (
            <span className="ml-1 rounded-full bg-[#00c9a7] px-1.5 py-0.2 text-[10px] font-bold text-[#0a0f0f]">
              {unreadCount}
            </span>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          variant="gradient"
          size="sm"
          shape="default"
          onClick={handleOpen}
          title={titleText}
          className={cn("relative", className)}
        >
          <MessageSquare className="size-3.5" />
          <span>{label}</span>
          {unreadCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-[#0a0f0f] text-[9px] font-bold text-[#00e5c0]">
              {unreadCount}
            </span>
          )}
        </Button>
      )}

      {isOpen && (
        <ShipmentChatModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          shipmentId={shipmentId}
          trackingId={trackingId}
          status={currentStatus}
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
