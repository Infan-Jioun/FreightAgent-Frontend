"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Package,
    Search,
    Plus,
    Filter,
    ArrowUpRight,
    MapPin,
    Clock,
    Truck,
} from "lucide-react";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";

interface ShipmentItem {
    id: string;
    trackingCode: string;
    origin: string;
    destination: string;
    status: "IN_TRANSIT" | "DELIVERED" | "PENDING";
    type: "Express" | "Freight" | "Standard";
    weight: string;
    date: string;
    courier: string;
}

const SHIPMENT_DATA: ShipmentItem[] = [
    {
        id: "1",
        trackingCode: "#26277887-ID-YK",
        origin: "Chicago, IL Hub",
        destination: "Celina, Delaware 10299",
        status: "IN_TRANSIT",
        type: "Express",
        weight: "4.2 lbs",
        date: "06 Oct, 2023",
        courier: "Guy Hawkins",
    },
    {
        id: "2",
        trackingCode: "#26277886-ID-KL",
        origin: "New York Hub",
        destination: "Inglewood, Maine 98380",
        status: "DELIVERED",
        type: "Standard",
        weight: "1.8 lbs",
        date: "04 Oct, 2023",
        courier: "Jerome Bell",
    },
    {
        id: "3",
        trackingCode: "#26277885-ID-YK",
        origin: "Dallas Logistics Center",
        destination: "Shiloh, Hawaii 81063",
        status: "PENDING",
        type: "Freight",
        weight: "18.5 lbs",
        date: "03 Oct, 2023",
        courier: "Devon Lane",
    },
    {
        id: "4",
        trackingCode: "#26277899-ID-SF",
        origin: "Seattle Port Hub",
        destination: "Austin, Texas 78701",
        status: "IN_TRANSIT",
        type: "Express",
        weight: "6.7 lbs",
        date: "07 Oct, 2023",
        courier: "Marcus Sterling",
    },
];

export default function ShipmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTab, setFilterTab] = useState<"ALL" | "IN_TRANSIT" | "DELIVERED" | "PENDING">("ALL");

    const filtered = SHIPMENT_DATA.filter((s) => {
        const matchesFilter = filterTab === "ALL" || s.status === filterTab;
        const matchesSearch =
            s.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.courier.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getBadgeStyle = (status: ShipmentItem["status"]) => {
        switch (status) {
            case "IN_TRANSIT":
                return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30";
            case "DELIVERED":
                return "bg-[#00e5c0]/15 text-[#00e5c0] border-[#00e5c0]/30";
            case "PENDING":
                return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30";
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#e0faf5] tracking-tight">
                        Shipments & Manifests
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-1">
                        Track, monitor, and manage all outgoing and incoming consignments.
                    </p>
                </div>

                <Link
                    href={ROUTES.SHIPMENT_CREATE}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-lg shadow-[#00c9a7]/20 hover:opacity-90 transition-all self-start sm:self-auto"
                >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Create Shipment</span>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a]">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {(["ALL", "IN_TRANSIT", "DELIVERED", "PENDING"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilterTab(tab)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterTab === tab
                                    ? "bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/40 shadow-sm"
                                    : "text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                            }`}
                        >
                            {tab.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-[#0a1a1a] px-3.5 py-1.5 rounded-xl border border-[#1a4a4a] focus-within:border-[#00c9a7]">
                    <Search size={14} className="text-[#3a6b66]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter shipments..."
                        className="bg-transparent border-none outline-none text-xs text-[#e0faf5] placeholder:text-[#3a6b66] w-48"
                    />
                </div>
            </div>

            {/* Shipments Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item) => (
                    <div
                        key={item.id}
                        className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/40 hover:bg-[#112a2a]/40 shadow-lg shadow-black/20 transition-all space-y-4"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#e0faf5] tracking-tight">
                                {item.trackingCode}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0a1a1a] text-[#7ecfc4] border border-[#1a4a4a]">
                                    {item.type}
                                </span>
                                <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                                        item.status
                                    )}`}
                                >
                                    {item.status.replace(/_/g, " ")}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-[10px] text-[#3a6b66] font-medium flex items-center gap-1">
                                    <MapPin size={11} className="text-[#00c9a7]" /> Origin
                                </span>
                                <p className="font-semibold text-[#e0faf5] mt-0.5 truncate">{item.origin}</p>
                            </div>

                            <div>
                                <span className="text-[10px] text-[#3a6b66] font-medium flex items-center gap-1">
                                    <MapPin size={11} className="text-[#00b4d8]" /> Destination
                                </span>
                                <p className="font-semibold text-[#e0faf5] mt-0.5 truncate">{item.destination}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#1a4a4a]/60 flex items-center justify-between text-xs">
                            <span className="text-[#7ecfc4]">Courier: <strong className="text-[#e0faf5]">{item.courier}</strong></span>
                            <span className="text-[#3a6b66]">{item.date} • {item.weight}</span>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full p-12 text-center rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                        <Package size={36} className="mx-auto text-[#3a6b66] mb-3" />
                        <p className="text-sm font-bold text-[#e0faf5]">No shipments match your search</p>
                        <p className="text-xs text-[#7ecfc4] mt-1">Try a different query or clear the filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
