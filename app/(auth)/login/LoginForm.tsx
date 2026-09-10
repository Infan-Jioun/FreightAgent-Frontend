/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(auth)/login/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, Anchor, Loader2, Clock, Smartphone, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "../../constants/routes";
import LoginVisual, { MobileShipmentSummary } from "./LoginVisual";
import { authService } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/authStore";
import { Button } from "@/components/ui/button";

import { LoginInput, loginSchema } from "@/app/validations/auth.validation";
import { useCountdown } from "@/app/hooks/useCountdown";
import { envConfig } from "@/app/config/env";

export default function LoginForm() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();

    // Check for error parameters in URL (e.g. from Google OAuth)
    const [isGoogleLimit, setIsGoogleLimit] = useState(false);
    const [googleEmail, setGoogleEmail] = useState<string | null>(null);

    useEffect(() => {
        const error = searchParams.get("error");
        const message = searchParams.get("message");
        const emailParam = searchParams.get("email");

        if (error) {
            // Check for Google OAuth session limit / device limit
            const isSessionLimitError =
                error === "session_limit" ||
                error === "device_limit" ||
                error === "maximum_devices" ||
                error === "max_devices" ||
                (typeof message === "string" && /device|session|simultaneous|limit/i.test(message));

            if (isSessionLimitError) {
                setIsGoogleLimit(true);
                if (emailParam) setGoogleEmail(emailParam);
                setShowDeviceLimitModal(true);
                toast.error("Device Limit Exceeded", {
                    description: "Your account is active on 3 devices. Terminate other sessions to log in with Google.",
                });
                window.history.replaceState({}, "", "/login");
                return;
            }

            if (error === "session_failed") {
                toast.error("Google sign-in session failed. Please try again.");
            } else if (error === "token_failed") {
                toast.error("Failed to authenticate Google token.");
            } else if (error === "no_email") {
                toast.error("No email associated with this Google account.");
            } else if (error === "server_error") {
                toast.error("Server error during Google sign-in. Please try again.");
            }
            window.history.replaceState({}, "", "/login");
        }
    }, [searchParams]);

    // ── success-beat state ──
    const [showSuccess, setShowSuccess] = useState(false);
    const [userName, setUserName] = useState<string | undefined>(undefined);

    // ── 3-device limit modal state ──
    const [showDeviceLimitModal, setShowDeviceLimitModal] = useState(false);
    const [isRevokingAndLoggingIn, setIsRevokingAndLoggingIn] = useState(false);
    const [pendingCredentials, setPendingCredentials] = useState<LoginInput | null>(null);

    // Rate-limit countdown — its own storage key, separate from register.
    const {
        isActive: loginLimited,
        formatted: retryFormatted,
        start: startCountdown,
    } = useCountdown("login");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const email = watch("email", "");
    const password = watch("password", "");

    // Normalizes any thrown value into a readable message + status,
    // so a non-axios error (network failure, thrown string, etc.) can
    // never escape this function unhandled.
    const parseLoginError = (err: unknown) => {
        const anyErr = err as any;
        const status: number | undefined =
            anyErr?.response?.status ??
            anyErr?.response?.data?.statusCode ??
            anyErr?.status;
        const message: string | undefined =
            anyErr?.response?.data?.message ??
            anyErr?.response?.data?.error ??
            anyErr?.message ??
            (typeof err === "string" ? err : undefined);
        const retryAfter = anyErr?.response?.data?.data?.retryAfter;
        const limit = anyErr?.response?.data?.data?.limit;
        return { status, message, retryAfter, limit };
    };

    const handleRevokeOthersAndLogin = async () => {
        // If the session limit was triggered via Google OAuth
        if (isGoogleLimit) {
            setShowDeviceLimitModal(false);
            setIsGoogleLimit(false);
            const queryParams = new URLSearchParams();
            queryParams.set("revokeOthers", "true");
            if (googleEmail) {
                queryParams.set("login_hint", googleEmail);
            }
            window.location.href = `${envConfig.NEXT_PUBLIC_API_URL}/auth/google?${queryParams.toString()}`;
            return;
        }

        if (!pendingCredentials) return;
        try {
            setIsRevokingAndLoggingIn(true);
            const res = await authService.login({
                ...pendingCredentials,
                revokeOthers: true,
            });

            if (res.data?.user) {
                setUser(res.data.user);
                setUserName(res.data.user?.name);
            }

            setShowDeviceLimitModal(false);
            setPendingCredentials(null);
            toast.success("Other sessions terminated. Welcome back!");
            setShowSuccess(true);
        } catch (err: unknown) {
            const { message } = parseLoginError(err);
            toast.error(message || "Failed to terminate other sessions");
        } finally {
            setIsRevokingAndLoggingIn(false);
        }
    };

    const handleDismissDeviceLimitModal = () => {
        setShowDeviceLimitModal(false);
        setPendingCredentials(null);
        setIsGoogleLimit(false);
        setGoogleEmail(null);
    };

    const onSubmit = async (data: LoginInput) => {
        try {
            const res = await authService.login(data);

            if (res.data?.user) {
                setUser(res.data.user);
                setUserName(res.data.user?.name);
            }

            toast.success("Welcome back!");
            setShowSuccess(true);
        } catch (err: unknown) {
            // Guaranteed not to throw — every branch below is defensive,
            // so this catch block can never itself become an unhandled
            // rejection that bubbles up and forces a hard navigation.
            try {
                const { status, message, retryAfter, limit } = parseLoginError(err);

                // 1. Check if this is the 3-device simultaneous sign-in limit FIRST
                const isSessionLimit = Boolean(
                    message &&
                    /device|simultaneous|session limit|maximum.*3|log out from another/i.test(message)
                );

                if (isSessionLimit) {
                    setPendingCredentials(data);
                    setShowDeviceLimitModal(true);
                    toast.error("Device Limit Exceeded", {
                        description: "3 devices are currently active. You can terminate other sessions to log in here.",
                    });
                    return;
                }

                if (status === 429) {
                    if (retryAfter) startCountdown(retryAfter);
                    toast.error("Too many attempts", {
                        description: limit
                            ? `You've used all ${limit} login attempts. Please wait before trying again.`
                            : message || "Please wait before trying again.",
                    });
                    return;
                }

                if (status === 403) {
                    // Unverified email flow
                    sessionStorage.setItem("verify_email", data.email);
                    toast.error("Email not verified", {
                        description: "OTP sent to your email.",
                    });
                    router.push(ROUTES.VERIFY_EMAIL);
                    return;
                }

                toast.error(message || "Invalid email or password");
            } catch {
                // Absolute last resort — even the error handler itself failed.
                toast.error("Something went wrong. Please try again.");
            }
        }
    };

    // react-hook-form's handleSubmit already calls preventDefault, but we
    // wrap it once more so ANY exception thrown synchronously (e.g. a bad
    // resolver, a render-time error inside onSubmit before the first
    // await) is swallowed here instead of propagating up to the browser,
    // which is what causes an apparent full-page reload.
    const safeSubmit = handleSubmit(async (data) => {
        try {
            await onSubmit(data);
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    });

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // Belt-and-suspenders: guarantee the native form submission
        // (which reloads the page) never fires, regardless of what
        // happens inside react-hook-form's handler.
        e.preventDefault();
        e.stopPropagation();
        void safeSubmit(e);
    };

    const handleGoogleLogin = () => {
        window.location.href = `${envConfig.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    // Safely pull the URL right when the animation ends — no stale state bugs!
    const handleSuccessAnimationComplete = () => {
        const callbackUrl = searchParams.get("callbackUrl") || ROUTES.DASHBOARD;
        router.push(callbackUrl);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-8"
            style={{ background: "var(--bg-primary, #050a0a)" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative z-10"
                style={{
                    border: "1px solid var(--border-primary, rgba(255,255,255,0.1))",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
            >
                {/* ── Left: Form ── */}
                <div
                    className="w-full lg:w-[45%] p-8 md:p-12 flex flex-col justify-between relative z-10"
                    style={{ background: "var(--bg-card, #0a0f0f)" }}
                >
                    {/* Logo */}
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <Anchor size={18} style={{ color: "#00C9A7" }} />
                        <span className="text-sm font-extrabold tracking-wide text-white">
                            Freight<span style={{ color: "#00C9A7" }}>Agent</span>
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <p className="text-xl md:text-3xl font-bold text-center mb-3 tracking-tight" style={{ color: "var(--text-primary, #ffffff)" }}>
                                Welcome Back
                            </p>
                            <p className="text-sm md:text-base mb-8 text-center" style={{ color: "var(--text-muted, #8b949e)" }}>
                                Enter your credentials to access your freight dashboard and track shipments.
                            </p>
                        </motion.div>

                        <div className="mb-6 lg:hidden">
                            <MobileShipmentSummary />
                        </div>

                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            onSubmit={handleFormSubmit}
                            noValidate
                            className="flex flex-col gap-5"
                        >
                            {/* Email */}
                            <div>
                                <div
                                    className="group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300"
                                    style={{
                                        background: "var(--bg-input, rgba(255,255,255,0.03))",
                                        border: `1px solid ${errors.email ? "var(--danger)" : email ? "var(--border-accent)" : "var(--border-primary, rgba(255,255,255,0.1))"}`,
                                    }}
                                >
                                    <Mail
                                        size={18}
                                        className="transition-colors group-focus-within:text-[#00C9A7]"
                                        style={{ color: email ? "var(--accent-primary)" : "var(--text-muted, #8b949e)" }}
                                    />
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="Email address"
                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                                        style={{ color: "var(--text-primary, #ffffff)" }}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div
                                    className="group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300"
                                    style={{
                                        background: "var(--bg-input, rgba(255,255,255,0.03))",
                                        border: `1px solid ${errors.password ? "var(--danger)" : password ? "var(--border-accent)" : "var(--border-primary, rgba(255,255,255,0.1))"}`,
                                    }}
                                >
                                    <Lock
                                        size={18}
                                        className="transition-colors group-focus-within:text-[#00C9A7]"
                                        style={{ color: password ? "var(--accent-primary)" : "var(--text-muted, #8b949e)" }}
                                    />
                                    <input
                                        {...register("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                                        style={{ color: "var(--text-primary, #ffffff)" }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        shape="square"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[#8b949e] hover:text-[#00c9a7] hover:bg-transparent"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end -mt-2">
                                <Link
                                    href={ROUTES?.FORGOT_PASSWORD || "/forgot-password"}
                                    className="text-sm hover:underline underline-offset-4 transition-all"
                                    style={{ color: "var(--accent-primary, #00C9A7)" }}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                variant="gradient"
                                size="lg"
                                shape="default"
                                disabled={isSubmitting || showSuccess || loginLimited}
                                isLoading={isSubmitting || showSuccess}
                                loadingText={showSuccess ? "Signing you in..." : "Authenticating..."}
                                className="w-full mt-2 py-3.5 h-auto text-sm"
                                rightIcon={
                                    !isSubmitting && !showSuccess && !loginLimited ? (
                                        <motion.span
                                            className="inline-block"
                                            initial={{ x: 0 }}
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            →
                                        </motion.span>
                                    ) : loginLimited ? (
                                        <Clock size={16} />
                                    ) : undefined
                                }
                            >
                                {loginLimited ? `Try again in ${retryFormatted}` : "Sign In"}
                            </Button>

                            {/* Rate-limit notice */}
                            {loginLimited && (
                                <p
                                    className="text-xs text-center -mt-2"
                                    style={{ color: "var(--text-muted, #8b949e)" }}
                                >
                                    Too many attempts — you can try again in {retryFormatted}.
                                </p>
                            )}
                        </motion.form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-linear-to-r from-transparent to-gray-700" />
                            <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #8b949e)" }}>or</span>
                            <div className="flex-1 h-px bg-linear-to-l from-transparent to-gray-700" />
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            shape="default"
                            onClick={handleGoogleLogin}
                            className="w-full py-3.5 h-auto text-sm font-semibold flex items-center justify-center gap-3 bg-[var(--bg-input)] border-[var(--border-primary)] text-[var(--text-primary)] hover:opacity-90"
                            leftIcon={
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            }
                        >
                            Continue with Google
                        </Button>


                        {/* Register Links */}
                        <div className="flex flex-col gap-3 mt-3">
                            <p className="text-sm text-center" style={{ color: "var(--text-muted, #8b949e)" }}>
                                Don&#39;t have an account?{" "}
                                <Link href={ROUTES?.REGISTER || "/register"} className="font-semibold hover:underline" style={{ color: "var(--accent-primary, #00C9A7)" }}>
                                    Sign up as Customer
                                </Link>
                            </p>
                            <p className="text-sm text-center" style={{ color: "var(--text-muted, #8b949e)" }}>
                                Are you a logistics agent?{" "}
                                <Link href={ROUTES?.REGISTER_AGENT || "/register-agent"} className="font-semibold hover:underline" style={{ color: "#3B82F6" }}>
                                    Register Here
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-xs mt-10 text-center" style={{ color: "var(--text-muted, #8b949e)" }}>
                        © {new Date().getFullYear()} FreightAgent · Logistics Platform
                    </p>
                </div>

                {/* ── Right: Visual ── */}
                <div className="relative hidden lg:flex flex-1 overflow-hidden">
                    <LoginVisual
                        showSuccess={showSuccess}
                        userName={userName}
                        onSuccessComplete={handleSuccessAnimationComplete}
                    />
                </div>
            </motion.div>

            {/* ── 3-Device Simultaneous Limit Modal ── */}
            <AnimatePresence>
                {showDeviceLimitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-md p-6 rounded-3xl bg-[#0d1f1f] border border-[#ff6b6b]/40 shadow-2xl shadow-black/80 flex flex-col gap-5 relative overflow-hidden"
                        >
                            {/* Glowing top line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[#ff6b6b] to-transparent" />

                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#ff6b6b]/15 border border-[#ff6b6b]/30 flex items-center justify-center text-[#ff6b6b] shrink-0">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#e0faf5]">
                                            Session Limit Reached
                                        </h3>
                                        <span className="text-[11px] font-semibold text-[#ff6b6b]">
                                            Maximum 3 Devices Active
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    shape="square"
                                    onClick={handleDismissDeviceLimitModal}
                                    disabled={isRevokingAndLoggingIn}
                                    className="text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                                    aria-label="Close modal"
                                >
                                    <X size={16} />
                                </Button>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#7ecfc4] flex flex-col gap-2 leading-relaxed">
                                <p>
                                    Your account is already signed in on <strong>3 active devices or browsers</strong>.
                                </p>
                                <p className="text-[11px] text-[#3a6b66]">
                                    To log in here, you can log out manually from one of your other devices, or force-logout all other sessions now to gain instant access.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    shape="default"
                                    onClick={handleDismissDeviceLimitModal}
                                    disabled={isRevokingAndLoggingIn}
                                    className="w-full sm:w-auto text-xs font-semibold"
                                >
                                    Cancel (Log out manually)
                                </Button>

                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    shape="default"
                                    onClick={handleRevokeOthersAndLogin}
                                    disabled={isRevokingAndLoggingIn}
                                    isLoading={isRevokingAndLoggingIn}
                                    loadingText="Logging out others..."
                                    leftIcon={<LogOut size={13} />}
                                    className="w-full sm:w-auto bg-linear-to-r from-[#ff6b6b] to-[#f59e0b] text-[#0a0f0f] font-bold text-xs border-none shadow-md shadow-[#ff6b6b]/20 hover:opacity-95"
                                >
                                    {isGoogleLimit
                                        ? "Log Out All Other Sessions & Sign in with Google"
                                        : "Log Out All Other Sessions & Login"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}