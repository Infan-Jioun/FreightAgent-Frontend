"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Structured error logging for telemetry/debugging
        console.error("Application error captured by root boundary:", error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] p-8 text-center shadow-2xl shadow-black relative overflow-hidden">
                {/* Glow Backdrop */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#ff6b6b]/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#00c9a7]/10 blur-2xl pointer-events-none" />

                {/* Error Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 flex items-center justify-center text-[#ff6b6b] mx-auto mb-5">
                    <AlertTriangle size={28} />
                </div>

                {/* Title & Message */}
                <h2 className="text-xl font-bold text-[#e0faf5] mb-2">Something went wrong</h2>
                <p className="text-xs text-[#7ecfc4] leading-relaxed mb-6">
                    An unexpected error occurred while rendering this view. You can attempt to refresh the component or return to the dashboard.
                </p>

                {/* Error Digest (if present) */}
                {error?.digest && (
                    <div className="mb-6 p-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-[11px] font-mono text-[#7ecfc4]/70 truncate">
                        Reference: {error.digest}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#050a0a] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00c9a7]/20"
                    >
                        <RotateCcw size={14} />
                        <span>Try Again</span>
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0a1a1a] hover:bg-[#112a2a] border border-[#1a4a4a] text-[#e0faf5] text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <Home size={14} />
                        <span>Go Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
