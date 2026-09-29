"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  IConversation,
  IChatMessage,
  IUserTypingSocketPayload,
  IChatErrorSocketPayload,
  IConversationClosedSocketPayload,
} from "@/app/types/chat.types";
import { chatService } from "@/app/services/chat.service";
import { useSocketContext, useSocketEvent } from "@/app/providers/SocketProvider";
import { useAuthStore } from "@/app/store/authStore";
import { getErrorMessage } from "@/app/errorHelper/appError";

interface UseShipmentChatOptions {
  conversationId?: string;
  shipmentId?: string;
  shipmentStatus?: string;
  autoJoin?: boolean;
}

export function useShipmentChat({
  conversationId: initialConversationId,
  shipmentId,
  shipmentStatus,
  autoJoin = true,
}: UseShipmentChatOptions = {}) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
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
  const [isChatClosed, setIsChatClosed] = useState<boolean>(() => shipmentStatus === "DELIVERED");

  // Keep isChatClosed in sync when shipmentStatus changes
  useEffect(() => {
    if (shipmentStatus === "DELIVERED") {
      setIsChatClosed(true);
    }
  }, [shipmentStatus]);

  // Keep isChatClosed in sync when conversation payload loads
  useEffect(() => {
    if (conversation?.shipment?.status === "DELIVERED") {
      setIsChatClosed(true);
    }
  }, [conversation?.shipment?.status]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const localStopTypingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Socket: message_edited handler
  useSocketEvent<IChatMessage>("message_edited", (updatedMsg) => {
    if (!updatedMsg || updatedMsg.conversationId !== activeConversationId) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === updatedMsg.id
          ? {
              ...msg,
              ...updatedMsg,
              isEdited: true,
            }
          : msg
      )
    );
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

  // Socket: conversation_closed handler
  useSocketEvent<IConversationClosedSocketPayload>("conversation_closed", (data) => {
    if (!data) return;
    if (data.conversationId === activeConversationId || (data.shipmentId && data.shipmentId === shipmentId)) {
      setIsChatClosed(true);
      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          shipment: prev.shipment ? { ...prev.shipment, status: "DELIVERED" } : prev.shipment,
        };
      });
      toast.info(
        data.message ||
          (isAdmin
            ? "Successfully Delivered. Chat is closed."
            : "Your shipment already delivered. Chat is closed.")
      );
    }
  });

  // Socket: chat_error handler
  useSocketEvent<IChatErrorSocketPayload>("chat_error", (data) => {
    if (!data) return;
    if (data.message && data.message.toLowerCase().includes("already delivered")) {
      setIsChatClosed(true);
    }
    toast.error(data.message || "Chat operation encountered an error");
    setError(data.message);
  });

  // Send Message with WebSocket primary & REST fallback
  const sendMessage = useCallback(
    async (content: string) => {
      if (isChatClosed) {
        toast.error(
          isAdmin
            ? "Successfully Delivered. Chat is closed for this consignment."
            : "Your shipment already delivered. Chat is closed for this consignment."
        );
        return;
      }

      const trimmed = content.trim();
      if (!trimmed || !activeConversationId || isSending) return;

      setIsSending(true);
      setError(null);

      // Stop typing state locally and notify socket room
      if (localStopTypingTimerRef.current) {
        clearTimeout(localStopTypingTimerRef.current);
      }
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
    [activeConversationId, isConnected, isSending, isChatClosed, socket, emit]
  );

  // Send typing event throttled to once every 1.5s, with 2s inactivity auto stop
  const sendTyping = useCallback(() => {
    if (!activeConversationId || !isConnected || isChatClosed) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 1500) {
      lastTypingSentRef.current = now;
      emit("typing", { conversationId: activeConversationId });
    }

    if (localStopTypingTimerRef.current) {
      clearTimeout(localStopTypingTimerRef.current);
    }

    localStopTypingTimerRef.current = setTimeout(() => {
      if (activeConversationId && isConnected) {
        emit("stop_typing", { conversationId: activeConversationId });
      }
    }, 2000);
  }, [activeConversationId, isConnected, isChatClosed, emit]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (localStopTypingTimerRef.current) {
        clearTimeout(localStopTypingTimerRef.current);
      }
    };
  }, []);

  // Edit Message with WebSocket primary & REST fallback
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (isChatClosed) {
        toast.error(
          isAdmin
            ? "Successfully Delivered. Chat is closed for this consignment."
            : "Your shipment already delivered. Chat is closed for this consignment."
        );
        return;
      }

      const trimmed = newContent.trim();
      if (!trimmed || !activeConversationId) return;

      try {
        if (isConnected && socket) {
          emit(
            "edit_message",
            {
              conversationId: activeConversationId,
              messageId,
              content: trimmed,
            },
            (response?: { success: boolean; data?: IChatMessage; error?: string }) => {
              if (response && !response.success) {
                toast.error(response.error || "Failed to edit message");
              }
            }
          );

          // Optimistically update local message state for immediate UI feedback
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content: trimmed,
                    isEdited: true,
                    updatedAt: new Date().toISOString(),
                  }
                : m
            )
          );
        } else {
          // REST API fallback
          const updated = await chatService.editMessage(
            activeConversationId,
            messageId,
            trimmed
          );
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, ...updated, isEdited: true } : m))
          );
        }
      } catch (err) {
        const msg = getErrorMessage(err, "Failed to edit message");
        toast.error(msg);
        throw err;
      }
    },
    [activeConversationId, isConnected, isChatClosed, socket, emit]
  );

  return {
    conversation,
    activeConversationId,
    messages,
    isLoading,
    isSending,
    isCounterpartyTyping,
    error,
    isConnected,
    isChatClosed,
    setIsChatClosed,
    sendMessage,
    editMessage,
    sendTyping,
    reloadMessages: () => activeConversationId && loadMessages(activeConversationId),
  };
}

export default useShipmentChat;
