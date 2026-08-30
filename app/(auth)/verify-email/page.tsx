/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import {
    Anchor,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Mail,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AnimatePresence,
    motion,
    useAnimation,
    useReducedMotion,
} from "framer-motion";
import { ROUTES } from "@/app/constants/routes";
import { authService } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/authStore";

/* ------------------------------------------------------------------ */
/*  Right-side cinematic freight network visualization                */
/* ------------------------------------------------------------------ */

function FreightNetwork({
    verified,
    reducedMotion,
}: {
    verified: boolean;
    reducedMotion: boolean;
}) {
    const containerAnimate = verified
        ? { left: "84%" }
        : reducedMotion
            ? { left: "14%" }
            : { left: ["10%", "78%", "10%"] };

    const containerTransition = verified
        ? { duration: 1.4, ease: "easeInOut" as const }
        : { duration: 9, repeat: Infinity, ease: "easeInOut" as const };

    const particleAnimate = verified
        ? { left: "100%", opacity: 1 }
        : reducedMotion
            ? { left: "50%", opacity: 0.7 }
            : { left: ["0%", "100%"], opacity: [0.3, 1, 0.3] };

    const particleTransition = verified
        ? { duration: 1, ease: "easeInOut" as const }
        : { duration: 2.6, repeat: Infinity, ease: "linear" as const };

    return (
        <div
            className="relative w-full h-full min-h-[260px] rounded-3xl overflow-hidden"
            style={{
                background: "var(--gradient-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            {/* faint schematic grid */}
            <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                }}
            />
            {/* ambient glows */}
            <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[90px] opacity-20 pointer-events-none"
                style={{ background: "var(--accent-blue)" }}
            />
            <div
                className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full blur-[90px] opacity-20 pointer-events-none"
                style={{ background: "var(--accent-primary)" }}
            />

            <div className="relative z-10 flex flex-col h-full p-6">
                {/* header */}
                <div className="flex items-center justify-between mb-10">
                    <span
                        className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Global Freight Network
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                                background: verified
                                    ? "var(--success)"
                                    : "var(--accent-secondary)",
                                boxShadow: `0 0 8px ${verified ? "var(--success)" : "var(--accent-secondary)"
                                    }`,
                            }}
                        />
                        <span
                            className="text-[10px] font-semibold tracking-wide"
                            style={{
                                color: verified ? "var(--success)" : "var(--text-secondary)",
                            }}
                        >
                            {verified ? "VERIFIED" : "SECURE CHANNEL"}
                        </span>
                    </div>
                </div>

                {/* route */}
                <div className="relative flex-1 flex flex-col justify-center">
                    <div
                        className="relative h-px w-full mb-3"
                        style={{ background: "var(--border-primary)" }}
                    >
                        <div
                            className="absolute inset-y-0 left-0 h-px transition-all duration-700"
                            style={{
                                width: verified ? "100%" : "60%",
                                background: "var(--gradient-accent)",
                            }}
                        />
                        {/* origin node */}
                        <span
                            className="absolute -top-1.5 left-0 w-3 h-3 rounded-full -translate-x-1/2"
                            style={{
                                background: "var(--accent-primary)",
                                boxShadow: "var(--shadow-glow)",
                            }}
                        />
                        {/* destination node */}
                        <span
                            className="absolute -top-1.5 w-3 h-3 rounded-full -translate-x-1/2"
                            style={{
                                left: "100%",
                                background: verified ? "var(--success)" : "var(--border-accent)",
                                boxShadow: verified ? "0 0 12px var(--success)" : "none",
                            }}
                        />
                        {/* traveling signal particle */}
                        <motion.span
                            className="absolute -top-[3px] w-2 h-2 rounded-full -translate-x-1/2"
                            style={{
                                background: "var(--accent-secondary)",
                                boxShadow: "0 0 10px var(--accent-secondary)",
                            }}
                            animate={particleAnimate}
                            transition={particleTransition}
                        />
                        {/* floating freight container */}
                        <motion.div
                            className="absolute -top-11 -translate-x-1/2"
                            animate={containerAnimate}
                            transition={containerTransition}
                        >
                            <motion.div
                                animate={reducedMotion ? {} : { y: [0, -5, 0] }}
                                transition={
                                    reducedMotion
                                        ? {}
                                        : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                }
                                className="flex flex-col items-center"
                            >
                                <div
                                    className="relative w-9 h-6 rounded-[4px]"
                                    style={{
                                        background: "linear-gradient(155deg, #123332, #0a1f1e)",
                                        border: "1px solid var(--border-accent)",
                                        boxShadow:
                                            "0 6px 16px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,201,167,0.15)",
                                    }}
                                >
                                    <div
                                        className="absolute inset-y-0 left-1 right-1 opacity-40"
                                        style={{
                                            backgroundImage:
                                                "repeating-linear-gradient(90deg, var(--accent-primary) 0px, var(--accent-primary) 1px, transparent 1px, transparent 4px)",
                                        }}
                                    />
                                    <div
                                        className="absolute right-0 top-0 bottom-0 w-[3px] rounded-r-[4px]"
                                        style={{
                                            background: "var(--accent-primary)",
                                            boxShadow: "0 0 6px var(--accent-primary)",
                                        }}
                                    />
                                </div>
                                <span
                                    className="mt-1 text-[8px] font-mono tracking-wide whitespace-nowrap"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    FA-20491
                                </span>
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium">
                        <span style={{ color: "var(--text-secondary)" }}>Shanghai</span>
                        <span
                            style={{
                                color: verified ? "var(--success)" : "var(--text-secondary)",
                            }}
                        >
                            Rotterdam
                        </span>
                    </div>
                </div>

                {/* status labels */}
                <div className="mt-10 flex flex-wrap gap-2">
                    <span
                        className="text-[9px] font-semibold tracking-wide px-2 py-1 rounded-full"
                        style={{
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-primary)",
                            background: "rgba(0,201,167,0.05)",
                        }}
                    >
                        EMAIL CHANNEL
                    </span>
                    <span
                        className="text-[9px] font-semibold tracking-wide px-2 py-1 rounded-full"
                        style={{
                            color: verified ? "var(--success)" : "var(--accent-secondary)",
                            border: `1px solid ${verified ? "var(--success)" : "var(--border-accent)"
                                }`,
                            background: "rgba(0,229,192,0.05)",
                        }}
                    >
                        {verified ? "EMAIL VERIFIED" : "ENCRYPTED"}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Verify email page                                                 */
