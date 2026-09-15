"use client";

import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

interface CheckoutFormProps {
    shipmentId: string;
    trackingId: string;
    amountUSD: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CheckoutForm({
    trackingId,
    amountUSD,
    onSuccess,
    onCancel,
}: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: typeof window !== "undefined" ? window.location.href : "",
                },
                redirect: "if_required",
            });

            if (error) {
                const message = error.message || "Payment authorization failed. Please verify your card details.";
                setErrorMessage(message);
                toast.error(message);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                toast.success(`Payment of $${amountUSD.toFixed(2)} USD completed successfully!`);
                onSuccess();
            } else if (paymentIntent && paymentIntent.status === "processing") {
                toast.info("Payment is currently processing. Your invoice will update shortly.");
                onSuccess();
            } else {
                toast.info("Payment authentication required or in progress.");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred during checkout";
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#071313] border border-[#1a4a4a] space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7ecfc4]">Waybill / Tracking:</span>
                    <span className="font-mono font-bold text-[#e0faf5]">{trackingId}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-[#1a4a4a]/60 pt-2">
                    <span className="text-[#7ecfc4]">Total Authorized Amount:</span>
                    <span className="text-base font-black text-[#00e5c0]">
                        ${amountUSD.toFixed(2)} <span className="text-xs font-semibold text-[#7ecfc4]">USD</span>
                    </span>
                </div>
            </div>

            {/* Stripe Payment Element */}
            <div className="p-3.5 rounded-2xl bg-[#071313] border border-[#1a4a4a]">
                <PaymentElement
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#7ecfc4]/80">
                    <Lock size={12} className="text-[#00c9a7]" />
                    <span className="flex items-center gap-1">
                        Encrypted by <ShieldCheck size={12} className="text-[#00c9a7]" /> Stripe 256-bit SSL
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!stripe || !elements || isProcessing}
                        className="px-5 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-xs font-black text-[#0a0f0f] transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isProcessing && <Loader2 size={13} className="animate-spin" />}
                        <span>{isProcessing ? "Processing..." : `Pay $${amountUSD.toFixed(2)} USD`}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
