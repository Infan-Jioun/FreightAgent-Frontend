"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    Bell,
    ChevronDown,
    Menu,
    User as UserIcon,
    Settings,
    LogOut,
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";

interface HeaderProps {
    onOpenMobileMenu: () => void;
}

export default function DashboardHeader({ onOpenMobileMenu }: HeaderProps) {
    const router = useRouter();
    const { user, clearUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/tracking?id=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch {
            // continue logout
        } finally {
            clearUser();
            localStorage.removeItem("auth-storage");
            toast.success("Logged out successfully");
            router.push(ROUTES.LOGIN);
        }
    };

    const displayName = user?.name || "Wade Warren";

    return (
        <header className="flex items-center justify-between gap-4 py-3.5 px-4 sm:px-6 sticky top-0 z-20 bg-[#0a0f0f]/90 backdrop-blur-md border-b border-[#1a4a4a]">
            {/* Mobile Hamburger Button */}
            <button
                onClick={onOpenMobileMenu}
                className="lg:hidden p-2 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Left: Pill Search Bar */}
            <form
                onSubmit={handleSearchSubmit}
                className="flex-1 max-w-md relative"
            >
                <div className="flex items-center gap-3 bg-[#0a1a1a] rounded-full px-4 py-2.5 border border-[#1a4a4a] shadow-inner focus-within:ring-2 focus-within:ring-[#00c9a7]/30 focus-within:border-[#00c9a7] transition-all">
                    <Search size={16} className="text-[#3a6b66] flex-shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Tracking Number"
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#e0faf5] placeholder:text-[#3a6b66]"
                    />
                </div>
            </form>

            {/* Right: Notifications & User Chip */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7]/50 transition-all shadow-sm"
                        aria-label="Notifications"
                    >
                        <Bell size={17} />
                        {/* Cyan/Teal dot badge */}
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#00c9a7] ring-2 ring-[#0d1f1f] animate-pulse" />
                    </button>

                    {/* Notification Dropdown */}
                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-[#0d1f1f] rounded-2xl shadow-2xl border border-[#1a4a4a] p-3 z-30 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1a4a4a]">
                                <span className="text-xs font-semibold text-[#e0faf5]">Notifications</span>
                                <span className="text-[10px] font-medium text-[#00e5c0] bg-[#00c9a7]/15 px-2 py-0.5 rounded-full border border-[#00c9a7]/30">3 New</span>
                            </div>
                            <div className="py-2 space-y-2 text-xs">
                                <div className="p-2 rounded-xl bg-[#0a1a1a] hover:bg-[#112a2a] transition-colors border border-[#1a4a4a]/40">
                                    <p className="font-medium text-[#e0faf5]">Shipment #26277887-ID-YK</p>
                                    <p className="text-[#7ecfc4] text-[11px]">Courier Guy Hawkins is on the way.</p>
                                </div>
                                <div className="p-2 rounded-xl bg-[#0a1a1a] hover:bg-[#112a2a] transition-colors border border-[#1a4a4a]/40">
                                    <p className="font-medium text-[#e0faf5]">Shipment #26277886-ID-KL</p>
                                    <p className="text-[#7ecfc4] text-[11px]">Package successfully delivered.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile Pill */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/50 shadow-sm transition-all cursor-pointer"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#00c9a7]/20 border border-[#00c9a7]/30 flex items-center justify-center flex-shrink-0">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-bold text-[#00e5c0]">
                                    {displayName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <span className="hidden sm:inline-block text-xs font-semibold text-[#e0faf5]">
                            {displayName}
                        </span>

                        <ChevronDown size={14} className="text-[#3a6b66]" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#0d1f1f] rounded-2xl shadow-2xl border border-[#1a4a4a] py-1.5 z-30 animate-in fade-in slide-in-from-top-2">
                            <div className="px-3.5 py-2 border-b border-[#1a4a4a]">
                                <p className="text-xs font-semibold text-[#e0faf5] truncate">{displayName}</p>
                                <p className="text-[11px] text-[#3a6b66] truncate">{user?.email || "user@example.com"}</p>
                            </div>
                            <Link
                                href={ROUTES.PROFILE}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer"
                            >
                                <UserIcon size={14} className="text-[#3a6b66]" />
                                Profile
                            </Link>
                            <Link
                                href={ROUTES.SETTINGS}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer"
                            >
                                <Settings size={14} className="text-[#3a6b66]" />
                                Settings
                            </Link>
                            <button
                                onClick={() => {
                                    setUserMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#ff6b6b] hover:bg-[#ff6b6b]/10 transition-colors cursor-pointer"
                            >
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