/* ------------------------------------------------------------------ */

export default function VerifyEmailPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();

    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [verified, setVerified] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // ── purely visual state (does not affect auth/OTP behavior) ──
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const prefersReducedMotion = useReducedMotion();
    const shakeControls = useAnimation();
    const c0 = useAnimation();
    const c1 = useAnimation();
    const c2 = useAnimation();
    const c3 = useAnimation();
    const c4 = useAnimation();
    const c5 = useAnimation();
    const otpControls = [c0, c1, c2, c3, c4, c5];

    // ✅ Register থেকে email নাও
    const email =
        typeof window !== "undefined"
            ? sessionStorage.getItem("verify_email") || ""
            : "";

    // ✅ Email না থাকলে login এ পাঠাও
    useEffect(() => {
        if (!email) {
            router.replace(ROUTES.LOGIN);
        }
        inputRefs.current[0]?.focus();
    }, []);

    // Countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // shake animation whenever a new error appears
    useEffect(() => {
        if (error) {
            shakeControls.start({
                x: [0, -8, 8, -6, 6, -3, 3, 0],
                transition: { duration: 0.45 },
            });
        }
    }, [error, shakeControls]);

    const pulseDigit = (index: number, delay = 0) => {
        otpControls[index].start({
            scale: [0.85, 1.08, 1],
            opacity: [0, 1],
            transition: { duration: 0.25, delay, ease: "easeOut" },
        });
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        setError("");
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        if (value) {
            pulseDigit(index);
        }
        if (newOtp.every((d) => d !== "") && value) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (paste.length === 6) {
            const newOtp = paste.split("");
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
            newOtp.forEach((_, i) => pulseDigit(i, i * 0.03));
            handleVerify(paste);
        }
    };

    const handleVerify = async (code: string) => {
        if (!email) return;
        setLoading(true);
        setError("");

        try {
            // ✅ API call
            const res = await authService.verifyOtp({ email, otp: code });

            if (res.data?.user) {
                setUser(res.data.user);
            }

            // ✅ sessionStorage clear করো
            sessionStorage.removeItem("verify_email");

            setVerified(true);
            toast.success("Email verified successfully!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.response?.data?.message || "Invalid or expired OTP";
            setError(message);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || !email) return;
        setResending(true);
        try {
            await authService.sendOtp(email);
            setCountdown(60);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            setError("");
            inputRefs.current[0]?.focus();
            toast.success("OTP resent to your email!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResending(false);
        }
    };

    /* ---------------------------- Success state ---------------------------- */
    if (verified) {
        return (
            <div
                className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 lg:p-8"
                style={{ background: "var(--bg-primary)" }}
            >
                <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full opacity-[0.07] blur-[140px]"
                        style={{ background: "var(--success)" }}
                    />
                </div>

                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-4xl relative z-10 grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10 items-stretch"
                >
                    <div
                        className="p-10 rounded-3xl text-center flex flex-col items-center justify-center"
                        style={{
                            background: "var(--gradient-card)",
                            border: "1px solid var(--border-accent)",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        <div className="relative flex items-center justify-center mb-6">
                            <motion.div
                                initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
                                className="w-24 h-24 rounded-full flex items-center justify-center"
                                style={{
                                    background: "rgba(0,229,192,0.1)",
                                    border: "2px solid var(--accent-secondary)",
                                }}
                            >
                                <CheckCircle2 size={48} style={{ color: "var(--accent-secondary)" }} />
                            </motion.div>
                            {!prefersReducedMotion && (
                                <div
                                    className="absolute w-24 h-24 rounded-full animate-ping opacity-20"
                                    style={{ border: "2px solid var(--accent-primary)" }}
                                />
                            )}
                        </div>

                        <span
                            className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3"
                            style={{ color: "var(--success)" }}
                        >
                            ✓ Email Verified
                        </span>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                            You&apos;re all set
                        </h2>
                        <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                            Your FreightAgent account is ready.
                        </p>
                        <p className="text-xs mb-8 break-all" style={{ color: "var(--text-muted)" }}>
                            {email}
                        </p>

                        <motion.button
                            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                            onClick={() => router.push(ROUTES.DASHBOARD)}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                            style={{ background: "var(--gradient-brand)", color: "#0a0f0f" }}
                        >
                            Go to Dashboard →
                        </motion.button>
                    </div>

                    <div className="hidden lg:block">
                        <FreightNetwork verified reducedMotion={!!prefersReducedMotion} />
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ----------------------------- Default state ---------------------------- */
    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 lg:p-8"
            style={{ background: "var(--bg-primary)" }}
        >
            {/* ambient background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
                <div
                    className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-[0.05] blur-[130px]"
                    style={{ background: "var(--accent-primary)" }}
                />
                <div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-[0.05] blur-[130px]"
                    style={{ background: "var(--accent-blue)" }}
                />
            </div>

            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-5xl relative z-10"
            >
                {/* top bar */}
                <div className="flex items-center justify-between mb-8 lg:mb-10">
                    <div className="flex items-center gap-2">
                        <Anchor size={20} style={{ color: "var(--accent-primary)" }} />
                        <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                            Freight<span style={{ color: "var(--accent-primary)" }}>Agent</span>
                        </span>
                    </div>
                    <Link
                        href={ROUTES.LOGIN}
                        className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <ArrowLeft size={13} />
                        Back to login
                    </Link>
                </div>

                <div className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10 items-stretch">
                    {/* left: verification form */}
                    <div
                        className="p-8 rounded-3xl flex flex-col justify-center"
                        style={{
                            background: "var(--gradient-card)",
                            border: "1px solid var(--border-primary)",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        {/* top accent line */}
                        <motion.div
                            className="h-1 w-full rounded-full mb-7"
                            style={{ background: "var(--gradient-accent)" }}
                            initial={prefersReducedMotion ? false : { scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />

                        {/* secure authentication badge */}
                        <div className="flex items-center gap-1.5 mb-6">
                            <ShieldCheck size={11} style={{ color: "var(--text-muted)" }} />
                            <span
                                className="text-[10px] font-semibold tracking-wide"
                                style={{ color: "var(--text-muted)" }}
                            >
                                SECURE AUTHENTICATION
                            </span>
                            <span
                                className="relative w-1.5 h-1.5 rounded-full ml-0.5"
                                style={{ background: "var(--accent-secondary)" }}
                            >
                                {!prefersReducedMotion && (
                                    <span
                                        className="absolute inset-0 rounded-full animate-ping opacity-60"
                                        style={{ background: "var(--accent-secondary)" }}
                                    />
                                )}
                            </span>
                        </div>

                        {/* email icon */}
                        <div className="flex justify-center mb-6">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                                style={{
                                    background: "rgba(0,201,167,0.08)",
                                    border: "1px solid var(--border-accent)",
                                }}
                            >
                                <Mail size={28} style={{ color: "var(--accent-primary)" }} />
                                <div
                                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                                    style={{ background: "var(--accent-secondary)" }}
                                >
                                    {!prefersReducedMotion && (
                                        <div
                                            className="absolute inset-0 rounded-full animate-ping opacity-60"
                                            style={{ background: "var(--accent-secondary)" }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* title */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                                Verify your email
                            </h1>
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                We sent a 6-digit verification code to{" "}
                                <br />
                                <span
                                    className="font-semibold break-all"
                                    style={{ color: "var(--accent-secondary)" }}
                                >
                                    {email || "your email"}
                                </span>
                            </p>
                        </div>

                        {/* otp inputs */}
                        <motion.div
                            animate={shakeControls}
                            className="flex gap-2 sm:gap-3 justify-center mb-5"
                        >
                            {otp.map((digit, i) => (
                                <motion.div key={i} animate={otpControls[i]} initial={{ scale: 1, opacity: 1 }}>
                                    <input
                                        id={`otp-${i}`}
                                        ref={(el) => {
                                            inputRefs.current[i] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={1}
                                        aria-label={`Digit ${i + 1} of 6`}
                                        value={digit}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        onPaste={i === 0 ? handlePaste : undefined}
                                        onFocus={() => setFocusedIndex(i)}
                                        onBlur={() => setFocusedIndex((f) => (f === i ? null : f))}
                                        className="text-center text-xl font-bold rounded-xl outline-none transition-all duration-150 w-11 sm:w-12"
                                        style={{
                                            height: "56px",
                                            background: "var(--bg-input)",
                                            border: `2px solid ${error
                                                ? "var(--danger)"
                                                : digit
                                                    ? "var(--accent-primary)"
                                                    : focusedIndex === i
                                                        ? "var(--border-accent)"
                                                        : "var(--border-primary)"
                                                }`,
                                            color: digit ? "var(--accent-secondary)" : "var(--text-primary)",
                                            boxShadow: error
                                                ? "0 0 0 3px rgba(255,107,107,0.15)"
                                                : digit
                                                    ? "var(--shadow-glow)"
                                                    : focusedIndex === i
                                                        ? "0 0 0 3px rgba(0,201,167,0.15)"
                                                        : "none",
                                        }}
                                        disabled={loading}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-center mb-3 overflow-hidden"
                                    style={{ color: "var(--danger)" }}
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* verify button */}
                        <motion.button
                            whileHover={
                                prefersReducedMotion || otp.some((d) => !d) || loading
                                    ? {}
                                    : { scale: 1.02 }
                            }
                            whileTap={
                                prefersReducedMotion || otp.some((d) => !d) || loading
                                    ? {}
                                    : { scale: 0.98 }
                            }
                            onClick={() => handleVerify(otp.join(""))}
                            disabled={otp.some((d) => !d) || loading}
                            className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
                            style={{
                                background: "var(--gradient-brand)",
                                color: "#0a0f0f",
                                boxShadow: otp.every((d) => d) && !loading ? "var(--shadow-glow)" : "none",
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Email →"
                            )}
                        </motion.button>

                        {/* resend */}
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Didn&apos;t receive the code?
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={!canResend || resending}
                                className="inline-flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ color: "var(--accent-primary)" }}
                            >
                                {canResend ? (
                                    <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 14 14" className="-rotate-90">
                                        <circle
                                            cx="7"
                                            cy="7"
                                            r="5.5"
                                            fill="none"
                                            stroke="var(--border-primary)"
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx="7"
                                            cy="7"
                                            r="5.5"
                                            fill="none"
                                            stroke="var(--accent-primary)"
                                            strokeWidth="2"
                                            strokeDasharray={2 * Math.PI * 5.5}
                                            strokeDashoffset={2 * Math.PI * 5.5 * (countdown / 60)}
                                            strokeLinecap="round"
                                            style={{ transition: "stroke-dashoffset 1s linear" }}
                                        />
                                    </svg>
                                )}
                                {resending
                                    ? "Sending..."
                                    : canResend
                                        ? "Resend code"
                                        : `Resend in ${countdown}s`}
                            </button>
                        </div>

                        {/* progress dots */}
                        <div className="flex justify-center gap-1.5 mt-8">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-full transition-all"
                                    style={{
                                        width: i === 1 ? "24px" : "6px",
                                        height: "6px",
                                        background: i === 1 ? "var(--accent-primary)" : "var(--border-primary)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* right: freight network visualization */}
                    <div className="h-64 lg:h-auto">
                        <FreightNetwork verified={false} reducedMotion={!!prefersReducedMotion} />
                    </div>
                </div>

                <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
                    Check spam folder if you don&apos;t see the email.
                </p>
            </motion.div>
        </div>
    );
}