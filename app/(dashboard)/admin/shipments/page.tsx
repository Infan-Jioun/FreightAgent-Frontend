"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Package,
    Search,
    Filter,
    Truck,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    ExternalLink,
    Anchor,
    Plane,
} from "lucide-react";
import { toast } from "sonner";

interface AdminShipment {
    id: string;
    trackingCode: string;
    sender: string;
    recipient: string;
    origin: string;
    destination: string;
    status: "IN_TRANSIT" | "DELIVERED" | "FLAGGED" | "PENDING";
    carrier: string;
    driver: string;
    freightType: "Air Express" | "Maritime Cargo" | "Ground Freight";
    weight: string;
    dateBooked: string;
    eta: string;
}

const ALL_SHIPMENTS: AdminShipment[] = [
    {
        id: "shp_1",
        trackingCode: "#26277887-ID-YK",
        sender: "Apple Logistics Hub",
        recipient: "Celina Electronics Store",
        origin: "Chicago, IL Hub",
        destination: "Celina, Delaware 10299",
        status: "IN_TRANSIT",
        carrier: "FreightAgent Prime",
        driver: "Guy Hawkins",
        freightType: "Ground Freight",
        weight: "4.2 lbs",
        dateBooked: "06 Oct, 2023",
        eta: "Today 4:45 PM",
    },
    {
        id: "shp_2",
        trackingCode: "#26277886-ID-KL",
        sender: "NorthEast Timber Corp",
        recipient: "Inglewood Construction",
        origin: "New York Hub",
        destination: "Inglewood, Maine 98380",
        status: "DELIVERED",
        carrier: "FreightAgent Standard",
        driver: "Jerome Bell",
        freightType: "Maritime Cargo",
        weight: "1.8 tons",
        dateBooked: "03 Oct, 2023",
        eta: "Completed Oct 04",
    },
    {
        id: "shp_3",
        trackingCode: "#26277885-ID-YK",
        sender: "Southwest Aerospace",
        recipient: "Honolulu Air Terminal",
        origin: "Dallas Logistics Center",
        destination: "Shiloh, Hawaii 81063",
        status: "PENDING",
        carrier: "Pacific Star Cargo",
        driver: "Devon Lane",
        freightType: "Air Express",
        weight: "18.5 lbs",
        dateBooked: "03 Oct, 2023",
        eta: "Oct 10, 2023",
    },
    {
        id: "shp_4",
        trackingCode: "#26277899-ID-SF",
        sender: "Cascade Medical Supply",
        recipient: "Austin Health District",
        origin: "Seattle Port Hub",
        destination: "Austin, Texas 78701",
        status: "IN_TRANSIT",
        carrier: "SwiftWay Express",
        driver: "Marcus Sterling",
        freightType: "Air Express",
        weight: "6.7 lbs",
        dateBooked: "07 Oct, 2023",
        eta: "Tomorrow 10:00 AM",
    },
    {
        id: "shp_5",
        trackingCode: "#26277912-ID-FL",
        sender: "Miami ColdChain Imports",
        recipient: "Atlanta Wholesale Grocers",
        origin: "Miami Port Gate 4",
        destination: "Atlanta, GA 30301",
        status: "FLAGGED",
        carrier: "Reefer Express Co.",
        driver: "Arthur Vance",
        freightType: "Ground Freight",
        weight: "8,400 lbs",
        dateBooked: "05 Oct, 2023",
        eta: "Delayed (Customs Inspection)",
    },
];

