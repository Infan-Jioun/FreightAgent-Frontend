"use client";

import { useState, useEffect, useCallback } from "react";
import { IConversation, IChatMessage, IConversationClosedSocketPayload } from "@/app/types/chat.types";
import { chatService } from "@/app/services/chat.service";
import { useSocketEvent } from "@/app/providers/SocketProvider";
import { useAuthStore } from "@/app/store/authStore";
import { getErrorMessage } from "@/app/errorHelper/appError";
import { playNotificationChime } from "@/app/lib/browserNotification";

export function useConversationsList(activeConversationId?: string) {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await chatService.getUserConversations();
      setConversations(data);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load active conversations");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  // Update conversation list real-time when any new message arrives
  useSocketEvent<IChatMessage>("new_message", (incomingMsg) => {
    if (!incomingMsg) return;

    setConversations((prev) => {
      const index = prev.findIndex((c) => c.id === incomingMsg.conversationId);
      if (index === -1) {
        // New conversation created, refresh list and chime
        if (user?.id && incomingMsg.senderId !== user.id) {
          playNotificationChime();
        }
        void fetchConversations();
        return prev;
      }

      const updated = [...prev];
      const target = { ...updated[index] };
      target.lastMessage = incomingMsg.content;
      target.lastMessageAt = incomingMsg.createdAt;

      // Increment unread if message not in active view and not sent by current user
      if (
        incomingMsg.conversationId !== activeConversationId &&
        user?.id &&
        incomingMsg.senderId !== user.id
      ) {
        target.unreadCount = (target.unreadCount || 0) + 1;
        playNotificationChime();
      }

      // Move latest conversation to top
      updated.splice(index, 1);
      return [target, ...updated];
    });
  });

  // Update conversation list real-time when a message is edited
  useSocketEvent<IChatMessage>("message_edited", (updatedMsg) => {
    if (!updatedMsg) return;

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === updatedMsg.conversationId) {
          return {
            ...conv,
            lastMessage: updatedMsg.content,
          };
        }
        return conv;
      })
    );
  });

  // Reset unread count when messages are marked as read
  useSocketEvent<{ conversationId: string; readBy: string; readAt: string }>(
    "messages_read",
    (data) => {
      if (!data?.conversationId) return;

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === data.conversationId) {
            return {
              ...conv,
              unreadCount: 0,
              customerUnread: user?.role === "CUSTOMER" ? 0 : conv.customerUnread,
              agentUnread: user?.role === "AGENT" ? 0 : conv.agentUnread,
            };
          }
          return conv;
        })
      );
    }
  );

  // Update conversation status in real-time when a shipment is marked DELIVERED
  useSocketEvent<IConversationClosedSocketPayload>("conversation_closed", (data) => {
    if (!data) return;

    setConversations((prev) =>
      prev.map((conv) => {
        if (
          conv.id === data.conversationId ||
          (data.shipmentId && conv.shipmentId === data.shipmentId)
        ) {
          return {
            ...conv,
            shipment: conv.shipment
              ? { ...conv.shipment, status: "DELIVERED" }
              : conv.shipment,
          };
        }
        return conv;
      })
    );
  });

  return {
    conversations,
    isLoading,
    error,
    refreshConversations: fetchConversations,
  };
}

export default useConversationsList;
