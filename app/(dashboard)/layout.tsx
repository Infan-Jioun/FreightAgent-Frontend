"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";
import DashboardSidebar from "@/components/ui/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/ui/dashboard/DashboardHeader";
import { AppError } from "../errorHelper/appError";
import { toast } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();
    const { setUser, clearUser } = useAuthStore();

    useEffect(() => {
        let cancelled = false;

        const verifyAuth = async () => {
            try {
                const res = await authService.getMe();

                if (cancelled) return;

                if (!res.data) {
                    throw new AppError(401, "No user data");
                }

                const user = res.data;

                if (!user.emailVerified) {
                    router.replace(
                        `/verify-email?email=${encodeURIComponent(user.email)}`
                    );
                    return;
                }

                setUser(user);

            } catch (err: any) {
                if (cancelled) return;

                const appError = AppError.fromAxios(err);

                if (appError.isUnauthorized) {
                    clearUser();
                    router.replace("/login");
                    return;
                }

                if (appError.isForbidden) {
                    router.replace("/verify-email");
                    return;
                }

                clearUser();
                router.replace("/login");

            } finally {
                if (!cancelled) {
                    setChecking(false);
                }
            }
        };

        verifyAuth();

        return () => {
            cancelled = true;
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (checking) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-[#0a0f0f]"
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-3 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
                    <p className="text-xs font-semibold text-[#7ecfc4]">
                        Loading FreightAgent...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0a0f0f] font-sans antialiased text-[#e0faf5] selection:bg-[#00c9a7]/20 selection:text-[#00e5c0]">
            {/* Left Sidebar (Desktop w-64 showing icon + route name, mobile drawer) */}
            <DashboardSidebar
                mobileOpen={mobileMenuOpen}
                onCloseMobile={() => setMobileMenuOpen(false)}
            />

            {/* Right Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader
                    onOpenMobileMenu={() => setMobileMenuOpen(true)}
                />
                <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}