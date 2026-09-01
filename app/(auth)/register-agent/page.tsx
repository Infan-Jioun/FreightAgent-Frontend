// app/(auth)/register-agent/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Anchor, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { registerSchema } from "@/app/validations/auth.validation";
import type { RegisterInput } from "@/app/validations/auth.validation";
import { authService } from "@/app/services/auth.service";
import { ROUTES } from "@/app/constants/routes";
import { envConfig } from "@/app/config/env";
import RegisterVisual, { MobileRegisterSummary } from "./RegisterVisual";

export default function RegisterAgentPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [registered, setRegistered] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch("password", "");
    const name = watch("name", "");
    const email = watch("email", "");

    const passwordStrength = (() => {
        if (!password) return undefined;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const levels = [
            { label: "Weak", color: "#EF4444" },
            { label: "Fair", color: "#F59E0B" },
            { label: "Good", color: "#3B82F6" },
            { label: "Strong", color: "#00C9A7" },
        ];
        const lvl = levels[Math.max(0, score - 1)] ?? levels[0];
        return { score, label: lvl.label, color: lvl.color };
    })();

    const onSubmit = async (data: RegisterInput) => {
        try {
            await authService.createAgent(data);
            toast.success("Agent account created!", {
                description: "Check your email for the OTP verification code.",
            });
            sessionStorage.setItem("verify_email", data.email);
            // Play the success animation first; RegisterVisual calls
            // onSuccessComplete() when the sequence finishes, and only
            // then do we navigate away.
            setRegistered(true);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Agent registration failed");
        }
    };

    const handleGoogleAgentLogin = () => {
        // Distinct endpoint so the backend can tag this signup as an agent
        // signup before/while the OAuth flow runs.
        window.location.href = `${envConfig.NEXT_PUBLIC_API_URL}/auth/google/agent`;
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-8"
            style={{ background: "var(--bg-primary)" }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-5xl rounded-[2rem] overflow-hidden shadow-2xl grid lg:grid-cols-2"
                style={{
                    border: "1px solid var(--border-primary)",
                    background: "var(--bg-card)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                }}
            >
                {/* Left: cinematic 3D animation panel (desktop only) */}
                <div className="relative hidden lg:block h-full min-h-[640px]">
                    <RegisterVisual
                        name={name}
                        email={email}
                        passwordStrength={passwordStrength}
                        success={registered}
                        onSuccessComplete={() => router.push(ROUTES.VERIFY_EMAIL)}
                    />
                </div>

                {/* Right: form */}
                <div className="p-8 md:p-10">
                    <Link
                        href={ROUTES.REGISTER}
                        className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <ArrowLeft size={14} />
                        Back to standard registration
                    </Link>

                

                    <p className="text-xl md:text-2xl font-bold mb-2 text-center tracking-tight" style={{ color: "var(--text-primary)" }}>
                        Register as Agent
                    </p>
                    <p className="text-sm mb-6 text-center" style={{ color: "var(--text-muted)" }}>
                        Create an agent account to manage shipments on behalf of clients.
                    </p>

                    {/* Mobile fallback summary (no WebGL) */}
                    <div className="mb-6 lg:hidden">
                        <MobileRegisterSummary />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <div>
                            <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                                Full Name
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                                style={{
                                    background: "var(--bg-input)",
                                    border: `1px solid ${errors.name ? "var(--danger)" : name ? "var(--border-accent)" : "var(--border-primary)"}`,
                                }}
                            >
                                <User size={16} style={{ color: name ? "var(--accent-primary)" : "var(--text-muted)" }} />
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="John Doe"
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: "var(--text-primary)" }}
                                />
                            </div>
                            <AnimatePresence>
                                {errors.name && (
                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
                                        {errors.name.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                                Email Address
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                                style={{
                                    background: "var(--bg-input)",
                                    border: `1px solid ${errors.email ? "var(--danger)" : email ? "var(--border-accent)" : "var(--border-primary)"}`,
                                }}
                            >
                                <Mail size={16} style={{ color: email ? "var(--accent-primary)" : "var(--text-muted)" }} />
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="you@example.com"
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: "var(--text-primary)" }}
                                />
                            </div>
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
                                        {errors.email.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                                Password
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                                style={{
                                    background: "var(--bg-input)",
                                    border: `1px solid ${errors.password ? "var(--danger)" : password ? "var(--border-accent)" : "var(--border-primary)"}`,
                                }}
                            >
                                <Lock size={16} style={{ color: password ? "var(--accent-primary)" : "var(--text-muted)" }} />
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 characters"
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: "var(--text-primary)" }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: "var(--text-muted)" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
                                        {errors.password.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || registered}
                            className="mt-2 flex justify-center items-center gap-2 py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                            style={{
                                background: "var(--gradient-brand)",
                                color: "#0a0f0f",
                                boxShadow: "0 4px 14px rgba(0,201,167,0.35)",
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating agent account...
                                </>
                            ) : (
                                "Register as Agent"
                            )}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700" />
                        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>or</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleAgentLogin}
                        className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                        style={{
                            border: "1px solid var(--border-primary)",
                            color: "var(--text-primary)",
                            background: "var(--bg-input)",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google as Agent
                    </button>

                    <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link href={ROUTES.LOGIN} className="font-bold hover:underline underline-offset-4" style={{ color: "var(--accent-primary)" }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
