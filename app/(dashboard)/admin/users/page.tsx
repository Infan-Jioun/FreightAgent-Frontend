"use client";

import { useState } from "react";
import {
    Users,
    Search,
    Shield,
    Truck,
    CheckCircle2,
    Clock,
    MoreVertical,
    UserPlus,
    Filter,
    Mail,
    AlertCircle,
    UserCheck,
    Ban,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ManagedUser {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "AGENT" | "CUSTOMER";
    status: "ACTIVE" | "PENDING_KYC" | "SUSPENDED";
    emailVerified: boolean;
    createdAt: string;
    shipmentsCount: number;
}

const INITIAL_USERS: ManagedUser[] = [
    {
        id: "usr_1",
        name: "Devon Lane",
        email: "devon.lane@freightagent.com",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: "Jan 12, 2023",
        shipmentsCount: 1420,
    },
    {
        id: "usr_2",
        name: "Guy Hawkins",
        email: "guy.hawkins@expressdispatch.io",
        role: "AGENT",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: "Mar 20, 2023",
        shipmentsCount: 384,
    },
    {
        id: "usr_3",
        name: "Jerome Bell",
        email: "jbell@eastcoastfreight.com",
        role: "AGENT",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: "Apr 05, 2023",
        shipmentsCount: 512,
    },
    {
        id: "usr_4",
        name: "Alex Sterling",
        email: "alex.s@pacificcargo.net",
        role: "AGENT",
        status: "PENDING_KYC",
        emailVerified: true,
        createdAt: "Oct 02, 2023",
        shipmentsCount: 12,
    },
    {
        id: "usr_5",
        name: "Theresa Webb",
        email: "theresa.webb@acmesupply.org",
        role: "CUSTOMER",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: "May 18, 2023",
        shipmentsCount: 45,
    },
    {
        id: "usr_6",
        name: "Bessie Cooper",
        email: "bessie.c@retailhub.co",
        role: "CUSTOMER",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: "Jun 22, 2023",
        shipmentsCount: 19,
    },
    {
        id: "usr_7",
        name: "Floyd Miles",
        email: "floyd.m@fasthaulers.biz",
        role: "AGENT",
        status: "SUSPENDED",
        emailVerified: false,
        createdAt: "Aug 14, 2023",
        shipmentsCount: 88,
    },
];

export default function AdminUsersPage() {
    const [usersList, setUsersList] = useState<ManagedUser[]>(INITIAL_USERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "AGENT" | "CUSTOMER">("ALL");

    const filteredUsers = usersList.filter((u) => {
        const matchesQuery =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchesQuery && matchesRole;
    });

    const handleToggleStatus = (id: string) => {
        setUsersList((prev) =>
            prev.map((u) => {
                if (u.id === id) {
                    const nextStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                    toast.success(`${u.name} status updated to ${nextStatus}`);
                    return { ...u, status: nextStatus };
                }
                return u;
            })
        );
    };

    const handleApproveKYC = (id: string) => {
        setUsersList((prev) =>
            prev.map((u) => {
                if (u.id === id) {
                    toast.success(`Agent KYC approved for ${u.name}`);
                    return { ...u, status: "ACTIVE" };
                }
                return u;
            })
        );
    };

    const getRoleBadge = (role: ManagedUser["role"]) => {
        switch (role) {
            case "ADMIN":
                return "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30";
            case "AGENT":
                return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30";
            default:
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30";
        }
    };

    const getStatusBadge = (status: ManagedUser["status"]) => {
        switch (status) {
            case "ACTIVE":
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40";
            case "PENDING_KYC":
                return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40";
            case "SUSPENDED":
                return "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/40";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header + Add user */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                        User & Agent Directory
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Global oversight of platform administrators, certified fleet agents, and merchant customers.
                    </p>
                </div>

                <button
                    onClick={() => toast.info("New User registration wizard opened")}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                >
                    <UserPlus size={15} />
                    <span>Invite / Add User</span>
                </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Accounts</span>
                        <Users size={16} className="text-[#00c9a7]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{usersList.length}</p>
                    <span className="text-[10px] text-[#00e5c0] font-semibold mt-0.5 block">+4 this week</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Fleet Agents</span>
                        <Truck size={16} className="text-[#f59e0b]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">
                        {usersList.filter((u) => u.role === "AGENT").length}
                    </p>
                    <span className="text-[10px] text-[#f59e0b] font-semibold mt-0.5 block">1 pending approval</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Active Customers</span>
                        <CheckCircle2 size={16} className="text-[#00b4d8]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">
                        {usersList.filter((u) => u.role === "CUSTOMER").length}
                    </p>
                    <span className="text-[10px] text-[#7ecfc4] font-semibold mt-0.5 block">100% verified</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Platform Admins</span>
                        <Shield size={16} className="text-[#f43f5e]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">
                        {usersList.filter((u) => u.role === "ADMIN").length}
                    </p>
                    <span className="text-[10px] text-[#f43f5e] font-semibold mt-0.5 block">Full permissions</span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-black/20">
                {/* Role Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] w-full md:w-auto overflow-x-auto">
                    {(["ALL", "ADMIN", "AGENT", "CUSTOMER"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                                roleFilter === r
                                    ? "bg-[#00c9a7] text-[#0a0f0f] shadow-sm"
                                    : "text-[#7ecfc4] hover:text-[#e0faf5]"
                            }`}
                        >
                            {r === "ALL" ? "All Users" : r.charAt(0) + r.slice(1).toLowerCase() + "s"}
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
                        placeholder="Search name, email..."
                        className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                <th className="py-3.5 px-4">User</th>
                                <th className="py-3.5 px-4">Role</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Joined Date</th>
                                <th className="py-3.5 px-4">Shipments</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a4a4a]/40">
                            {filteredUsers.map((u) => {
                                const initials = u.name
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-[#112a2a]/40 transition-colors group"
                                    >
                                        {/* User Name & Email */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00c9a7]/20 to-[#00b4d8]/20 border border-[#00c9a7]/40 flex items-center justify-center font-bold text-[11px] text-[#00e5c0] flex-shrink-0">
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-bold text-[#e0faf5] block truncate">
                                                        {u.name}
                                                    </span>
                                                    <span className="text-[11px] text-[#7ecfc4]/70 truncate block">
                                                        {u.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                                                    u.role
                                                )}`}
                                            >
                                                {u.role}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                                                    u.status
                                                )}`}
                                            >
                                                {u.status.replace(/_/g, " ")}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="py-3 px-4 text-[#7ecfc4]">{u.createdAt}</td>

                                        {/* Shipments */}
                                        <td className="py-3 px-4 font-semibold text-[#e0faf5]">
                                            {u.shipmentsCount} orders
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {u.status === "PENDING_KYC" && (
                                                    <button
                                                        onClick={() => handleApproveKYC(u.id)}
                                                        className="px-2.5 py-1 rounded-lg bg-[#00c9a7]/15 hover:bg-[#00c9a7]/30 text-[#00e5c0] text-[10px] font-bold border border-[#00c9a7]/40 transition-colors flex items-center gap-1"
                                                    >
                                                        <UserCheck size={12} />
                                                        Approve
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleToggleStatus(u.id)}
                                                    className={`p-1.5 rounded-lg border transition-colors ${
                                                        u.status === "ACTIVE"
                                                            ? "text-[#ff6b6b] border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/10"
                                                            : "text-[#00e5c0] border-[#00c9a7]/30 hover:bg-[#00c9a7]/10"
                                                    }`}
                                                    title={u.status === "ACTIVE" ? "Suspend user" : "Reactivate user"}
                                                >
                                                    {u.status === "ACTIVE" ? <Ban size={13} /> : <UserCheck size={13} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <Users size={36} className="mx-auto text-[#3a6b66] mb-2" />
                        <p className="text-xs font-bold text-[#e0faf5]">No users found matching filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
