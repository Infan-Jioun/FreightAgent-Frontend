"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Package,
    TrendingUp,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Activity,
    Server,
    FileSpreadsheet,
    Eye,
    ChevronRight,
    ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ROUTES } from "@/app/constants/routes";

interface PendingAgent {
    id: string;
    name: string;
    email: string;
    vehicleType: string;
    licenseNo: string;
    dateApplied: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
}

const INITIAL_PENDING_AGENTS: PendingAgent[] = [
    {
        id: "1",
        name: "Marcus Sterling",
        email: "marcus.s@freightvan.com",
        vehicleType: "Heavy Freight Truck (Class A)",
        licenseNo: "CDL-9082341",
        dateApplied: "Today, 10:45 AM",
        status: "PENDING",
    },
    {
        id: "2",
        name: "Elena Rostova",
        email: "elena.r@translog.org",
        vehicleType: "Sprinter Cargo Van",
        licenseNo: "CDL-6712390",
        dateApplied: "Today, 09:12 AM",
        status: "PENDING",
    },
    {
        id: "3",
        name: "David Chen",
        email: "d.chen@apexlogistics.io",
        vehicleType: "Medium Box Truck (16ft)",
        licenseNo: "CDL-3349012",
        dateApplied: "Yesterday, 04:30 PM",
        status: "PENDING",
    },
];

