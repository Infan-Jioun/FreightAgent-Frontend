"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";
import api from "@/app/lib/api";

export default function GoogleSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuthStore();

    useEffect(() => {
        let cancelled = false;

        const setBrowserCookie = (name: string, value: string, days: number) => {
            if (typeof document === "undefined") return;
            const maxAge = days * 24 * 60 * 60;
            const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
            const secureFlag = isSecure ? "; Secure" : "";
            document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
        };

        const decodeBase64Url = (str: string) => {
            try {
                let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
                while (base64.length % 4) {
                    base64 += "=";
                }
                return JSON.parse(decodeURIComponent(escape(atob(base64))));
            } catch {
                try {
                    return JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/")));
                } catch {
                    return null;
                }
            }
        };

        const decodeJwtPayload = (token: string) => {
            try {
                const parts = token.split(".");
                if (parts.length < 2) return null;
                let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                while (base64.length % 4) {
                    base64 += "=";
                }
                return JSON.parse(decodeURIComponent(escape(atob(base64))));
            } catch {
                return null;
            }
        };

        const verify = async () => {
            try {
                const t = searchParams.get("t");

                if (!t) {
                    console.warn("[GoogleSuccess] Missing token parameter 't' in URL, checking if session exists via getMe()...");
                    try {
                        const meRes = await authService.getMe();
                        if (meRes?.data) {
                            const user = meRes.data;
                            setUser(user);
                            const isWelcome = searchParams.get("welcome") === "true";
                            if (isWelcome) {
                                toast.success(`Welcome to FreightAgent, ${user.name || "User"}! 🎉`, {
                                    description: "Your account has been created with Google.",
                                    duration: 5000,
                                });
                            } else {
                                toast.success(`Welcome back, ${user.name || "User"}! ✅`, {
                                    description: "Signed in with Google.",
                                    duration: 3000,
                                });
                            }
                            window.history.replaceState({}, "", "/google/success");
                            router.replace("/dashboard");
                            return;
                        }
                    } catch (meErr) {
                        console.error("[GoogleSuccess] getMe session check failed:", meErr);
                    }

                    console.warn("[GoogleSuccess] No token 't' and getMe() failed. Redirecting to login.");
                    router.replace("/login?error=session_failed");
                    return;
                }

                // 1. Decode token to immediately extract tokens & set browser cookies on frontend domain
                const decoded = decodeBase64Url(t);
                const accessToken = decoded?.accessToken;
                const refreshToken = decoded?.refreshToken;
                const isWelcome = decoded?.isNewUser ?? (searchParams.get("welcome") === "true");

                if (accessToken) {
                    setBrowserCookie("accessToken", accessToken, 1);
                }
                if (refreshToken) {
                    setBrowserCookie("refreshToken", refreshToken, 7);
                }

                // 2. Call backend to set cross-site cookies on backend domain as well
                let userData = null;
                try {
                    const res = await api.post("/auth/google/set-cookie", { token: t });
                    if (res.data?.data) {
                        userData = res.data.data;
                    }
                    if (res.data?.accessToken) {
                        setBrowserCookie("accessToken", res.data.accessToken, 1);
                    }
                    if (res.data?.refreshToken) {
                        setBrowserCookie("refreshToken", res.data.refreshToken, 7);
                    }
                } catch (apiErr) {
                    console.error("[GoogleSuccess] Error calling /auth/google/set-cookie:", apiErr);
                }

                if (cancelled) return;

                // 3. If backend didn't return user, fallback to decoding the JWT payload
                if (!userData && accessToken) {
                    const jwtPayload = decodeJwtPayload(accessToken);
                    userData = jwtPayload?.data || jwtPayload?.user || jwtPayload;
                }

                if (!userData) {
                    console.error("[GoogleSuccess] Unable to retrieve user data from token or backend");
                    router.replace("/login?error=session_failed");
                    return;
                }

                setUser(userData);

                if (isWelcome) {
                    toast.success(`Welcome to FreightAgent, ${userData.name || "User"}! 🎉`, {
                        description: "Your account has been created with Google.",
                        duration: 5000,
                    });
                } else {
                    toast.success(`Welcome back, ${userData.name || "User"}! ✅`, {
                        description: "Signed in with Google.",
                        duration: 3000,
                    });
                }

                // Clean up URL parameter and navigate to dashboard
                window.history.replaceState({}, "", "/google/success");
                router.replace("/dashboard");

            } catch (err) {
                console.error("[GoogleSuccess] Unexpected error during verification:", err);
                if (cancelled) return;
                router.replace("/login?error=session_failed");
            }
        };

        verify();

        return () => { cancelled = true; };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    Signing you in...
                </p>
            </div>
        </div>
    );
}