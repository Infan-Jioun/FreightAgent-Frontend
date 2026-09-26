"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  Database,
  Loader2,
  RefreshCw,
  Anchor,
  Compass,
  DollarSign,
  UserCheck,
  BookOpen,
  Zap,
  Info,
} from "lucide-react";
import { useRagChat } from "@/hooks/useRagChat";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { RagContextType } from "@/app/types/rag.types";

const STATIC_SUGGESTED_PROMPTS = [
  "How do I track my active consignment?",
  "Shipping rate from Chattogram to Singapore",
  "List verified logistics agents in Chittagong",
  "What are the major maritime corridors?",
];

function getSourceIcon(type: RagContextType) {
  switch (type) {
    case "TRACKING":
      return <Anchor className="size-3 text-[#00e5c0]" />;
    case "CORRIDOR":
      return <Compass className="size-3 text-[#00b4d8]" />;
    case "LOCATION":
      return <Compass className="size-3 text-[#38bdf8]" />;
    case "PRICING":
      return <DollarSign className="size-3 text-[#f59e0b]" />;
    case "AGENT":
      return <UserCheck className="size-3 text-[#10b981]" />;
    case "KNOWLEDGE_BASE":
    default:
      return <BookOpen className="size-3 text-[#a78bfa]" />;
  }
}

