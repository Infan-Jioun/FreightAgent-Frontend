// app/(dashboard)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";
import Sidebar from "@/components/ui/common/Sidebar";
import DashboardNavbar from "@/components/ui/common/DashboardNavbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [checking, setChecking] = useState(true);
    const router = useRouter();
    const { user, setUser, clearUser } = useAuthStore();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
     
                const res = await authService.getMe();
                if (res.data) {
                    setUser(res.data); // ← fresh user data
                } else {
                    throw new Error("No user");
                }
            } catch {
                clearUser();
                localStorage.removeItem("auth-storage");
                router.replace("/login");
            } finally {
                setChecking(false);
            }
        };

        verifyAuth();
    }, []);

    // ✅ Check হওয়ার আগে কিছু দেখাবে না
    if (checking) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--bg-primary)" }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                        style={{
                            borderColor: "var(--accent-primary)",
                            borderTopColor: "transparent",
                        }}
                    />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Verifying session...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-screen"
            style={{ background: "var(--bg-primary)" }}
        >
            <Sidebar
                open={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div
                className="flex-1 flex flex-col transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? "260px" : "72px" }}
            >
                <DashboardNavbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />
                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}