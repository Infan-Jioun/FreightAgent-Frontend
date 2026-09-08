"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Truck,
    PackageCheck,
    Clock,
    DollarSign,
    Navigation,
    Phone,
    CheckCircle2,
    AlertCircle,
    MapPin,
    ArrowUpRight,
    QrCode,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface DeliveryTask {
    id: string;
    trackingCode: string;
    customerName: string;
    phone: string;
    address: string;
    timeWindow: string;
    packageType: string;
    weight: string;
    status: "OUT_FOR_DELIVERY" | "PICKUP_PENDING" | "DELIVERED" | "ATTEMPTED";
}

const INITIAL_AGENT_TASKS: DeliveryTask[] = [
    {
        id: "1",
        trackingCode: "#26277887-ID-YK",
        customerName: "Sarah Jenkins",
        phone: "+1 (555) 234-5678",
        address: "6391 Elgin St, Celina, Delaware 10299",
        timeWindow: "09:00 AM - 11:30 AM",
        packageType: "Fragile Electronics",
        weight: "4.2 lbs",
        status: "OUT_FOR_DELIVERY",
    },
    {
        id: "2",
        trackingCode: "#26277890-ID-DE",
        customerName: "Robert Fox",
        phone: "+1 (555) 876-5432",
        address: "8502 Preston Rd, Inglewood, Maine 98380",
        timeWindow: "12:00 PM - 02:00 PM",
        packageType: "Priority Express",
        weight: "1.8 lbs",
        status: "PICKUP_PENDING",
    },
    {
        id: "3",
        trackingCode: "#26277894-ID-NJ",
        customerName: "Eleanor Pena",
        phone: "+1 (555) 432-1098",
        address: "1901 Thornridge Cir, Shiloh, Hawaii 81063",
        timeWindow: "02:30 PM - 04:30 PM",
        packageType: "Standard Document",
        weight: "0.5 lbs",
        status: "OUT_FOR_DELIVERY",
    },
    {
        id: "4",
        trackingCode: "#26277882-ID-PA",
        customerName: "Cameron Williamson",
        phone: "+1 (555) 901-2345",
        address: "4140 Parker Rd, Allentown, PA 18104",
        timeWindow: "08:15 AM",
        packageType: "Heavy Freight",
        weight: "42.0 lbs",
        status: "DELIVERED",
    },
];