export function RagChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    messages,
    isLoading,
    error,
    directory,
    sendMessage,
    retryLastMessage,
    clearChat,
  } = useRagChat();

  // Scroll to bottom when messages update or widget opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  // Compile prompt suggestions using public directory if available
  const suggestedPrompts = useMemo(() => {
    if (directory?.corridors && directory.corridors.length > 0) {
      const topCorridor = directory.corridors[0];
      return [
        `Corridor rates from ${topCorridor.origin} to ${topCorridor.destination}`,
        ...STATIC_SUGGESTED_PROMPTS.slice(0, 3),
      ];
    }
    return STATIC_SUGGESTED_PROMPTS;
  }, [directory]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-linear-to-r from-[#00c9a7] to-[#00b4d8] px-5 py-3 text-[#0a0f0f] font-semibold shadow-[0_0_20px_rgba(0,201,167,0.35)] hover:shadow-[0_0_30px_rgba(0,201,167,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] outline-hidden ring-3 ring-[#00c9a7]/30"
          aria-label="Open FreightAgent AI Assistant"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0a0f0f] opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#0a0f0f]" />
          </span>
          <Sparkles className="size-4.5 transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-sm font-bold tracking-tight">Freight AI</span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[92vw] sm:w-110 md:w-120 h-150 max-h-[85vh] rounded-2xl border border-[#1a4a4a] bg-[#0a0f0f]/95 shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1a4a4a] bg-[#0d1f1f]/80 px-4 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] shadow-[0_0_12px_rgba(0,201,167,0.4)]">
                <Anchor className="size-5 text-[#0a0f0f]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-wide text-[#e0faf5]">
                    FreightAgent AI
                  </h3>
      
                </div>
                {isLoading ? (
                  <p className="text-[11px] text-[#00e5c0] font-medium flex items-center gap-1.5 mt-0.5 animate-pulse">
                    <span className="inline-block size-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                    typing...
                  </p>
                ) : (
                  <p className="text-[11px] text-[#7ecfc4] font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block size-1.5 rounded-full bg-[#00e5c0] animate-pulse" />
                    Real-time corridors, rates & tracking
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear Conversation Memory"
                type="button"
                className="rounded-lg p-2 text-[#7ecfc4] hover:bg-[#112a2a] hover:text-[#00e5c0] transition-colors outline-hidden focus:ring-3 focus:ring-[#00c9a7]/30"
                aria-label="Clear session history"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                type="button"
                className="rounded-lg p-2 text-[#7ecfc4] hover:bg-[#112a2a] hover:text-[#e0faf5] transition-colors outline-hidden focus:ring-3 focus:ring-[#00c9a7]/30"
                aria-label="Close Assistant"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="grow overflow-y-auto p-4 space-y-4 custom-modal-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-3 py-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0d1f1f] text-[#00c9a7] border border-[#1a4a4a] shadow-[0_0_20px_rgba(0,201,167,0.15)] mb-3.5">
                  <Sparkles className="size-7" />
                </div>
                <h4 className="text-sm font-bold text-[#e0faf5]">
                  Logistics Intelligence Assistant
                </h4>
                <p className="text-xs text-[#7ecfc4] max-w-[320px] mt-1 mb-5 leading-relaxed">
                  Query shipment tracking, freight rates, global corridors, and verified port agents instantly.
                </p>

                <div className="flex flex-col gap-2 w-full max-w-95">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3a6b66] text-left">
                    Suggested Inquiries
                  </p>
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="group flex items-center justify-between text-left text-xs bg-[#0d1f1f]/80 hover:bg-[#112a2a] text-[#e0faf5] hover:text-[#00e5c0] px-3.5 py-2.5 rounded-xl border border-[#1a4a4a] hover:border-[#00c9a7]/50 transition-all duration-200 outline-hidden"
                    >
                      <span className="truncate pr-2">{prompt}</span>
                      <Send className="size-3 text-[#3a6b66] group-hover:text-[#00e5c0] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="flex items-start gap-2.5 max-w-[90%]">
                    {/* FreightAgent Brand Logo Avatar */}
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] shadow-xs shadow-[#00c9a7]/20 mt-0.5">
                      <Anchor className="size-3.5 text-[#0a0f0f]" />
                    </div>

                    <div className="flex flex-col items-start min-w-0">
                      {/* Message Bubble */}
                      <div className="rounded-2xl rounded-bl-xs px-4 py-3 text-xs leading-relaxed bg-[#0d1f1f] text-[#e0faf5] border border-[#1a4a4a] shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                        <MarkdownRenderer content={msg.content} />
                      </div>

                      {/* Assistant Metadata: Cached badge & Sources */}
                      {msg.isCached && (
                        <div className="flex items-center gap-1 text-[10px] text-[#00e5c0] font-medium mt-1.5 px-1">
                          <Zap className="size-3" />
                          <span>Instant response (Redis cache hit)</span>
                        </div>
                      )}

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 px-1">
                          <span className="text-[10px] text-[#7ecfc4] font-semibold flex items-center gap-1">
                            <Database className="size-3 text-[#00c9a7]" /> Sources:
                          </span>
                          {msg.sources.map((src, srcIdx) => {
                            const tooltipKey = `${index}-${srcIdx}`;
                            const isTooltipActive = activeTooltip === tooltipKey;

                            return (
                              <div key={srcIdx} className="relative inline-block">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveTooltip(
                                      isTooltipActive ? null : tooltipKey
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-md bg-[#0a1a1a] px-2 py-0.5 text-[10px] font-medium text-[#7ecfc4] hover:text-[#00e5c0] border border-[#1a4a4a] hover:border-[#00c9a7]/60 transition-colors cursor-pointer"
                                >
                                  {getSourceIcon(src.type)}
                                  <span className="max-w-30 truncate">
                                    {src.title}
                                  </span>
                                  {src.detail && <Info className="size-2.5 opacity-60" />}
                                </button>

                                {/* Source Detail Popover */}
                                {isTooltipActive && src.detail && (
                                  <div className="absolute left-0 bottom-full mb-1.5 z-20 w-56 rounded-lg border border-[#1a4a4a] bg-[#071313] p-2 text-[10px] leading-snug text-[#e0faf5] shadow-xl">
                                    <div className="font-semibold text-[#00e5c0] mb-0.5 uppercase tracking-wider text-[9px]">
                                      {src.type} Context
                                    </div>
                                    <div>{src.detail}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-2xl rounded-br-xs px-4 py-3 text-xs leading-relaxed bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-medium shadow-[0_4px_15px_rgba(0,201,167,0.25)]">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {/* WhatsApp-Style Typing Indicator with FreightAgent Logo */}
            {isLoading && (
              <div className="flex items-start gap-2.5 max-w-[85%] animate-in fade-in duration-200">
                {/* FreightAgent Brand Logo Avatar */}
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] shadow-xs shadow-[#00c9a7]/30 mt-0.5">
                  <Anchor className="size-3.5 text-[#0a0f0f]" />
                </div>

                {/* WhatsApp Typing Bubble */}
                <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-xs bg-[#0d1f1f] border border-[#1a4a4a] px-3.5 py-2.5 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-1.5 px-0.5 py-1">
                    <span className="size-2 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.32s]" />
                    <span className="size-2 rounded-full bg-[#00c9a7] animate-bounce [animation-delay:-0.16s]" />
                    <span className="size-2 rounded-full bg-[#00c9a7] animate-bounce" />
                  </div>
                 
                </div>
              </div>
            )}

            {/* Error Notification with Retry */}
            {error && (
              <div className="flex items-center justify-between rounded-xl bg-red-950/40 border border-red-500/50 p-3 text-xs text-red-200">
                <div className="flex items-center gap-2 grow pr-2">
                  <span className="font-semibold text-red-400">Error:</span>
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={retryLastMessage}
                  className="flex items-center gap-1 shrink-0 rounded-lg bg-red-900/60 hover:bg-red-800 px-2.5 py-1 text-[11px] font-medium text-white transition-colors"
                >
                  <RefreshCw className="size-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#1a4a4a] bg-[#0d1f1f]/90 p-3 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about shipments, agents, or corridors..."
                maxLength={2000}
                disabled={isLoading}
                className="grow rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] px-3.5 py-2.5 text-xs text-[#e0faf5] placeholder-[#3a6b66] focus:ring-3 focus:ring-[#00c9a7]/20 outline-hidden transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 outline-hidden focus:ring-3 focus:ring-[#00c9a7]/40 shadow-[0_0_12px_rgba(0,201,167,0.3)]"
                aria-label="Send Message"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between px-1 text-[10px] text-[#3a6b66]">
              <span>Press Enter to send</span>
              <span>{input.length}/2000</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default RagChatWidget;
