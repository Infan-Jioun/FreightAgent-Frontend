"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IRagChatMessage,
  IRagPublicDirectoryData,
} from "@/app/types/rag.types";
import { ragService } from "@/app/services/rag.service";
import { getErrorMessage } from "@/app/errorHelper/appError";

const SESSION_KEY = "freight_rag_session_id";

function generateSessionId(): string {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateSessionId();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return generateSessionId();
  }
}

export function useRagChat() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<IRagChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [directory, setDirectory] = useState<IRagPublicDirectoryData | null>(null);

  // Store last user message to enable retry capability
  const lastUserMessageRef = useRef<string | null>(null);

  // Initialize session and hydrate history from Redis
  useEffect(() => {
    const currentSessionId = getStoredSessionId();
    setSessionId(currentSessionId);

    if (currentSessionId) {
      ragService
        .getSessionHistory(currentSessionId)
        .then((history) => {
          if (history && history.length > 0) {
            setMessages(history);
          }
        })
        .catch(() => {
          // Graceful fallback for cold sessions
        });
    }

    // Preload public directory for corridors & ports
    ragService
      .getPublicDirectory()
      .then((dir) => {
        if (dir) setDirectory(dir);
      })
      .catch(() => {
        // Directory preloading failure is non-blocking
      });
  }, []);

  const sendMessage = useCallback(
    async (text: string, model?: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      lastUserMessageRef.current = trimmed;
      const userMsg: IRagChatMessage = {
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      // Optimistic user bubble render
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await ragService.askQuestion({
          message: trimmed,
          sessionId: sessionId || undefined,
          model,
        });

        // Synchronize sessionId if modified or assigned by backend
        if (response.sessionId && response.sessionId !== sessionId) {
          setSessionId(response.sessionId);
          try {
            localStorage.setItem(SESSION_KEY, response.sessionId);
          } catch {
            // Storage quota handled
          }
        }

        const assistantMsg: IRagChatMessage = {
          role: "assistant",
          content: response.answer,
          timestamp: new Date().toISOString(),
          sources: response.contextSources,
          isCached: response.isCached,
          modelUsed: response.modelUsed,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(
          err,
          "Failed to receive a response from Freight Assistant. Please verify your connection or try again."
        );
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading]
  );

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current && !isLoading) {
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage, isLoading]);

  const clearChat = useCallback(async () => {
    if (sessionId) {
      try {
        await ragService.clearSession(sessionId);
      } catch {
        // Client-side memory reset must succeed even if remote call fails
      }
    }
    const newSessionId = generateSessionId();
    try {
      localStorage.setItem(SESSION_KEY, newSessionId);
    } catch {
      // Storage quota fallback
    }
    setSessionId(newSessionId);
    setMessages([]);
    setError(null);
    lastUserMessageRef.current = null;
  }, [sessionId]);

  return {
    sessionId,
    messages,
    isLoading,
    error,
    directory,
    sendMessage,
    retryLastMessage,
    clearChat,
  };
}

export default useRagChat;
