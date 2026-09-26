"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  IConversation,
  IChatMessage,
  IUserTypingSocketPayload,
  IChatErrorSocketPayload,
} from "@/app/types/chat.types";
import { chatService } from "@/app/services/chat.service";
import { useSocketContext, useSocketEvent } from "@/app/providers/SocketProvider";
import { useAuthStore } from "@/app/store/authStore";
import { getErrorMessage } from "@/app/errorHelper/appError";

interface UseShipmentChatOptions {
  conversationId?: string;
  shipmentId?: string;
  autoJoin?: boolean;
}

export function useShipmentChat({
  conversationId: initialConversationId,
  shipmentId,
  autoJoin = true,
}: UseShipmentChatOptions = {}) {
  const { user } = useAuthStore();
  const { socket, isConnected, emit } = useSocketContext();

  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isCounterpartyTyping, setIsCounterpartyTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  // Sync if initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  // If shipmentId provided, retrieve or initiate conversation session
  useEffect(() => {
    if (shipmentId && !activeConversationId) {
      let cancelled = false;
      setIsLoading(true);
      setError(null);

      chatService
        .getOrCreateConversation(shipmentId)
        .then((conv) => {
          if (cancelled) return;
          setConversation(conv);
          setActiveConversationId(conv.id);
        })
        .catch((err) => {
          if (cancelled) return;
          const msg = getErrorMessage(err, "Failed to load conversation for shipment");
          setError(msg);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }
  }, [shipmentId, activeConversationId]);

  // Load message history once activeConversationId is established
  const loadMessages = useCallback(async (convId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await chatService.getConversationMessages(convId);
      setMessages(history);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load chat history");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      void loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  // Join and Leave Room via Socket
  useEffect(() => {
    if (!autoJoin || !activeConversationId || !isConnected) return;

    emit("join_conversation", { conversationId: activeConversationId });

    return () => {
      emit("leave_conversation", { conversationId: activeConversationId });
    };
  }, [autoJoin, activeConversationId, isConnected, emit]);

  // Socket: new_message handler
  useSocketEvent<IChatMessage>("new_message", (incomingMsg) => {
    if (!incomingMsg || incomingMsg.conversationId !== activeConversationId) return;

    setMessages((prev) => {
      // Deduplicate by message ID
      if (prev.some((m) => m.id === incomingMsg.id)) {
        return prev;
      }
      return [...prev, incomingMsg];
    });

    // Reset typing indicator when new message arrives
    setIsCounterpartyTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  });

  // Socket: user_typing handler
  useSocketEvent<IUserTypingSocketPayload>("user_typing", (data) => {
    if (!data || data.conversationId !== activeConversationId) return;
    if (user?.id && data.userId === user.id) return; // Ignore own typing event

    setIsCounterpartyTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto clear typing state after 3 seconds if not refreshed
    typingTimeoutRef.current = setTimeout(() => {
      setIsCounterpartyTyping(false);
    }, 3000);
  });

  // Socket: user_stop_typing handler
  useSocketEvent<IUserTypingSocketPayload>("user_stop_typing", (data) => {
    if (!data || data.conversationId !== activeConversationId) return;
    if (user?.id && data.userId === user.id) return;

    setIsCounterpartyTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  });

  // Socket: chat_error handler
  useSocketEvent<IChatErrorSocketPayload>("chat_error", (data) => {
    if (!data) return;
    toast.error(data.message || "Chat operation encountered an error");
    setError(data.message);
  });

  // Send Message with WebSocket primary & REST fallback
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !activeConversationId || isSending) return;

      setIsSending(true);
      setError(null);

      // Stop typing state locally
      if (isConnected) {
        emit("stop_typing", { conversationId: activeConversationId });
      }

      try {
        if (isConnected && socket) {
          // Send via WebSocket
          emit("send_message", {
            conversationId: activeConversationId,
            content: trimmed,
          });
        } else {
          // Fallback to HTTP REST endpoint
          const savedMsg = await chatService.sendMessageHttp(
            activeConversationId,
            trimmed
          );
          setMessages((prev) => {
            if (prev.some((m) => m.id === savedMsg.id)) return prev;
            return [...prev, savedMsg];
          });
        }
      } catch (err) {
        const msg = getErrorMessage(err, "Failed to send message. Please try again.");
        toast.error(msg);
        setError(msg);
      } finally {
        setIsSending(false);
      }
    },
    [activeConversationId, isConnected, isSending, socket, emit]
  );

  // Send typing event throttled to once every 2 seconds
  const sendTyping = useCallback(() => {
    if (!activeConversationId || !isConnected) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      emit("typing", { conversationId: activeConversationId });
    }
  }, [activeConversationId, isConnected, emit]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    conversation,
    activeConversationId,
    messages,
    isLoading,
    isSending,
    isCounterpartyTyping,
    error,
    isConnected,
    sendMessage,
    sendTyping,
    reloadMessages: () => activeConversationId && loadMessages(activeConversationId),
  };
}

export default useShipmentChat;
