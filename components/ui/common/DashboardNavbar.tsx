"use client";

import { useAuthStore } from "@/app/store/authStore";
import { Menu, Bell, Search } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavbarProps {
    onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/shipments": "Shipments",
    "/shipments/create": "New Shipment",
    "/profile": "Profile",
    "/settings": "Settings",
    "/admin/users": "Users",
    "/admin/shipments": "All Shipments",
};

export default function DashboardNavbar({ onToggleSidebar }: NavbarProps) {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const title = PAGE_TITLES[pathname] || "FreightAgent";

    return (
        <header
            className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
            style={{
                background: "rgba(10,15,15,0.85)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--border-primary)",
            }}
        >
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-muted)" }}
                >
                    <Menu size={20} />
                </button>
                <h1
                    className="text-base font-semibold"
                    style={{ color: "var(--text-primary)" }}
                >
                    {title}
                </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <button
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
                    style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-muted)",
                    }}
                >
                    <Search size={14} />
                    <span className="hidden sm:block">Search...</span>
                </button>

                {/* Notification */}
                <button
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:opacity-80"
                    style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-muted)",
                    }}
                >
                    <Bell size={16} />
                    <span
                        className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                        style={{ background: "var(--accent-primary)" }}
                    />
                </button>

                {/* Avatar */}
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold cursor-pointer"
                    style={{
                        background: "var(--gradient-brand)",
                        color: "#0a0f0f",
                    }}
                >
                    <Image
                        src={user?.image ?? ""}
                        alt={user?.name?.charAt(0).toUpperCase() || "U"}
                        priority
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}