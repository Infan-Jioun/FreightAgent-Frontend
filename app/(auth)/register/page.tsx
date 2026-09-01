/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-location-assign-relative-destination */
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
import { envConfig } from "@/app/config/env";

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
            })
            sessionStorage.setItem("verify_email", data.email);
            // Play the cinematic success sequence in the visual panel; the
            // actual navigation happens in handleSuccessComplete below once
            // that sequence finishes. Routing logic itself is unchanged.
            setRegisterSuccess(true);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Registration failed");
        }
    };
    const handleGoogleLogin = () => {
        window.location.href = `${envConfig.NEXT_PUBLIC_API_URL}/auth/google`;
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
                        <p className="text-xl md:text-2xl text-center font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
                            Create Account
                        </p>
                        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
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
                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700" />
                        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>or</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700" />
                    </div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
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
                        Continue with Google
                    </button>

                    {/* Agent Register */}
                    <Link
                        href={ROUTES.REGISTER_AGENT}
                        className="flex items-center justify-center gap-2 mt-3 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
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