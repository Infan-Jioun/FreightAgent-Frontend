"use client";

import { useState, useEffect, useCallback } from "react";
import { IConversation, IChatMessage } from "@/app/types/chat.types";
import { chatService } from "@/app/services/chat.service";
import { useSocketEvent } from "@/app/providers/SocketProvider";
import { useAuthStore } from "@/app/store/authStore";
import { getErrorMessage } from "@/app/errorHelper/appError";

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
        // New conversation created, refresh list
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
      }

      // Move latest conversation to top
      updated.splice(index, 1);
      return [target, ...updated];
    });
  });

  return {
    conversations,
    isLoading,
    error,
    refreshConversations: fetchConversations,
  };
}

export default useConversationsList;
