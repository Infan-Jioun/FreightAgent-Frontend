"use client";

import React, { useState } from "react";
import { CheckCircle2, FileText, Download, Loader2, ExternalLink } from "lucide-react";
import { downloadInvoicePdf } from "@/app/lib/invoice";

export interface PaymentSuccessCardProps {
  invoiceUrl: string;
  trackingId: string;
  amountUSD?: number;
  onClose?: () => void;
  className?: string;
}

export function PaymentSuccessCard({
  invoiceUrl,
  trackingId,
  amountUSD,
  onClose,
  className = "",
}: PaymentSuccessCardProps): React.JSX.Element {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(invoiceUrl, trackingId);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`p-6 sm:p-7 bg-[#071313] border border-[#00c9a7]/30 rounded-2xl text-center space-y-5 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-[#00c9a7]/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-48 rounded-full bg-[#0077b6]/10 blur-2xl" />

      {/* Celebration Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="size-16 rounded-full bg-[#00c9a7]/20 border border-[#00c9a7]/40 flex items-center justify-center text-[#00e5c0] shadow-lg shadow-[#00c9a7]/20 animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="size-9 stroke-[2.2]" />
          </div>
          <span className="absolute -top-1 -right-1 flex size-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5c0] opacity-75" />
            <span className="relative inline-flex rounded-full size-4 bg-[#00c9a7]" />
          </span>
        </div>
      </div>

      {/* Heading & Status Message */}
      <div className="space-y-1.5">
        <h3 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
          Payment Successful! 🎉
        </h3>
        <p className="text-xs sm:text-sm text-[#7ecfc4]/90">
          Your shipment{" "}
          <span className="font-mono font-bold text-[#00e5c0]">#{trackingId}</span> has
          been marked as <b className="text-white font-extrabold">PAID</b>.
        </p>
        {amountUSD !== undefined && amountUSD > 0 && (
          <p className="text-xs font-semibold text-white/60">
            Settled Amount:{" "}
            <span className="font-bold text-[#00e5c0] font-mono">
              ${amountUSD.toFixed(2)} USD
            </span>
          </p>
        )}
      </div>

      {/* Invoice Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* Primary View & Download in new tab */}
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-[#00c9a7] to-[#00b4d8] hover:brightness-110 text-[#0a0f0f] font-black text-xs sm:text-sm transition-all shadow-md shadow-[#00c9a7]/20 cursor-pointer"
        >
          <FileText className="size-4 shrink-0" />
          <span>📄 View & Download Invoice</span>
          <ExternalLink className="size-3.5 shrink-0 opacity-70" />
        </a>

        {/* Secondary Direct Download Option */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          <span>{isDownloading ? "Downloading PDF..." : "📥 Direct PDF Download"}</span>
        </button>
      </div>

      {/* Footer Close / Done */}
      {onClose && (
        <div className="pt-2 border-t border-[#1a4a4a]/50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Done & Return to Shipments
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentSuccessCard;
