"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Package,
    MapPin,
    Truck,
    Clock,
    DollarSign,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";

export default function CreateShipmentPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        senderName: "",
        senderPhone: "",
        pickupAddress: "",
        receiverName: "",
        receiverPhone: "",
        deliveryAddress: "",
        packageType: "Parcel",
        weight: "5",
        serviceTier: "Express",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        setTimeout(() => {
            setSubmitting(false);
            const randomCode = `#FA-${Math.floor(100000 + Math.random() * 900000)}`;
            toast.success(`Shipment ${randomCode} created successfully!`, {
                description: "Courier dispatch order has been placed.",
            });
            router.push(ROUTES.SHIPMENTS);
        }, 1200);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
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
                        Create New Consignment
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Schedule a pickup and book delivery across the regional hub network.
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Sender & Pickup Section */}
                <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                    <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                        <MapPin size={16} className="text-[#00c9a7]" />
                        <span>Pickup Details (Origin)</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Sender Name
                            </label>
                            <input
                                required
                                type="text"
                                value={form.senderName}
                                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                                placeholder="e.g. John Doe / Acme Corp"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Contact Phone
                            </label>
                            <input
                                required
                                type="tel"
                                value={form.senderPhone}
                                onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] outline-none"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Complete Pickup Address
                            </label>
                            <input
                                required
                                type="text"
                                value={form.pickupAddress}
                                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                                placeholder="Street, Suite, City, State, ZIP"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Destination Details */}
                <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                    <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                        <MapPin size={16} className="text-[#00b4d8]" />
                        <span>Delivery Details (Destination)</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Recipient Name
                            </label>
                            <input
                                required
                                type="text"
                                value={form.receiverName}
                                onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                                placeholder="e.g. Sarah Jenkins"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00b4d8] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Recipient Phone
                            </label>
                            <input
                                required
                                type="tel"
                                value={form.receiverPhone}
                                onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00b4d8] outline-none"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                                Delivery Address
                            </label>
                            <input
                                required
                                type="text"
                                value={form.deliveryAddress}
                                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                                placeholder="Street, Apt/Building, City, State, ZIP"
                                className="w-full bg-[#0a1a1a] rounded-xl px-4 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00b4d8] outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Package & Service Tier */}
                <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                    <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                        <Package size={16} className="text-[#f59e0b]" />
                        <span>Package & Shipping Tier</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        {[
                            { name: "Standard", desc: "3-5 Business Days", price: "$24.50" },
                            { name: "Express", desc: "Next Day Delivery", price: "$48.00" },
                            { name: "Heavy Freight", desc: "Dedicated Carrier", price: "$125.00" },
                        ].map((tier) => {
                            const isSelected = form.serviceTier === tier.name;
                            return (
                                <div
                                    key={tier.name}
                                    onClick={() => setForm({ ...form, serviceTier: tier.name })}
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
                                    <p className="text-sm font-extrabold text-[#00e5c0] mt-3">{tier.price}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Action */}
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
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-lg shadow-[#00c9a7]/20 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {submitting ? "Booking Consignment..." : "Confirm & Book Shipment"}
                    </button>
                </div>
            </form>
        </div>
    );
}
