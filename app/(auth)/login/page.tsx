// app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Anchor, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "../../constants/routes";
import LoginVisual, { MobileShipmentSummary } from "./LoginVisual";
import { authService } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/authStore";
import { LoginInput, loginSchema } from "@/app/validations/auth.validation";


export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

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

    const onSubmit = async (data: LoginInput) => {
        try {
            const res = await authService.login(data);

            if (res.data?.user) {
                setUser(res.data.user);
            }

            toast.success("Welcome back!", {
                description: "Redirecting to your dashboard...",
            });

            router.push("/");
        } catch (err: any) {
            const message = err?.response?.data?.message;

            // ✅ Email not verified হলে verify page এ পাঠাও
            if (err?.response?.status === 403) {
                sessionStorage.setItem("verify_email", data.email);
                toast.error("Email not verified", {
                    description: "Redirecting to verification page...",
                });
                router.push(ROUTES.VERIFY_EMAIL);
                return;
            }

            toast.error(message || "Invalid email or password");
        }
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
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-8"
                    >
                        <div className="p-2 rounded-lg" style={{ background: "rgba(0,201,167,0.1)" }}>
                            <Anchor size={24} style={{ color: "var(--accent-primary, #00C9A7)" }} />
                        </div>
                        <span className="font-extrabold text-xl tracking-wide" style={{ color: "var(--text-primary, #ffffff)" }}>
                            Freight<span style={{ color: "var(--accent-primary, #00C9A7)" }}>Agent</span>
                        </span>
                    </motion.div>

                    <div className="flex-1 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight" style={{ color: "var(--text-primary, #ffffff)" }}>
                                Welcome Back
                            </h1>
                            <p className="text-sm md:text-base mb-8" style={{ color: "var(--text-muted, #8b949e)" }}>
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
                            onSubmit={handleSubmit(onSubmit)}
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
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="hover:scale-110 transition-transform"
                                        style={{ color: "var(--text-muted, #8b949e)" }}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end mt-[-8px]">
                                <Link
                                    href={ROUTES?.FORGOT_PASSWORD || "/forgot-password"}
                                    className="text-sm hover:underline underline-offset-4 transition-all"
                                    style={{ color: "var(--accent-primary, #00C9A7)" }}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2"
                                style={{
                                    background: "var(--gradient-brand, linear-gradient(135deg, #00C9A7 0%, #009B82 100%))",
                                    color: "#0a0f0f",
                                    boxShadow: "0 4px 14px 0 rgba(0, 201, 167, 0.39)",
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <motion.span
                                            className="inline-block"
                                            initial={{ x: 0 }}
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            →
                                        </motion.span>
                                    </>
                                )}
                            </button>
                        </motion.form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-8">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700" />
                            <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #8b949e)" }}>or</span>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700" />
                        </div>

                        {/* Register Links */}
                        <div className="flex flex-col gap-3">
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
                    <LoginVisual />
                </div>
            </motion.div>
        </div>
    );
}