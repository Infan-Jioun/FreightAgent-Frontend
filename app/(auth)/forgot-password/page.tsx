/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/app/constants/routes";
import { authService } from "@/app/services/auth.service";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/app/validations/auth.validation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const email = watch("email", "");

    const onSubmit = async (data: ForgotPasswordInput) => {
        try {
            await authService.forgotPassword(data);
            setSentEmail(data.email);
            sessionStorage.setItem("reset_email", data.email);
            setSent(true);
            toast.success("OTP sent to your email!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send OTP");
        }
    };

    // ── Success State ──
    if (sent) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{ background: "var(--bg-primary)" }}
            >
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.06] blur-[120px]"
                        style={{ background: "var(--accent-primary)" }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md p-10 rounded-3xl text-center relative z-10"
                    style={{
                        background: "var(--gradient-card)",
                        border: "1px solid var(--border-accent)",
                        boxShadow: "var(--shadow-card)",
                    }}
                >
                    {/* Top accent */}
                    <div
                        className="h-1 w-full rounded-full mb-8"
                        style={{ background: "var(--gradient-accent)" }}
                    />

                    {/* Icon */}
                    <div className="relative flex items-center justify-center mb-6">
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "rgba(0,201,167,0.1)",
                                border: "1px solid var(--border-accent)",
                            }}
                        >
                            <CheckCircle2 size={40} style={{ color: "var(--accent-secondary)" }} />
                        </motion.div>
                        <div
                            className="absolute w-20 h-20 rounded-2xl animate-ping opacity-10"
                            style={{ border: "2px solid var(--accent-primary)" }}
                        />
                    </div>

                    <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                        Check your inbox
                    </h2>
                    <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                        We sent a 6-digit OTP to
                    </p>
                    <p
                        className="text-sm font-semibold mb-8 break-all"
                        style={{ color: "var(--accent-secondary)" }}
                    >
                        {sentEmail}
                    </p>

                    <button
                        onClick={() => router.push(ROUTES.RESET_PASSWORD)}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] mb-4"
                        style={{
                            background: "var(--gradient-brand)",
                            color: "#0a0f0f",
                        }}
                    >
                        Enter OTP & Reset Password →
                    </button>

                    <button
                        onClick={() => setSent(false)}
                        className="w-full py-3 rounded-xl text-sm transition-all hover:opacity-70"
                        style={{
                            border: "1px solid var(--border-primary)",
                            color: "var(--text-muted)",
                        }}
                    >
                        Use a different email
                    </button>

                    <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
                        Check spam folder if you don't see the email.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "var(--bg-primary)" }}
        >
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
                <div
                    className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-[0.05] blur-[130px]"
                    style={{ background: "var(--accent-primary)" }}
                />
                <div
                    className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full opacity-[0.05] blur-[130px]"
                    style={{ background: "var(--accent-blue)" }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Back */}
                <Link
                    href={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 text-xs mb-6 transition-opacity hover:opacity-80"
                    style={{ color: "var(--text-muted)" }}
                >
                    <ArrowLeft size={14} />
                    Back to login
                </Link>

                <div
                    className="p-8 rounded-3xl"
                    style={{
                        background: "var(--gradient-card)",
                        border: "1px solid var(--border-primary)",
                        boxShadow: "var(--shadow-card)",
                    }}
                >
                    {/* Top accent */}
                    <div
                        className="h-1 w-full rounded-full mb-8"
                        style={{ background: "var(--gradient-accent)" }}
                    />

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <Anchor size={18} style={{ color: "var(--accent-primary)" }} />
                        <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                            Freight<span style={{ color: "var(--accent-primary)" }}>Agent</span>
                        </span>
                    </div>

                    {/* Icon */}
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
                                <div
                                    className="absolute inset-0 rounded-full animate-ping opacity-60"
                                    style={{ background: "var(--accent-secondary)" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                            Forgot Password?
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Enter your email and we'll send you a reset OTP.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div>
                            <label
                                className="text-xs font-semibold mb-2 block uppercase tracking-wider"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Email Address
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                                style={{
                                    background: "var(--bg-input)",
                                    border: `1px solid ${errors.email
                                            ? "var(--danger)"
                                            : email
                                                ? "var(--border-accent)"
                                                : "var(--border-primary)"
                                        }`,
                                }}
                            >
                                <Mail
                                    size={16}
                                    style={{ color: email ? "var(--accent-primary)" : "var(--text-muted)" }}
                                />
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="you@example.com"
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-600"
                                    style={{ color: "var(--text-primary)" }}
                                />
                            </div>
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs mt-1.5"
                                        style={{ color: "var(--danger)" }}
                                    >
                                        {errors.email.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex justify-center items-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            style={{
                                background: "var(--gradient-brand)",
                                color: "#0a0f0f",
                                boxShadow: "0 4px 14px rgba(0,201,167,0.35)",
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Sending OTP...
                                </>
                            ) : (
                                "Send Reset OTP →"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
                        Remember your password?{" "}
                        <Link
                            href={ROUTES.LOGIN}
                            className="font-semibold hover:opacity-80"
                            style={{ color: "var(--accent-primary)" }}
                        >
                            Sign in
                        </Link>
                    </p>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-1.5 mt-8">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="rounded-full transition-all"
                                style={{
                                    width: i === 0 ? "24px" : "6px",
                                    height: "6px",
                                    background: i === 0 ? "var(--accent-primary)" : "var(--border-primary)",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}