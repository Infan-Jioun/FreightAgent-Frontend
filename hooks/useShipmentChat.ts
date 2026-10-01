"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  IConversation,
  IConversationMessage,
  IChatMessage,
  IUserTypingSocketPayload,
  IMessagesReadSocketPayload,
  IChatErrorSocketPayload,
  IConversationClosedSocketPayload,
} from "@/app/types/chat.types";
import { chatService } from "@/app/services/chat.service";
import { useSocketContext, useSocketEvent } from "@/app/providers/SocketProvider";
import { useAuthStore } from "@/app/store/authStore";
import { getErrorMessage } from "@/app/errorHelper/appError";

import { playNotificationChime } from "@/app/lib/browserNotification";

interface UseShipmentChatOptions {
  conversationId?: string;
  shipmentId?: string;
  shipmentStatus?: string;
  autoJoin?: boolean;
}

function generateClientMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
  const [messages, setMessages] = useState<IConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  const [hasMoreOlder, setHasMoreOlder] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isCounterpartyTyping, setIsCounterpartyTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatClosed, setIsChatClosed] = useState<boolean>(() => shipmentStatus === "DELIVERED");

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const localStopTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasDisconnectedRef = useRef<boolean>(false);

  // Keep isChatClosed in sync when shipmentStatus changes (both DELIVERED and active)
  useEffect(() => {
    setIsChatClosed(shipmentStatus === "DELIVERED");
  }, [shipmentStatus]);

  // Keep isChatClosed in sync when conversation payload loads
  useEffect(() => {
    if (conversation?.shipment?.status) {
      setIsChatClosed(conversation.shipment.status === "DELIVERED");
    }
  }, [conversation?.shipment?.status]);

  // Sync and reset state when switching conversations
  useEffect(() => {
    if (initialConversationId && initialConversationId !== activeConversationId) {
      setActiveConversationId(initialConversationId);
      setConversation(null);
      setIsChatClosed(shipmentStatus === "DELIVERED");
      setIsCounterpartyTyping(false);
      setError(null);
    }
  }, [initialConversationId, shipmentStatus, activeConversationId]);

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

  const isConnectedRef = useRef(isConnected);
  isConnectedRef.current = isConnected;
  const emitRef = useRef(emit);
  emitRef.current = emit;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Mark conversation read on server & socket (strictly stable reference)
  const markAsRead = useCallback((convId: string) => {
    if (!convId) return;
    if (isConnectedRef.current) {
      emitRef.current("mark_read", { conversationId: convId });
    }
    void chatService.markConversationAsRead(convId).catch(() => {});
  }, []);

  // Load message history once activeConversationId is established
  const loadMessages = useCallback(
    async (convId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await chatService.getConversationMessages(convId, { limit: 30 });
        const list = Array.isArray(res?.messages)
          ? res.messages
          : Array.isArray(res)
          ? (res as unknown as IConversationMessage[])
          : [];
        setMessages(list);
        setHasMoreOlder(list.length >= 30);

        // Mark read immediately upon loading
        markAsRead(convId);
      } catch (err) {
        const msg = getErrorMessage(err, "Failed to load chat history");
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [markAsRead]
  );

  useEffect(() => {
    if (activeConversationId) {
      void loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  // Cursor Pagination: Load older messages on scroll-to-top
  const loadOlderMessages = useCallback(async () => {
    if (!activeConversationId || isLoadingOlder || !hasMoreOlder) {
      return;
    }

    const currentList = messagesRef.current;
    if (currentList.length === 0) return;
    const oldestMsg = currentList[0];
    if (!oldestMsg?.id) return;

    setIsLoadingOlder(true);
    try {
      const res = await chatService.getConversationMessages(activeConversationId, {
        cursor: oldestMsg.id,
        limit: 30,
      });

      const olderMessages = Array.isArray(res?.messages)
        ? res.messages
        : Array.isArray(res)
        ? (res as unknown as IConversationMessage[])
        : [];
      if (olderMessages.length === 0) {
        setHasMoreOlder(false);
      } else {
        setMessages((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const existingIds = new Set(safePrev.map((m) => m.id));
          const newUniqueOlder = olderMessages.filter((m) => !existingIds.has(m.id));
          if (newUniqueOlder.length === 0) {
            setHasMoreOlder(false);
            return safePrev;
          }
          return [...newUniqueOlder, ...safePrev];
        });
      }
    } catch (err) {
      console.warn("Failed to load older messages:", err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [activeConversationId, isLoadingOlder, hasMoreOlder]);

  // Reconnection Catch-up: fetch missing messages (?after=) strictly when socket reconnects
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      wasConnectedRef.current = false;
      return;
    }

    const isReconnecting = !wasConnectedRef.current;
    wasConnectedRef.current = true;

    // Only run catch-up if socket reconnected and we already have active messages in memory
    if (isReconnecting && activeConversationId) {
      const currentList = messagesRef.current;
      if (currentList.length > 0) {
        const latestMsg = currentList[currentList.length - 1];
        if (latestMsg?.id) {
          chatService
            .getConversationMessages(activeConversationId, { after: latestMsg.id })
            .then((res) => {
              const catchUpMessages = Array.isArray(res?.messages)
                ? res.messages
                : Array.isArray(res)
                ? (res as unknown as IConversationMessage[])
                : [];

              if (res.resetRequired) {
                void loadMessages(activeConversationId);
              } else if (catchUpMessages.length > 0) {
                setMessages((prev) => {
                  const safePrev = Array.isArray(prev) ? prev : [];
                  const existingIds = new Set(safePrev.map((m) => m.id));
                  safePrev.forEach((m) => {
                    if (m.clientMessageId) existingIds.add(m.clientMessageId);
                  });

                  const appendList: IConversationMessage[] = [];
                  for (const newMsg of catchUpMessages) {
                    if (
                      !existingIds.has(newMsg.id) &&
                      (!newMsg.clientMessageId || !existingIds.has(newMsg.clientMessageId))
                    ) {
                      appendList.push({ ...newMsg, status: "sent" });
                    }
                  }
                  return appendList.length > 0 ? [...safePrev, ...appendList] : safePrev;
                });
                markAsRead(activeConversationId);
              }
            })
            .catch((err) => {
              console.warn("Catch-up messages fetch failed:", err);
            });
        }
      }
    }
  }, [isConnected, activeConversationId, loadMessages, markAsRead]);

  // Join and Leave Room via Socket
  useEffect(() => {
    if (!autoJoin || !activeConversationId || !isConnected) return;

    emit("join_conversation", { conversationId: activeConversationId });

    return () => {
      emit("leave_conversation", { conversationId: activeConversationId });
    };
  }, [autoJoin, activeConversationId, isConnected, emit]);

  // Socket: new_message handler (matches clientMessageId or id to avoid duplicates)
  useSocketEvent<IConversationMessage>("new_message", (incomingMsg) => {
    if (!incomingMsg || incomingMsg.conversationId !== activeConversationId) return;

    setMessages((prev) => {
      // Check if message matches an existing optimistic message
      const matchingIndex = prev.findIndex(
        (m) =>
          (incomingMsg.clientMessageId && m.clientMessageId === incomingMsg.clientMessageId) ||
          m.id === incomingMsg.id
      );

      if (matchingIndex !== -1) {
        const next = [...prev];
        next[matchingIndex] = {
          ...incomingMsg,
          status: "sent",
        };
        return next;
      }

      return [...prev, { ...incomingMsg, status: "sent" }];
    });

    // Reset typing indicator when new message arrives
    setIsCounterpartyTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // If incoming message is from opponent, mark as read and play chime
    if (user?.id && incomingMsg.senderId !== user.id) {
      markAsRead(activeConversationId);
      playNotificationChime();
    }
  });

  // Socket: messages_read handler (Opponent read receipt - blue/double ticks)
  useSocketEvent<IMessagesReadSocketPayload>("messages_read", (payload) => {
    if (!payload || payload.conversationId !== activeConversationId) return;

    setMessages((prev) =>
      prev.map((msg) => {
        // If sent by current user and opponent read it, mark read
        if (user?.id && msg.senderId === user.id) {
          return {
            ...msg,
            isRead: true,
            readAt: payload.readAt || new Date().toISOString(),
          };
        }
        return msg;
      })
    );
  });

  // Socket: message_edited handler
  useSocketEvent<IConversationMessage>("message_edited", (updatedMsg) => {
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
    if (data.clientMessageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === data.clientMessageId ? { ...m, status: "failed" } : m
        )
      );
    }
    toast.error(data.message || "Chat operation encountered an error");
    setError(data.message);
  });

  // Sub-50ms WhatsApp-like Optimistic Message Send
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

      const clientMessageId = generateClientMessageId();

      // 1. Immediately append optimistic message to state with 'sending' status
      const currentUserParticipant = {
        id: user?.id || "",
        name: user?.name || "You",
        role: user?.role || "CUSTOMER",
        image: user?.image || user?.avatar || null,
        avatar: user?.avatar || null,
        email: user?.email,
        phone: user?.phone,
      };

      const optimisticMessage: IConversationMessage = {
        id: clientMessageId,
        clientMessageId,
        conversationId: activeConversationId,
        senderId: currentUserParticipant.id,
        type: "TEXT",
        content: trimmed,
        isRead: false,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: currentUserParticipant,
        status: "sending",
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        if (isConnected && socket) {
          // 2. Fire WebSocket event with ACK callback
          emit(
            "send_message",
            {
              conversationId: activeConversationId,
              content: trimmed,
              clientMessageId,
              type: "TEXT",
            },
            (response?: { success: boolean; data?: IConversationMessage; error?: string }) => {
              if (response?.success && response?.data) {
                // 3. Replace optimistic message with server data & mark 'sent'
                setMessages((prev) =>
                  prev.map((m) =>
                    m.clientMessageId === clientMessageId
                      ? { ...response.data!, status: "sent" }
                      : m
                  )
                );
              } else {
                // Mark 'failed' for retry
                setMessages((prev) =>
                  prev.map((m) =>
                    m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m
                  )
                );
                if (response?.error) {
                  toast.error(response.error);
                }
              }
            }
          );
        } else {
          // Fallback to HTTP REST endpoint
          const savedMsg = await chatService.sendMessageHttp(
            activeConversationId,
            trimmed,
            clientMessageId
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.clientMessageId === clientMessageId ? { ...savedMsg, status: "sent" } : m
            )
          );
        }
      } catch (err) {
        const msg = getErrorMessage(err, "Failed to send message. Please retry.");
        toast.error(msg);
        setError(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m
          )
        );
      } finally {
        setIsSending(false);
      }
    },
    [activeConversationId, isConnected, isSending, isChatClosed, socket, emit, user]
  );

  // Retry failed message
  const retrySendMessage = useCallback(
    (clientMessageId: string) => {
      const target = messages.find((m) => m.clientMessageId === clientMessageId);
      if (!target || !activeConversationId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === clientMessageId ? { ...m, status: "sending" } : m
        )
      );

      if (isConnected && socket) {
        emit(
          "send_message",
          {
            conversationId: activeConversationId,
            content: target.content,
            clientMessageId,
            type: target.type || "TEXT",
          },
          (response?: { success: boolean; data?: IConversationMessage; error?: string }) => {
            if (response?.success && response?.data) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.clientMessageId === clientMessageId
                    ? { ...response.data!, status: "sent" }
                    : m
                )
              );
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m
                )
              );
              toast.error(response?.error || "Retry failed");
            }
          }
        );
      } else {
        chatService
          .sendMessageHttp(activeConversationId, target.content, clientMessageId)
          .then((saved) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMessageId === clientMessageId ? { ...saved, status: "sent" } : m
              )
            );
          })
          .catch((err) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m
              )
            );
            toast.error(getErrorMessage(err, "Retry failed"));
          });
      }
    },
    [messages, activeConversationId, isConnected, socket, emit]
  );

  // Send typing event throttled to once every 1.5s, with 1.5s debounce stop_typing
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
    }, 1500);
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

  // Edit Message (Text messages only) with WebSocket primary & REST fallback
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
            (response?: { success: boolean; data?: IConversationMessage; error?: string }) => {
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
    [activeConversationId, isConnected, isChatClosed, socket, emit, isAdmin]
  );

  return {
    conversation,
    activeConversationId,
    messages: Array.isArray(messages) ? messages : [],
    isLoading,
    isLoadingOlder,
    hasMoreOlder,
    isSending,
    isCounterpartyTyping,
    error,
    isConnected,
    isChatClosed,
    setIsChatClosed,
    sendMessage,
    retrySendMessage,
    editMessage,
    sendTyping,
    loadOlderMessages,
    reloadMessages: () => activeConversationId && loadMessages(activeConversationId),
  };
}

export default useShipmentChat;