export default function AgentDashboard() {
    const [tasks, setTasks] = useState<DeliveryTask[]>(INITIAL_AGENT_TASKS);
    const [selectedTaskId, setSelectedTaskId] = useState<string>("1");
    const [isOnDuty, setIsOnDuty] = useState(true);

    const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

    const handleUpdateStatus = (taskId: string, newStatus: DeliveryTask["status"]) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        toast.success(`Task status updated to ${newStatus.replace(/_/g, " ")}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 pb-8"
        >
            {/* Top Shift Status Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20 flex-shrink-0">
                        <Truck size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-bold text-[#e0faf5]">
                                Agent Operations Hub
                            </h2>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                                    isOnDuty
                                        ? "bg-[#00e5c0]/15 text-[#00e5c0] border-[#00e5c0]/30"
                                        : "bg-slate-800 text-slate-400 border-slate-700"
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        isOnDuty ? "bg-[#00e5c0] animate-pulse" : "bg-slate-500"
                                    }`}
                                />
                                {isOnDuty ? "ACTIVE SHIFT" : "OFF DUTY"}
                            </span>
                        </div>
                        <p className="text-xs text-[#7ecfc4] mt-0.5">
                            Assigned Vehicle: <span className="text-[#e0faf5] font-semibold">FreightVan #FA-904</span> • Shift: 04h 32m active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setIsOnDuty(!isOnDuty);
                            toast.info(isOnDuty ? "You have gone off-duty." : "You are now on-duty and receiving dispatches.");
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isOnDuty
                                ? "bg-[#112a2a] text-[#7ecfc4] border-[#1a4a4a] hover:text-[#e0faf5]"
                                : "bg-[#00c9a7] text-[#0a0f0f] border-[#00c9a7] shadow-md shadow-[#00c9a7]/20"
                        }`}
                    >
                        {isOnDuty ? "Go Off Duty" : "Start Active Shift"}
                    </button>
                    <button
                        onClick={() => toast.info("Syncing latest dispatches...")}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-95"
                    >
                        Sync Dispatches
                    </button>
                </div>
            </div>

            {/* 4 Agent Operational KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#00c9a7]/40 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4]">Active Drops</span>
                        <div className="w-8 h-8 rounded-lg bg-[#00c9a7]/15 text-[#00c9a7] flex items-center justify-center">
                            <Truck size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">14</span>
                        <span className="text-xs font-semibold text-[#00e5c0]">+3 scheduled</span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">4 express drops next</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#00b4d8]/40 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4]">Pending Pickups</span>
                        <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/15 text-[#00b4d8] flex items-center justify-center">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">6</span>
                        <span className="text-xs font-semibold text-[#00b4d8]">Hub staging</span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">2 urgent pickups ready</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#00e5c0]/40 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4]">Success Rate</span>
                        <div className="w-8 h-8 rounded-lg bg-[#00e5c0]/15 text-[#00e5c0] flex items-center justify-center">
                            <PackageCheck size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">99.2%</span>
                        <span className="text-xs font-semibold text-[#00e5c0]">4.98 ★</span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">118 on-time this week</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#f59e0b]/40 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4]">Today&apos;s Earnings</span>
                        <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">$342.50</span>
                        <span className="text-xs font-semibold text-[#f59e0b]">+$48 bonus</span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">Est. payout Friday</p>
                </div>
            </div>

            {/* Main Dispatch Grid: Left Task Queue & Right Next Drop Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Task Manifest (8 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                            <span>Assigned Delivery Queue</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] text-[10px] font-bold">
                                {tasks.length} Active
                            </span>
                        </h3>
                        <span className="text-xs text-[#7ecfc4]">Order by ETA</span>
                    </div>

                    <div className="space-y-3">
                        {tasks.map((task) => {
                            const isSelected = task.id === selectedTaskId;

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-[#112a2a] border-[#00c9a7] shadow-lg shadow-[#00c9a7]/10 ring-1 ring-[#00c9a7]/30"
                                            : "bg-[#0d1f1f] border-[#1a4a4a] hover:border-[#00c9a7]/40 hover:bg-[#112a2a]/40"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xs font-bold text-[#e0faf5]">
                                                {task.trackingCode}
                                            </span>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0a1a1a] text-[#7ecfc4] border border-[#1a4a4a]">
                                                {task.packageType}
                                            </span>
                                        </div>

                                        <span
                                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                task.status === "DELIVERED"
                                                    ? "bg-[#00e5c0]/15 text-[#00e5c0] border-[#00e5c0]/30"
                                                    : task.status === "OUT_FOR_DELIVERY"
                                                    ? "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30"
                                                    : "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30"
                                            }`}
                                        >
                                            {task.status.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    <div className="mt-2.5 flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-[#e0faf5]">{task.customerName}</p>
                                            <p className="text-[11px] text-[#7ecfc4] mt-0.5 flex items-center gap-1">
                                                <MapPin size={12} className="text-[#00c9a7] flex-shrink-0" />
                                                <span className="truncate">{task.address}</span>
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[11px] text-[#3a6b66] font-medium">Window</p>
                                            <p className="text-xs font-semibold text-[#e0faf5]">{task.timeWindow}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-3 pt-3 border-t border-[#1a4a4a]/60 flex items-center justify-between">
                                        <span className="text-[11px] text-[#3a6b66]">Weight: {task.weight}</span>
                                        <div className="flex items-center gap-2">
                                            {task.status !== "DELIVERED" ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateStatus(task.id, "DELIVERED");
                                                    }}
                                                    className="px-3 py-1 rounded-lg bg-[#00c9a7]/20 hover:bg-[#00c9a7]/30 text-[#00e5c0] border border-[#00c9a7]/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                                                >
                                                    <CheckCircle2 size={13} />
                                                    <span>Mark Delivered</span>
                                                </button>
                                            ) : (
                                                <span className="text-[11px] font-semibold text-[#00e5c0] flex items-center gap-1">
                                                    <CheckCircle2 size={13} /> Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Active Drop Details & GPS Card (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                    {/* Active Destination Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]">
                            <span className="text-xs font-bold text-[#00e5c0] uppercase tracking-wider flex items-center gap-1.5">
                                <Navigation size={14} />
                                Next Stop Drop-off
                            </span>
                            <span className="text-[11px] font-bold text-[#e0faf5] bg-[#0a1a1a] px-2.5 py-1 rounded-lg border border-[#1a4a4a]">
                                ETA: 12 Mins
                            </span>
                        </div>

                        <div>
                            <span className="text-[10px] text-[#3a6b66] font-semibold uppercase">Recipient</span>
                            <p className="text-sm font-bold text-[#e0faf5] mt-0.5">{activeTask.customerName}</p>
                            <p className="text-xs text-[#7ecfc4] mt-1">{activeTask.address}</p>
                        </div>

                        {/* Direct Actions */}
                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                            <button
                                onClick={() => toast.info(`Navigating to ${activeTask.address}...`)}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-90"
                            >
                                <Navigation size={14} />
                                <span>Start GPS</span>
                            </button>
                            <button
                                onClick={() => toast.info(`Calling customer ${activeTask.customerName}...`)}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-bold"
                            >
                                <Phone size={14} />
                                <span>Call Customer</span>
                            </button>
                        </div>

                        {/* Scanner action */}
                        <button
                            onClick={() => toast.success(`Barcode scanned for ${activeTask.trackingCode}!`)}
                            className="w-full py-2.5 rounded-xl bg-[#0a1a1a] hover:bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <QrCode size={16} className="text-[#00c9a7]" />
                            <span>Scan Parcel Barcode</span>
                        </button>
                    </div>

                    {/* Today's Route Metrics Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-[#e0faf5] flex items-center justify-between">
                            <span>Route Efficiency</span>
                            <span className="text-[#00e5c0]">78% Completed</span>
                        </h4>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] rounded-full w-[78%] shadow-sm shadow-[#00c9a7]" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66]">Distance Covered</span>
                                <p className="font-bold text-[#e0faf5] mt-0.5">148.4 miles</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66]">Stops Remaining</span>
                                <p className="font-bold text-[#e0faf5] mt-0.5">4 drops left</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
