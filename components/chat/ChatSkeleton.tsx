"use client";

import React from "react";

export interface ChatMessagesSkeletonProps {
  count?: number;
  className?: string;
}

export function ChatMessagesSkeleton({
  count = 5,
  className = "",
}: ChatMessagesSkeletonProps): React.JSX.Element {
  // Pre-configured realistic chat message configurations
  const messageVariants = [
    { type: "incoming", lines: ["w-44", "w-28"], hasAttachment: false },
    { type: "outgoing", lines: ["w-48"], hasAttachment: false },
    { type: "incoming", lines: ["w-36"], hasAttachment: true },
    { type: "outgoing", lines: ["w-56", "w-36"], hasAttachment: false },
    { type: "incoming", lines: ["w-32"], hasAttachment: false },
    { type: "outgoing", lines: ["w-40"], hasAttachment: false },
  ];

  const items = messageVariants.slice(0, Math.max(1, count));

  return (
    <div
      aria-label="Loading messages"
      role="status"
      className={`space-y-3.5 w-full ${className}`}
    >
      {items.map((item, idx) => {
        const isIncoming = item.type === "incoming";

        if (isIncoming) {
          return (
            <div
              key={`skel-msg-${idx}`}
              className="flex w-full justify-start animate-pulse"
            >
              <div className="max-w-[85%] sm:max-w-[75%] rounded-[22px] rounded-tl-xs bg-[#eaeff2]/90 border border-slate-200/50 px-4 py-2.5 shadow-sm space-y-2">
                {item.hasAttachment && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-200/70 border border-slate-300/50 mb-1.5">
                    <div className="size-8 rounded-lg bg-[#00c9a7]/20 shrink-0" />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="h-2.5 w-28 rounded-full bg-slate-400/60" />
                      <div className="h-2 w-20 rounded-full bg-slate-400/40" />
                    </div>
                  </div>
                )}

                {item.lines.map((lineWidth, lineIdx) => (
                  <div
                    key={`line-${lineIdx}`}
                    className={`h-3 rounded-full bg-slate-300/80 ${lineWidth}`}
                  />
                ))}

                <div className="flex items-center justify-end gap-1 pt-0.5">
                  <div className="h-2 w-10 rounded-full bg-slate-400/40" />
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={`skel-msg-${idx}`}
            className="flex w-full justify-end animate-pulse"
          >
            <div className="max-w-[85%] sm:max-w-[75%] rounded-[22px] rounded-br-xs bg-[#143232]/90 border border-white/10 px-4 py-2.5 shadow-sm space-y-2">
              {item.lines.map((lineWidth, lineIdx) => (
                <div
                  key={`line-${lineIdx}`}
                  className={`h-3 rounded-full bg-white/20 ${lineWidth}`}
                />
              ))}

              <div className="flex items-center justify-end gap-1.5 pt-0.5">
                <div className="h-2 w-10 rounded-full bg-[#00c9a7]/30" />
                <div className="size-2.5 rounded-full bg-[#00c9a7]/40" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface ConversationListSkeletonProps {
  count?: number;
  className?: string;
}

export function ConversationListSkeleton({
  count = 5,
  className = "",
}: ConversationListSkeletonProps): React.JSX.Element {
  return (
    <div
      aria-label="Loading conversations"
      role="status"
      className={`space-y-1.5 ${className}`}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`skel-conv-${idx}`}
          className="w-full px-3 py-2 rounded-2xl bg-[#143232]/40 border border-white/5 flex items-center gap-2.5 animate-pulse"
        >
          {/* Avatar circle */}
          <div className="size-8.5 rounded-full bg-white/10 shrink-0" />

          {/* Texts */}
          <div className="grow min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3 w-24 rounded-full bg-white/20" />
              <div className="h-2.5 w-10 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="h-2.5 w-36 rounded-full bg-[#7ecfc4]/20" />
              <div className="size-3 rounded-full bg-white/10 shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
