"use client";

import { MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";

export interface ShipmentOrder {
    id: string;
    code: string;
    status: "In Transit" | "Delivered" | "Waiting Courier";
    type: "Document" | "Parcel";
    departureDate: string;
    departureTime: string;
    destinationCity: string;
    destinationAddress: string;
    courierName: string;
    courierAvatar: string;
}

export const INITIAL_ORDERS: ShipmentOrder[] = [
    {
        id: "1",
        code: "ID: #26277887-ID-YK",
        status: "In Transit",
        type: "Document",
        departureDate: "06.10.2023",
        departureTime: "08.00 AM",
        destinationCity: "Celina, Delaware 10299",
        destinationAddress: "6391 Elgin St.",
        courierName: "Guy Hawkins",
        courierAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
    },
    {
        id: "2",
        code: "ID: #26277886-ID-KL",
        status: "Delivered",
        type: "Parcel",
        departureDate: "04.10.2023",
        departureTime: "07.00 AM",
        destinationCity: "Inglewood, Maine 98380",
        destinationAddress: "8502 Preston Rd.",
        courierName: "Jerome Bell",
        courierAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces",
    },
    {
        id: "3",
        code: "ID: #26277885-ID-YK",
        status: "Waiting Courier",
        type: "Document",
        departureDate: "03.10.2023",
        departureTime: "08.00 AM",
        destinationCity: "Shiloh, Hawaii 81063",
        destinationAddress: "1901 Thornridge Cir.",
        courierName: "Devon Lane",
        courierAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    },
];

interface OrderCardsListProps {
    selectedOrderId: string;
    onSelectOrder: (order: ShipmentOrder) => void;
}

export default function OrderCardsList({
    selectedOrderId,
    onSelectOrder,
}: OrderCardsListProps) {
    const handleActionClick = (e: React.MouseEvent, type: "chat" | "call", name: string) => {
        e.stopPropagation();
        if (type === "chat") {
            toast.info(`Opening chat with ${name}...`);
        } else {
            toast.info(`Calling courier ${name}...`);
        }
    };

    const getStatusBadge = (status: ShipmentOrder["status"]) => {
        switch (status) {
            case "In Transit":
                return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30";
            case "Delivered":
                return "bg-[#00e5c0]/15 text-[#00e5c0] border-[#00e5c0]/30";
            case "Waiting Courier":
                return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30";
            default:
                return "bg-[#0a1a1a] text-[#7ecfc4] border-[#1a4a4a]";
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {INITIAL_ORDERS.map((order) => {
                const isSelected = order.id === selectedOrderId;

                return (
                    <div
                        key={order.id}
                        onClick={() => onSelectOrder(order)}
                        className={`rounded-3xl p-5 transition-all duration-200 cursor-pointer border ${
                            isSelected
                                ? "bg-[#112a2a]/80 border-[#00c9a7] shadow-xl shadow-[#00c9a7]/15 ring-2 ring-[#00c9a7]/30"
                                : "bg-[#0d1f1f] border-[#1a4a4a] shadow-lg shadow-black/20 hover:border-[#00c9a7]/40 hover:bg-[#112a2a]/40"
                        }`}
                    >
                        {/* Card Header: Code & Badges */}
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#e0faf5] tracking-tight">
                                {order.code}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                                        order.status
                                    )}`}
                                >
                                    {order.status}
                                </span>
                                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0a1a1a] text-[#7ecfc4] border border-[#1a4a4a]">
                                    {order.type}
                                </span>
                            </div>
                        </div>

                        {/* Route Timeline & Location Info */}
                        <div className="mt-4 flex items-start gap-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#7ecfc4] min-w-[125px]">
                                <span className="w-2 h-2 rounded-full bg-[#00c9a7] shadow-sm shadow-[#00c9a7] flex-shrink-0" />
                                <span>
                                    {order.departureDate}
                                    <span className="block text-[11px] text-[#3a6b66] font-normal mt-0.5">
                                        {order.departureTime}
                                    </span>
                                </span>
                            </div>

                            <div className="pl-3 border-l border-[#1a4a4a] flex-1">
                                <p className="text-xs font-bold text-[#e0faf5] leading-snug">
                                    {order.destinationCity}
                                </p>
                                <p className="text-[11px] text-[#7ecfc4] mt-0.5">
                                    {order.destinationAddress}
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-[#1a4a4a]/60" />

                        {/* Footer: Courier Info & Contact Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0a1a1a] flex-shrink-0 border border-[#1a4a4a]">
                                    <img
                                        src={order.courierAvatar}
                                        alt={order.courierName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#3a6b66]">
                                        Courier
                                    </p>
                                    <p className="text-xs font-bold text-[#e0faf5] leading-none">
                                        {order.courierName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={(e) => handleActionClick(e, "chat", order.courierName)}
                                    className="w-7 h-7 rounded-full bg-[#00c9a7]/15 hover:bg-[#00c9a7]/30 text-[#00c9a7] hover:text-[#00e5c0] flex items-center justify-center transition-colors shadow-xs"
                                    title={`Message ${order.courierName}`}
                                >
                                    <MessageSquare size={13} strokeWidth={2.2} />
                                </button>
                                <button
                                    onClick={(e) => handleActionClick(e, "call", order.courierName)}
                                    className="w-7 h-7 rounded-full bg-[#00c9a7]/15 hover:bg-[#00c9a7]/30 text-[#00c9a7] hover:text-[#00e5c0] flex items-center justify-center transition-colors shadow-xs"
                                    title={`Call ${order.courierName}`}
                                >
                                    <Phone size={13} strokeWidth={2.2} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
