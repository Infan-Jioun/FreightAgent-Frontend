"use client";

import React, { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CreditCard, ArrowRight } from "lucide-react";
import { IShipment } from "@/app/types/shipment.types";
import { CheckoutForm } from "./CheckoutForm";
import { Modal } from "@/components/ui/Modal";

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface StripePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    shipment: IShipment | null;
    clientSecret: string | null;
    amountUSD: number;
}

export function StripePaymentModal({
    isOpen,
    onClose,
    onSuccess,
    shipment,
    clientSecret,
    amountUSD,
}: StripePaymentModalProps): React.JSX.Element | null {
    const appearance = useMemo(
        () => ({
            theme: "night" as const,
            variables: {
                colorPrimary: "#00c9a7",
                colorBackground: "#071313",
                colorText: "#e0faf5",
                colorDanger: "#ff6b6b",
                fontFamily: "Inter, system-ui, sans-serif",
                borderRadius: "12px",
            },
            rules: {
                ".Input": {
                    border: "1px solid #1a4a4a",
                    backgroundColor: "#0a1a1a",
                },
                ".Input:focus": {
                    border: "1px solid #00c9a7",
                    boxShadow: "0 0 0 1px #00c9a7",
                },
            },
        }),
        []
    );

    if (!isOpen || !shipment || !clientSecret) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="lg"
            icon={<CreditCard size={18} />}
            title={
                <div>
                    <span className="text-[10px] font-mono text-[#00e5c0] uppercase tracking-wider block">
                        Freight Settlement
                    </span>
                    <span>Checkout Consignment</span>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Route Pill */}
                <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                    <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-[#e0faf5]">{shipment.origin}</span>
                        <ArrowRight size={13} className="text-[#00c9a7] shrink-0" />
                        <span className="font-semibold text-[#e0faf5]">{shipment.destination}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#7ecfc4] shrink-0">
                        {shipment.weight} kg
                    </span>
                </div>

                {/* Stripe Elements Context */}
                {stripePromise ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance,
                        }}
                    >
                        <CheckoutForm
                            shipmentId={shipment.id}
                            trackingId={shipment.trackingId}
                            amountUSD={amountUSD}
                            onSuccess={() => {
                                onSuccess();
                                onClose();
                            }}
                            onCancel={onClose}
                        />
                    </Elements>
                ) : (
                    <div className="p-6 text-center text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                        Stripe publishable key is not configured in your environment.
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default StripePaymentModal;
