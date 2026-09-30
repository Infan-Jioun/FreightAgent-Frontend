"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Package,
    MapPin,
    Calendar,
    Weight,
    CheckCircle2,
    ShieldCheck,
    Loader2,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";
import { shipmentService } from "@/app/services/shipment.service";
import { ICreateShipmentPayload } from "@/app/types/shipment.types";
import { AppError } from "@/app/errorHelper/appError";

export default function CreateShipmentClient() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [weight, setWeight] = useState<string>("5");
    const [estimatedDate, setEstimatedDate] = useState<string>("");
    const [description, setDescription] = useState("");
    const [serviceTier, setServiceTier] = useState("Standard");

    // Double-submit protection: 20 req/hr rate limit guard
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        const numWeight = parseFloat(weight);
        if (isNaN(numWeight) || numWeight <= 0) {
            toast.error("Please enter a valid weight greater than 0 kg");
            return;
        }

        if (!origin.trim() || !destination.trim()) {
            toast.error("Both Origin and Destination are required");
            return;
        }

        setSubmitting(true);

        try {
            const payload: ICreateShipmentPayload = {
                origin: origin.trim(),
                destination: destination.trim(),
                weight: numWeight,
                description: description.trim()
                    ? `${description.trim()} [Tier: ${serviceTier}]`
                    : `Freight cargo [Tier: ${serviceTier}]`,
                estimatedDate: estimatedDate ? new Date(estimatedDate).toISOString() : undefined,
            };

            const created = await shipmentService.createShipment(payload);

            toast.success(`Consignment booked successfully!`, {
                description: `Tracking ID: ${created.trackingId}. Dispatched to logistics corridor.`,
            });

            // Redirect directly to live radar
            router.push(`/tracking?id=${encodeURIComponent(created.trackingId)}`);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to book shipment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    href={ROUTES.SHIPMENTS}
                    className="w-9 h-9 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] flex items-center justify-center transition-colors"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#e0faf5] tracking-tight">
                        Book Freight Consignment
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Schedule a consignment dispatch across the regional hub corridor.
                    </p>
                </div>
            </div>

            {/* Rate limit advisory alert */}
            <div className="p-3.5 rounded-2xl bg-[#00c9a7]/10 border border-[#00c9a7]/25 flex items-center gap-2.5 text-xs text-[#7ecfc4]">
                <ShieldCheck size={16} className="text-[#00c9a7] shrink-0" />
                <span>
                    Shipment orders are synchronized with the central dispatch radar and protected by carrier quota.
                </span>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Origin & Destination Route */}
                <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                    <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                        <MapPin size={16} className="text-[#00c9a7]" />
                        <span>Logistics Corridors (Route Details)</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Origin Location / Hub *
                            </label>
                            <input
                                required
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="e.g. Chicago Cargo Hub Gate 4"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Destination Terminal / Address *
                            </label>
                            <input
                                required
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g. New York Logistics Terminal 2"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00b4d8] focus:outline-hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Package Specifications */}
                <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                    <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                        <Package size={16} className="text-[#00b4d8]" />
                        <span>Cargo Specifications</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Cargo Weight (kg) *
                            </label>
                            <div className="relative">
                                <Weight size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]" />
                                <input
                                    required
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="5.0"
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#0a1a1a] rounded-xl border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00b4d8] focus:outline-hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Estimated Arrival Date (Optional)
                            </label>
                            <div className="relative">
                                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]" />
                                <input
                                    type="date"
                                    value={estimatedDate}
                                    onChange={(e) => setEstimatedDate(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#0a1a1a] rounded-xl border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00b4d8] focus:outline-hidden"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Consignment Description / Handling Notes
                            </label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe items, fragility, temperature control or special instructions..."
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] focus:outline-hidden resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Service Tier Selection */}
                <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                    <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                        <Sparkles size={16} className="text-[#fbbf24]" />
                        <span>Transit Service Tier</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { name: "Standard", desc: "3-5 Business Days", eta: "Regional Transit" },
                            { name: "Express", desc: "Next Day Priority", eta: "Air/High-speed Line" },
                            { name: "Heavy Freight", desc: "Dedicated Carrier", eta: "Maritime / Heavy Rail" },
                        ].map((tier) => {
                            const isSelected = serviceTier === tier.name;
                            return (
                                <div
                                    key={tier.name}
                                    onClick={() => setServiceTier(tier.name)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                        isSelected
                                            ? "bg-[#112a2a] border-[#00c9a7] ring-1 ring-[#00c9a7] shadow-md shadow-[#00c9a7]/10"
                                            : "bg-[#0a1a1a] border-[#1a4a4a] hover:border-[#00c9a7]/40"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#e0faf5]">{tier.name}</span>
                                        {isSelected && <CheckCircle2 size={14} className="text-[#00c9a7]" />}
                                    </div>
                                    <p className="text-[11px] text-[#7ecfc4] mt-1">{tier.desc}</p>
                                    <p className="text-[11px] font-semibold text-[#00e5c0] mt-2">{tier.eta}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Action (Guarded against double-clicks) */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href={ROUTES.SHIPMENTS}
                        className="px-5 py-2.5 rounded-full bg-[#0d1f1f] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-bold transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-full bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-lg shadow-[#00c9a7]/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        <span>{submitting ? "Booking Consignment..." : "Confirm & Dispatch Consignment"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
