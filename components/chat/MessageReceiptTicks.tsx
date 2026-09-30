"use client";

import React from "react";
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { IConversationMessage } from "@/app/types/chat.types";

interface MessageReceiptTicksProps {
  message: IConversationMessage;
  onRetry?: (clientMessageId: string) => void;
  className?: string;
}

export function MessageReceiptTicks({
  message,
  onRetry,
  className = "",
}: MessageReceiptTicksProps): React.JSX.Element {
  // 1. Clock icon for sending / optimistic state
  if (message.status === "sending") {
    return (
      <span
        title="Sending..."
        className={`inline-flex items-center text-white/50 ${className}`}
      >
        <Clock className="size-3 animate-pulse" />
      </span>
    );
  }

  // 2. Failed state with optional retry button
  if (message.status === "failed") {
    return (
      <span
        title="Failed to send. Click to retry."
        className={`inline-flex items-center gap-1 text-rose-400 font-sans text-[10px] ${className}`}
      >
        {onRetry && message.clientMessageId ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetry(message.clientMessageId!);
            }}
            className="inline-flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <AlertCircle className="size-3" />
            <span>Retry</span>
          </button>
        ) : (
          <AlertCircle className="size-3" />
        )}
      </span>
    );
  }

  // 3. Double Tick (Blue / Teal) - Read by recipient
  const isRead = Boolean(message.isRead || message.readAt);
  if (isRead) {
    let readTooltip = "Read";
    if (message.readAt) {
      const d = new Date(message.readAt);
      if (!isNaN(d.getTime())) {
        readTooltip = `Read at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase()}`;
      }
    }
    return (
      <span
        title={readTooltip}
        className={`inline-flex items-center text-[#00e5c0] ${className}`}
      >
        <CheckCheck className="size-3.5 stroke-[2.5]" />
      </span>
    );
  }

  // 4. Double Tick (Grey) - Delivered to server / recipient device but unread
  const isDelivered = Boolean(message.deliveredAt);
  if (isDelivered) {
    return (
      <span
        title="Delivered"
        className={`inline-flex items-center text-white/50 ${className}`}
      >
        <CheckCheck className="size-3.5 stroke-[2]" />
      </span>
    );
  }

  // 5. Single Tick (Grey) - Sent from client
  return (
    <span
      title="Sent"
      className={`inline-flex items-center text-white/40 ${className}`}
    >
      <Check className="size-3.5 stroke-[2]" />
    </span>
  );
}

export default MessageReceiptTicks;