export default function AdminDashboard() {
    const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>(INITIAL_PENDING_AGENTS);

    const handleApprove = (id: string, name: string) => {
        setPendingAgents((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a))
        );
        toast.success(`Agent ${name} approved successfully!`);
    };

    const handleReject = (id: string, name: string) => {
        setPendingAgents((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a))
        );
        toast.error(`Agent application for ${name} rejected.`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 pb-8"
        >
            {/* System Health Status Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white shadow-md shadow-rose-900/40 flex-shrink-0">
                        <Activity size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-bold text-[#e0faf5]">
                                Platform Command Center
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00e5c0]/15 text-[#00e5c0] border border-[#00e5c0]/30 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-pulse" />
                                ALL SYSTEMS OPERATIONAL
                            </span>
                        </div>
                        <p className="text-xs text-[#7ecfc4] mt-0.5 flex items-center gap-3">
                            <span>Latency: <strong className="text-[#00e5c0]">14ms</strong></span>
                            <span>•</span>
                            <span>Active Sessions: <strong className="text-[#e0faf5]">342 users</strong></span>
                            <span>•</span>
                            <span>Uptime: <strong className="text-[#e0faf5]">99.98%</strong></span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toast.success("System diagnostic report generated.")}
                        className="px-4 py-2 rounded-xl bg-[#112a2a] hover:bg-[#163838] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-bold transition-colors"
                    >
                        Run Health Check
                    </button>
                    <button
                        onClick={() => toast.info("Exporting platform data in CSV...")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-90"
                    >
                        <FileSpreadsheet size={15} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* 4 Executive Platform KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1 */}
                <Link
                    href={ROUTES.ADMIN_USERS}
                    className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#00c9a7]/40 transition-all block group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4] group-hover:text-[#e0faf5] transition-colors">Total Platform Users</span>
                        <div className="w-8 h-8 rounded-lg bg-[#00c9a7]/15 text-[#00c9a7] flex items-center justify-center group-hover:bg-[#00c9a7]/25 transition-colors">
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">User Directory</span>
                        <span className="text-xs font-semibold text-[#00e5c0] flex items-center gap-0.5">
                            Manage <ChevronRight size={12} />
                        </span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">Role assignments, KYC, & directory</p>
                </Link>

                {/* KPI 2 */}
                <div className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#00b4d8]/40 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4]">Active Drivers On Duty</span>
                        <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/15 text-[#00b4d8] flex items-center justify-center">
                            <Activity size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">142</span>
                        <span className="text-xs font-semibold text-[#00b4d8]">94% coverage</span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">Active across 18 regional hubs</p>
                </div>

                {/* KPI 3 */}
                <div className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#00e5c0]/40 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4]">Gross Freight Volume</span>
                        <div className="w-8 h-8 rounded-lg bg-[#00e5c0]/15 text-[#00e5c0] flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">$248.5K</span>
                        <span className="text-xs font-semibold text-[#00e5c0]">+18.2%</span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">Platform volume this month</p>
                </div>

                {/* KPI 4 */}
                <div className="bg-[#0d1f1f] rounded-2xl p-5 border border-[#1a4a4a] shadow-sm hover:border-[#f59e0b]/40 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#7ecfc4]">Pending Approvals</span>
                        <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center">
                            <ShieldAlert size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#e0faf5]">
                            {pendingAgents.filter((a) => a.status === "PENDING").length}
                        </span>
                        <span className="text-xs font-semibold text-[#f59e0b]">Action required</span>
                    </div>
                    <p className="text-[11px] text-[#3a6b66] mt-1">Awaiting CDL/KYC verification</p>
                </div>
            </div>

            {/* Management Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left: Pending Agent Approvals Queue (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                            <span>Agent Onboarding & KYC Queue</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] text-[10px] font-bold">
                                {pendingAgents.filter((a) => a.status === "PENDING").length} Pending
                            </span>
                        </h3>
                        <Link
                            href={ROUTES.ADMIN_USERS}
                            className="text-xs text-[#00e5c0] hover:underline flex items-center gap-1"
                        >
                            <span>Manage All Users</span>
                            <ChevronRight size={13} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className="p-4 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/40 transition-all"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#e0faf5]">{agent.name}</span>
                                            <span className="text-[10px] text-[#7ecfc4] font-medium">• {agent.email}</span>
                                        </div>
                                        <p className="text-[11px] text-[#3a6b66] mt-0.5">
                                            Vehicle: <span className="text-[#7ecfc4]">{agent.vehicleType}</span> • License: <span className="text-[#e0faf5] font-mono">{agent.licenseNo}</span>
                                        </p>
                                    </div>

                                    <span
                                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                            agent.status === "APPROVED"
                                                ? "bg-[#00e5c0]/15 text-[#00e5c0] border-[#00e5c0]/30"
                                                : agent.status === "REJECTED"
                                                ? "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/30"
                                                : "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30"
                                        }`}
                                    >
                                        {agent.status}
                                    </span>
                                </div>

                                <div className="mt-3 pt-3 border-t border-[#1a4a4a]/60 flex items-center justify-between">
                                    <span className="text-[10px] text-[#3a6b66]">Applied: {agent.dateApplied}</span>
                                    {agent.status === "PENDING" && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleReject(agent.id, agent.name)}
                                                className="px-3 py-1 rounded-lg bg-[#ff6b6b]/15 hover:bg-[#ff6b6b]/25 text-[#ff6b6b] text-[11px] font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <XCircle size={13} />
                                                <span>Reject</span>
                                            </button>
                                            <button
                                                onClick={() => handleApprove(agent.id, agent.name)}
                                                className="px-3 py-1 rounded-lg bg-[#00c9a7]/20 hover:bg-[#00c9a7]/30 text-[#00e5c0] border border-[#00c9a7]/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <CheckCircle2 size={13} />
                                                <span>Approve Agent</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Live Platform Activity Audit (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]">
                            <span className="text-xs font-bold text-[#e0faf5] flex items-center gap-2">
                                <Activity size={15} className="text-[#00c9a7]" />
                                Live System Audit Feed
                            </span>
                            <span className="text-[10px] font-bold text-[#00e5c0] bg-[#00c9a7]/15 px-2 py-0.5 rounded-full border border-[#00c9a7]/30">
                                Realtime
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#e0faf5]">Delivery Completed</span>
                                    <span className="text-[10px] text-[#3a6b66]">2 mins ago</span>
                                </div>
                                <p className="text-[#7ecfc4] text-[11px]">
                                    Courier Guy Hawkins delivered package #26277887 to Celina, DE.
                                </p>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#00b4d8]">New Shipment Created</span>
                                    <span className="text-[10px] text-[#3a6b66]">8 mins ago</span>
                                </div>
                                <p className="text-[#7ecfc4] text-[11px]">
                                    Express Cargo from Chicago Hub to New York dispatched.
                                </p>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#f59e0b]">Agent Login Verified</span>
                                    <span className="text-[10px] text-[#3a6b66]">14 mins ago</span>
                                </div>
                                <p className="text-[#7ecfc4] text-[11px]">
                                    Agent Jerome Bell started active shift on Vehicle #FA-881.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={ROUTES.ADMIN_SHIPMENTS}
                            className="w-full py-2.5 rounded-xl bg-[#112a2a] hover:bg-[#163838] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <span>View All Platform Shipments</span>
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