export default function AdminShipmentsPage() {
    const [shipments, setShipments] = useState<AdminShipment[]>(ALL_SHIPMENTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_TRANSIT" | "DELIVERED" | "FLAGGED" | "PENDING">("ALL");

    const filtered = shipments.filter((item) => {
        const matchesQuery =
            item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.driver.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    const getStatusStyle = (status: AdminShipment["status"]) => {
        switch (status) {
            case "DELIVERED":
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40";
            case "IN_TRANSIT":
                return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/40";
            case "FLAGGED":
                return "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/40";
            case "PENDING":
                return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40";
        }
    };

    const handleExport = () => {
        toast.success("Global manifest exported to CSV format");
    };

    return (
        <div className="space-y-6">
            {/* Header + Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                        Global Freight & Consignment Manifest
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Central dispatch authority: Track all global consignments, waybills, and transit checkpoints.
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    className="px-4 py-2.5 rounded-2xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center justify-center gap-2"
                >
                    <Download size={15} />
                    <span>Export Manifest (CSV)</span>
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Consignments</span>
                        <Package size={16} className="text-[#00c9a7]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{shipments.length}</p>
                    <span className="text-[10px] text-[#7ecfc4] font-semibold mt-0.5 block">Across all corridors</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">In Transit Live</span>
                        <Truck size={16} className="text-[#00b4d8]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">
                        {shipments.filter((s) => s.status === "IN_TRANSIT").length}
                    </p>
                    <span className="text-[10px] text-[#00b4d8] font-semibold mt-0.5 block">Active on radar</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
                        <CheckCircle2 size={16} className="text-[#00e5c0]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">
                        {shipments.filter((s) => s.status === "DELIVERED").length}
                    </p>
                    <span className="text-[10px] text-[#00e5c0] font-semibold mt-0.5 block">Signed & confirmed</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Flagged / Customs</span>
                        <AlertTriangle size={16} className="text-[#ff6b6b]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">
                        {shipments.filter((s) => s.status === "FLAGGED").length}
                    </p>
                    <span className="text-[10px] text-[#ff6b6b] font-semibold mt-0.5 block">Requires intervention</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-black/20">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] w-full md:w-auto overflow-x-auto">
                    {(["ALL", "IN_TRANSIT", "DELIVERED", "FLAGGED", "PENDING"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                                statusFilter === s
                                    ? "bg-[#00c9a7] text-[#0a0f0f] shadow-sm"
                                    : "text-[#7ecfc4] hover:text-[#e0faf5]"
                            }`}
                        >
                            {s.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tracking, sender, driver..."
                        className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                    />
                </div>
            </div>

            {/* Shipments Table */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                <th className="py-3.5 px-4">Tracking Waybill</th>
                                <th className="py-3.5 px-4">Route (Origin → Dest)</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Carrier & Driver</th>
                                <th className="py-3.5 px-4">Freight Class</th>
                                <th className="py-3.5 px-4">ETA</th>
                                <th className="py-3.5 px-4 text-right">Radar / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a4a4a]/40">
                            {filtered.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-[#112a2a]/40 transition-colors group"
                                >
                                    {/* Tracking ID & Merchant */}
                                    <td className="py-3 px-4">
                                        <div className="min-w-0">
                                            <span className="font-mono font-bold text-[#e0faf5] block truncate">
                                                {item.trackingCode}
                                            </span>
                                            <span className="text-[11px] text-[#7ecfc4]/70 truncate block">
                                                From: {item.sender}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Route */}
                                    <td className="py-3 px-4">
                                        <div className="min-w-0 max-w-[180px]">
                                            <span className="text-[#e0faf5] font-semibold truncate block">
                                                {item.origin}
                                            </span>
                                            <span className="text-[11px] text-[#7ecfc4] truncate block">
                                                → {item.destination}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 px-4">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(
                                                item.status
                                            )}`}
                                        >
                                            {item.status.replace(/_/g, " ")}
                                        </span>
                                    </td>

                                    {/* Driver */}
                                    <td className="py-3 px-4">
                                        <div>
                                            <span className="text-[#e0faf5] font-medium block">
                                                {item.driver}
                                            </span>
                                            <span className="text-[10px] text-[#3a6b66] block">
                                                {item.carrier}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Freight Class */}
                                    <td className="py-3 px-4">
                                        <div>
                                            <span className="text-[#7ecfc4] font-medium block">
                                                {item.freightType}
                                            </span>
                                            <span className="text-[10px] text-[#3a6b66]">
                                                {item.weight}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ETA */}
                                    <td className="py-3 px-4 text-[#e0faf5] font-semibold">
                                        {item.eta}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-right">
                                        <Link
                                            href={`/tracking?id=${encodeURIComponent(item.trackingCode)}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-[11px] font-bold transition-colors"
                                        >
                                            <Eye size={12} />
                                            <span>Live Radar</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <Package size={36} className="mx-auto text-[#3a6b66] mb-2" />
                        <p className="text-xs font-bold text-[#e0faf5]">No consignments match filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}
