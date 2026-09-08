"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";
import Sidebar from "@/components/ui/common/Sidebar";
import DashboardNavbar from "@/components/ui/common/DashboardNavbar";
import { AppError } from "../errorHelper/appError";
import { toast } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
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

                // const params = new URLSearchParams(window.location.search);
                // const isGoogle = params.get("google");
                // const isWelcome = params.get("welcome");

                // if (isGoogle) {
                //     if (isWelcome) {
                //         toast.success(`Welcome to FreightAgent, ${user.name}! 🎉`, {
                //             description: "Your account has been created with Google.",
                //             duration: 5000,
                //         });
                //     } else {
                //         toast.success(`Welcome back, ${user.name}! ✅`, {
                //             description: "Signed in with Google.",
                //             duration: 3000,
                //         });
                //     }

                //     window.history.replaceState({}, "", "/dashboard");
                // }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--bg-primary)" }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full border-2 animate-spin"
                        style={{
                            borderColor: "var(--border-primary)",
                            borderTopColor: "var(--accent-primary)",
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