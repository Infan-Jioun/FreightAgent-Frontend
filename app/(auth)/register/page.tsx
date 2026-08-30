// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Mail, Lock, User, Anchor,
    Shield, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { registerSchema } from "@/app/validations/auth.validation";
import type { RegisterInput } from "@/app/validations/auth.validation";
import { authService } from "@/app/services/auth.service";
import { ROUTES } from "@/app/constants/routes";
import RegisterVisual, { MobileRegisterSummary } from "./RegisterVisual";

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);

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


    const passwordStrength = (pwd: string) => {
        if (!pwd) return { score: 0, label: "", color: "" };
        if (pwd.length < 6) return { score: 1, label: "Weak", color: "#ff6b6b" };
        if (pwd.length < 8) return { score: 2, label: "Fair", color: "#f59e0b" };
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd))
            return { score: 4, label: "Strong", color: "#00e5c0" };
        return { score: 3, label: "Good", color: "#00c9a7" };
    };

    const strength = passwordStrength(password);

    const onSubmit = async (data: RegisterInput) => {
        try {
            await authService.register(data);
            toast.success("Account created!", {
                description: "Check your email for the OTP verification code.",
            });
            // ✅ Email store করো — verify page এ দরকার হবে
            sessionStorage.setItem("verify_email", data.email);
            // Play the cinematic success sequence in the visual panel; the
            // actual navigation happens in handleSuccessComplete below once
            // that sequence finishes. Routing logic itself is unchanged.
            setRegisterSuccess(true);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Registration failed");
        }
    };

    const handleSuccessComplete = () => {
        router.push(ROUTES.VERIFY_EMAIL);
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
                className="w-full max-w-5xl rounded-[2rem] overflow-hidden flex shadow-2xl"
                style={{
                    border: "1px solid var(--border-primary)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                }}
            >
                {/* ── Left: 3D Logistics Visualization ── */}
                <div className="hidden lg:flex w-[45%] relative overflow-hidden">
                    <RegisterVisual
                        name={name}
                        email={email}
                        passwordStrength={strength}
                        success={registerSuccess}
                        onSuccessComplete={handleSuccessComplete}
                    />
                </div>

                {/* ── Right: Form ── */}
                <div
                    className="flex-1 p-8 md:p-12 flex flex-col justify-center"
                    style={{ background: "var(--bg-card)" }}
                >
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden">
                        <Anchor size={20} style={{ color: "var(--accent-primary)" }} />
                        <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                            Freight<span style={{ color: "var(--accent-primary)" }}>Agent</span>
                        </span>
                    </div>

                    {/* Mobile shipment summary — lightweight, no WebGL */}
                    <div className="mb-6 lg:hidden">
                        <MobileRegisterSummary />
                    </div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
                            Create Account
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Join FreightAgent — ship smarter across the Gulf.
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

                        {/* Name */}
                        <div>
                            <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                                Full Name
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
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
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs mt-1.5"
                                        style={{ color: "var(--danger)" }}
                                    >
                                        {errors.name.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                                Email Address
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
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

                        {/* Password */}
                        <div>
                            <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                                Password
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                                style={{
                                    background: "var(--bg-input)",
                                    border: `1px solid ${errors.password ? "var(--danger)" : password ? "var(--border-accent)" : "var(--border-primary)"}`,
                                }}
                            >
                                <Lock size={16} style={{ color: password ? "var(--accent-primary)" : "var(--text-muted)" }} />
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 chars, uppercase & number"
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: "var(--text-primary)" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ color: "var(--text-muted)" }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Strength */}
                            <AnimatePresence>
                                {password && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2"
                                    >
                                        <div className="flex gap-1.5 mb-1">
                                            {[1, 2, 3, 4].map((s) => (
                                                <div
                                                    key={s}
                                                    className="h-1 flex-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        background: strength.score >= s ? strength.color : "var(--border-primary)",
                                                        boxShadow: strength.score >= s ? `0 0 6px ${strength.color}60` : "none",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs font-medium" style={{ color: strength.color }}>
                                            {strength.label} Password
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs mt-1.5"
                                        style={{ color: "var(--danger)" }}
                                    >
                                        {errors.password.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || registerSuccess}
                            className="mt-2 flex justify-center items-center gap-2 py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{
                                background: "var(--gradient-brand)",
                                color: "#0a0f0f",
                                boxShadow: "0 4px 14px rgba(0,201,167,0.35)",
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating account...
                                </>
                            ) : registerSuccess ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Welcome aboard...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <motion.span
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        →
                                    </motion.span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700" />
                        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>or</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700" />
                    </div>

                    {/* Agent Register */}
                    <Link
                        href={ROUTES.REGISTER_AGENT}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                        style={{
                            border: "1px solid var(--border-primary)",
                            color: "var(--text-secondary)",
                        }}
                    >
                        <Shield size={15} style={{ color: "var(--accent-blue)" }} />
                        Register as Agent instead
                    </Link>

                    {/* Login */}
                    <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link
                            href={ROUTES.LOGIN}
                            className="font-bold hover:underline underline-offset-4"
                            style={{ color: "var(--accent-primary)" }}
                        >
                            Sign in
                        </Link>
                    </p>

                    <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
                        By registering, you agree to FreightAgent&apos;s Terms & Privacy Policy.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
