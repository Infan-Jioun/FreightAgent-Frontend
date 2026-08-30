"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Anchor, LayoutDashboard, Package, PackagePlus,
    Search, User, Settings, Users, ChevronLeft, LogOut,
    Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ROUTES } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";

interface SidebarProps {
    open: boolean;
    onToggle: () => void;
}

const CUSTOMER_LINKS = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "My Shipments", href: ROUTES.SHIPMENTS, icon: Package },
    { label: "New Shipment", href: ROUTES.SHIPMENT_CREATE, icon: PackagePlus },
    { label: "Track", href: "/tracking", icon: Search },
    { label: "Profile", href: ROUTES.PROFILE, icon: User },
    { label: "Settings", href: ROUTES.SETTINGS, icon: Settings },
];

const AGENT_LINKS = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "All Shipments", href: ROUTES.SHIPMENTS, icon: Package },
    { label: "Track", href: "/tracking", icon: Search },
    { label: "Profile", href: ROUTES.PROFILE, icon: User },
];

const ADMIN_LINKS = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "All Shipments", href: ROUTES.SHIPMENTS, icon: Package },
    { label: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
    { label: "Profile", href: ROUTES.PROFILE, icon: User },
    { label: "Settings", href: ROUTES.SETTINGS, icon: Settings },
];

export default function Sidebar({ open, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearUser } = useAuthStore();
    const [loggingOut, setLoggingOut] = useState(false);

    const links =
        user?.role === "ADMIN"
            ? ADMIN_LINKS
            : user?.role === "AGENT"
                ? AGENT_LINKS
                : CUSTOMER_LINKS;

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            // ✅ Backend API call — token blacklist + session revoke + cookie clear
            await authService.logout();

        } catch {
            // API fail হলেও logout করো
        } finally {
            // ✅ Zustand store clear করো
            clearUser();

            // ✅ LocalStorage clear করো
            localStorage.removeItem("auth-storage");

            toast.success("Logged out successfully");

            // ✅ Login page এ redirect করো
            router.push(ROUTES.LOGIN);

            setLoggingOut(false);
        }
    };

    return (
        <aside
            className="fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300"
            style={{
                width: open ? "260px" : "72px",
                background: "var(--bg-card)",
                borderRight: "1px solid var(--border-primary)",
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-4 py-5"
                style={{ borderBottom: "1px solid var(--border-primary)" }}
            >
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "var(--gradient-brand)" }}
                >
                    <Anchor size={18} style={{ color: "#0a0f0f" }} />
                </div>
                {open && (
                    <span
                        className="font-bold text-base tracking-wide whitespace-nowrap"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Freight<span style={{ color: "var(--accent-primary)" }}>Agent</span>
                    </span>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                            style={{
                                background: active ? "rgba(0,201,167,0.1)" : "transparent",
                                border: active
                                    ? "1px solid var(--border-accent)"
                                    : "1px solid transparent",
                                color: active ? "var(--accent-primary)" : "var(--text-muted)",
                            }}
                        >
                            <Icon size={18} className="shrink-0" />
                            {open && (
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {link.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div
                className="px-3 py-4 flex flex-col gap-2"
                style={{ borderTop: "1px solid var(--border-primary)" }}
            >
                {/* User info */}
                {open && user && (
                    <div
                        className="flex items-center gap-3 px-3 py-2 rounded-xl"
                        style={{ background: "var(--bg-input)" }}
                    >
                        <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                                background: "var(--gradient-brand)",
                                color: "#0a0f0f",
                            }}
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p
                                className="text-xs font-semibold truncate"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {user.name}
                            </p>
                            <p
                                className="text-[10px] truncate"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {user.role}
                            </p>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full hover:opacity-80 disabled:opacity-50"
                    style={{ color: "var(--danger)" }}
                >
                    {loggingOut ? (
                        <Loader2 size={18} className="shrink-0 animate-spin" />
                    ) : (
                        <LogOut size={18} className="shrink-0" />
                    )}
                    {open && (
                        <span className="text-sm font-medium">
                            {loggingOut ? "Logging out..." : "Logout"}
                        </span>
                    )}
                </button>
            </div>

            {/* Toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full transition-all hover:opacity-80"
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-muted)",
                }}
            >
                <ChevronLeft
                    size={14}
                    style={{
                        transform: open ? "rotate(0deg)" : "rotate(180deg)",
                        transition: "transform 0.3s",
                    }}
                />
            </button>
        </aside>
    );
}