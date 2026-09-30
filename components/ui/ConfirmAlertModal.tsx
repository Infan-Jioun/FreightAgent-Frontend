"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmAlertVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmAlertVariant;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmAlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  icon,
}: ConfirmAlertModalProps) {
  // Handle ESC key to dismiss
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    },
    [onClose, loading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/30",
          confirmBtn:
            "bg-[#ff6b6b] hover:bg-[#ff8787] text-[#0a0f0f] shadow-lg shadow-[#ff6b6b]/20",
          defaultIcon: <AlertCircle className="size-6 text-[#ff6b6b]" />,
        };
      case "warning":
        return {
          iconBg: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
          confirmBtn:
            "bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0a0f0f] shadow-lg shadow-[#f59e0b]/20",
          defaultIcon: <AlertTriangle className="size-6 text-[#fbbf24]" />,
        };
      case "success":
        return {
          iconBg: "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30",
          confirmBtn:
            "bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/20",
          defaultIcon: <CheckCircle2 className="size-6 text-[#00e5c0]" />,
        };
      case "info":
      default:
        return {
          iconBg: "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30",
          confirmBtn:
            "bg-[#00b4d8] hover:bg-[#38bdf8] text-[#0a0f0f] shadow-lg shadow-[#00b4d8]/20",
          defaultIcon: <Info className="size-6 text-[#00b4d8]" />,
        };
    }
  };

  const { iconBg, confirmBtn, defaultIcon } = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => {
            if (!loading) onClose();
          }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {!loading && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            )}

            {/* Header: Icon & Content */}
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "size-12 rounded-2xl border flex items-center justify-center shrink-0",
                  iconBg
                )}
              >
                {icon || defaultIcon}
              </div>

              <div className="space-y-1 pr-6">
                <h3 className="text-base font-bold text-[#e0faf5] tracking-tight">
                  {title}
                </h3>
                <p className="text-xs text-[#7ecfc4] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1a4a4a]/50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-xs font-semibold text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50",
                  confirmBtn
                )}
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmAlertModal;
