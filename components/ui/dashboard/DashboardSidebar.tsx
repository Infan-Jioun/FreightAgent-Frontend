"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Truck,
    MapPin,
    FileText,
    MessageSquare,
    User,
    Settings,
    LogOut,
    X,
    Anchor,
    Users,
    Package,
    PlusCircle,
    Shield,
    CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ROUTES } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";

interface SidebarProps {
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

export default function DashboardSidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { clearUser, user } = useAuthStore();
    const [loggingOut, setLoggingOut] = useState(false);

    const role = user?.role || "CUSTOMER";

    // Dynamic Navigation Items Based On Role
    const getNavItems = () => {
        switch (role) {
            case "ADMIN":
                return [
                    { label: "Overview", href: ROUTES.DASHBOARD, icon: Home },
                    { label: "User Management", href: ROUTES.ADMIN_USERS, icon: Users },
                    { label: "All Shipments", href: ROUTES.ADMIN_SHIPMENTS, icon: Package },
                    { label: "Fleet Tracking", href: "/tracking", icon: MapPin },
                    { label: "Profile", href: ROUTES.PROFILE, icon: User },
                ];
            case "AGENT":
                return [
                    { label: "Dispatch Hub", href: ROUTES.DASHBOARD, icon: Home },
                    { label: "Active Deliveries", href: ROUTES.SHIPMENTS, icon: Truck },
                    { label: "Route Map", href: "/tracking", icon: MapPin },
                    { label: "Profile", href: ROUTES.PROFILE, icon: User },
                ];
            case "CUSTOMER":
            default:
                return [
                    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: Home },
                    { label: "My Shipments", href: ROUTES.SHIPMENTS, icon: Package },
                    { label: "Create Shipment", href: ROUTES.SHIPMENT_CREATE, icon: PlusCircle },
                    { label: "Live Tracking", href: "/tracking", icon: MapPin },
                    { label: "Profile", href: ROUTES.PROFILE, icon: User },
                ];
        }
    };

    const navItems = getNavItems();

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await authService.logout();
        } catch {
            // Proceed with local logout
        } finally {
            clearUser();
            localStorage.removeItem("auth-storage");
            toast.success("Logged out successfully");
            router.push(ROUTES.LOGIN);
            setLoggingOut(false);
        }
    };

    const getRoleBadge = () => {
        switch (role) {
            case "ADMIN":
                return {
                    label: "Admin Portal",
                    style: "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30",
                    icon: Shield,
                };
            case "AGENT":
                return {
                    label: "Agent Portal",
                    style: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
                    icon: Truck,
                };
            default:
                return {
                    label: "Customer Portal",
                    style: "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30",
                    icon: CheckCircle2,
                };
        }
    };

    const roleBadge = getRoleBadge();
    const BadgeIcon = roleBadge.icon;

    const sidebarContent = (
        <aside className="flex flex-col justify-between h-full py-6 px-4">
            {/* Top: Brand Logo + Site Name (Visible on Large Devices) */}
            <div>
                <Link
                    href={ROUTES.DASHBOARD}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-2xl hover:opacity-90 transition-opacity"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/20 flex-shrink-0">
                        <Anchor size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-base font-bold text-[#e0faf5] tracking-tight leading-tight">
                            Freight<span className="text-[#00c9a7]">Agent</span>
                        </span>
                        <span className="text-[10px] font-medium text-[#7ecfc4]/70 uppercase tracking-wider">
                            Logistics Platform
                        </span>
                    </div>
                </Link>

                {/* Role Pill Indicator */}
                <div className="mt-3.5 px-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleBadge.style} shadow-xs`}>
                        <BadgeIcon size={12} strokeWidth={2.5} />
                        <span>{roleBadge.label}</span>
                    </div>
                </div>

                {/* Section Divider */}
                <div className="my-4 border-t border-[#1a4a4a]/60" />

                {/* Navigation Links (Both Icon + Route Name on Large Screen) */}
                <nav className="flex flex-col gap-1.5">
                    <p className="px-3 pb-1.5 text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider">
                        {role === "ADMIN" ? "Administration" : role === "AGENT" ? "Operations" : "Shipment Services"}
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            pathname === item.href ||
                            (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onCloseMobile}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? "bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/50 shadow-sm shadow-[#00c9a7]/10"
                                        : "text-[#7ecfc4]/80 hover:text-[#e0faf5] hover:bg-[#112a2a]"
                                }`}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={isActive ? 2.3 : 1.9}
                                    className={isActive ? "text-[#00c9a7]" : "text-[#7ecfc4]/70"}
                                />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions: Settings & Sign Out */}
            <div className="pt-4 border-t border-[#1a4a4a]/60 space-y-1.5">
                <Link
                    href={ROUTES.SETTINGS}
                    onClick={onCloseMobile}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#7ecfc4]/80 hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer"
                >
                    <Settings size={18} strokeWidth={1.9} className="text-[#7ecfc4]/70" />
                    <span>Settings</span>
                </Link>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#ff6b6b]/80 hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <LogOut size={18} strokeWidth={1.9} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop Sidebar (w-64 showing icon + route name on large screens) */}
            <div className="hidden lg:block w-64 flex-shrink-0 bg-[#0d1f1f] border-r border-[#1a4a4a] z-30 h-screen sticky top-0">
                {sidebarContent}
            </div>

            {/* Mobile / Tablet Drawer Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-[#0a0f0f]/80 backdrop-blur-sm transition-opacity"
                        onClick={onCloseMobile}
                    />
                    <div className="fixed top-0 bottom-0 left-0 w-64 bg-[#0d1f1f] border-r border-[#1a4a4a] shadow-2xl z-10 flex flex-col">
                        <div className="flex justify-end p-3">
                            <button
                                onClick={onCloseMobile}
                                className="p-1.5 rounded-lg text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {sidebarContent}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
