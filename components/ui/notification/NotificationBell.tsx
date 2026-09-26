"use client";

import React from "react";
import { Bell } from "lucide-react";

export interface NotificationBellProps {
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  isOpen,
  onToggle,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Notifications (${unreadCount} unread)`}
      aria-expanded={isOpen}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7]/60 hover:bg-[#112a2a] transition-all shadow-xs cursor-pointer ${className}`}
    >
      <Bell className="w-4.5 h-4.5" />
      {unreadCount > 0 && (
        <>
          {/* Pulsing radar ping */}
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#00c9a7] ring-2 ring-[#0d1f1f] animate-ping" />
          
          {/* Badge counter */}
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-[10px] font-black flex items-center justify-center shadow-md shadow-[#00c9a7]/30 border border-[#0a0f0f]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </>
      )}
    </button>
  );
};

export default NotificationBell;
