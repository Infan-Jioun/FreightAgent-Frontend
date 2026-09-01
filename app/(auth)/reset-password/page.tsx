/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    Anchor, ArrowLeft, Lock, Eye, EyeOff,
    Loader2, CheckCircle2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/app/constants/routes";
import { authService } from "@/app/services/auth.service";
import { resetPasswordSchema, type ResetPasswordInput } from "@/app/validations/auth.validation";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const storedEmail = typeof window !== "undefined" ? sessionStorage.getItem("reset_email") || "" : "";
        if (!storedEmail) {
            router.replace(ROUTES.FORGOT_PASSWORD);
        } else {
            setEmail(storedEmail);
        }
        inputRefs.current[0]?.focus();
    }, [router]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: "", newPassword: "", otp: "" },
    });

    useEffect(() => {
        if (email) {
            setValue("email", email);
        }
    }, [email, setValue]);

    const newPassword = watch("newPassword", "");

    const passwordStrength = (pwd: string) => {
        if (!pwd) return { score: 0, label: "", color: "" };
        if (pwd.length < 6) return { score: 1, label: "Weak", color: "#ff6b6b" };
        if (pwd.length < 8) return { score: 2, label: "Fair", color: "#f59e0b" };
        // if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd))
        //     return { score: 4, label: "Strong", color: "#00e5c0" };
        return { score: 3, label: "Good", color: "#00c9a7" };
    };

    const strength = passwordStrength(newPassword);

    // OTP handlers
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Sync OTP state with React Hook Form so Zod validation passes
        const otpString = newOtp.join("");
        setValue("otp", otpString, { shouldValidate: true });

        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
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
            setValue("otp", paste, { shouldValidate: true });
            inputRefs.current[5]?.focus();
        }
    };

    const onSubmit = async (data: ResetPasswordInput) => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }

        try {
            await authService.resetPassword({
                email,
                otp: otpCode,
                newPassword: data.newPassword,
            });

            sessionStorage.removeItem("reset_email");
            setSuccess(true);
            toast.success("Password reset successfully!");

        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reset password");
        }
    };

    // ── Success State ──
    if (success) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{ background: "var(--bg-primary)" }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-10 rounded-3xl text-center"
                    style={{
                        background: "var(--gradient-card)",
                        border: "1px solid var(--border-accent)",
                        boxShadow: "var(--shadow-card)",
                    }}
                >
                    <div className="h-1 w-full rounded-full mb-8" style={{ background: "var(--gradient-accent)" }} />

                    <div className="relative flex items-center justify-center mb-6">
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 220, damping: 16 }}
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "rgba(0,229,192,0.1)",
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
                        Password Reset!
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                        Your password has been reset successfully. You can now sign in with your new password.
                    </p>

                    <button
                        onClick={() => router.push(ROUTES.LOGIN)}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 hover:scale-[1.02] transition-all"
                        style={{ background: "var(--gradient-brand)", color: "#0a0f0f" }}
                    >
                        Sign In →
                    </button>
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
                    className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-[0.05] blur-[130px]"
                    style={{ background: "var(--accent-primary)" }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Link
                    href={ROUTES.FORGOT_PASSWORD}
                    className="inline-flex items-center gap-2 text-xs mb-6 transition-opacity hover:opacity-80"
                    style={{ color: "var(--text-muted)" }}
                >
                    <ArrowLeft size={14} />
                    Back
                </Link>

                <div
                    className="p-8 rounded-3xl"
                    style={{
                        background: "var(--gradient-card)",
                        border: "1px solid var(--border-primary)",
                        boxShadow: "var(--shadow-card)",
                    }}
                >
                    <div className="h-1 w-full rounded-full mb-8" style={{ background: "var(--gradient-accent)" }} />

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-6">
                        <Anchor size={18} style={{ color: "var(--accent-primary)" }} />
                        <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                            Freight<span style={{ color: "var(--accent-primary)" }}>Agent</span>
                        </span>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "rgba(0,201,167,0.08)",
                                border: "1px solid var(--border-accent)",
                            }}
                        >
                            <ShieldCheck size={28} style={{ color: "var(--accent-primary)" }} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                            Reset Password
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Enter the OTP sent to{" "}
                            <span className="font-semibold" style={{ color: "var(--accent-secondary)" }}>
                                {email}
                            </span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        {/* OTP */}
                        <div>
                            <label
                                className="text-xs font-semibold mb-3 block uppercase tracking-wider"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                6-Digit OTP
                            </label>
                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        onPaste={i === 0 ? handlePaste : undefined}
                                        className="w-10 h-12 text-center text-lg font-bold rounded-xl outline-none transition-all"
                                        style={{
                                            background: "var(--bg-input)",
                                            border: `2px solid ${digit ? "var(--accent-primary)" : "var(--border-primary)"}`,
                                            color: digit ? "var(--accent-secondary)" : "var(--text-primary)",
                                            boxShadow: digit ? "var(--shadow-glow)" : "none",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label
                                className="text-xs font-semibold mb-2 block uppercase tracking-wider"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                New Password
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                                style={{
                                    background: "var(--bg-input)",
                                    border: `1px solid ${errors.newPassword ? "var(--danger)" : newPassword ? "var(--border-accent)" : "var(--border-primary)"}`,
                                }}
                            >
                                <Lock
                                    size={16}
                                    style={{ color: newPassword ? "var(--accent-primary)" : "var(--text-muted)" }}
                                />
                                <input
                                    {...register("newPassword")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 chars, uppercase & number"
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-600"
                                    style={{ color: "var(--text-primary)" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Strength */}
                            <AnimatePresence>
                                {newPassword && (
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
                                {errors.newPassword && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs mt-1.5"
                                        style={{ color: "var(--danger)" }}
                                    >
                                        {errors.newPassword.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || otp.some((d) => !d)}
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
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password →"
                            )}
                        </button>
                    </form>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-1.5 mt-8">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="rounded-full transition-all"
                                style={{
                                    width: i === 2 ? "24px" : "6px",
                                    height: "6px",
                                    background: i === 2 ? "var(--accent-primary)" : "var(--border-primary)",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}