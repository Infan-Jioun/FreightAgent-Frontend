"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Key,
    Globe,
    Lock,
    Smartphone,
    Save,
    Eye,
    EyeOff,
    KeyRound,
    Mail,
    X,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { user: authUser, setUser } = useAuthStore();

    // Preferences state
    const [currency, setCurrency] = useState("USD ($)");
    const [timezone, setTimezone] = useState("America/Chicago (UTC-5)");
    const [distanceUnit, setDistanceUnit] = useState("Miles (mi)");

    // Notification toggles
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsUpdates, setSmsUpdates] = useState(true);
    const [dispatchReports, setDispatchReports] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP Modal state
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // 2FA state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

    // Ensure user data is loaded if refreshed directly on /settings
    useEffect(() => {
        if (!authUser) {
            authService
                .getMe()
                .then((res) => {
                    if (res?.data) {
                        setUser(res.data);
                    }
                })
                .catch(() => {
                    // silently catch
                });
        }
    }, [authUser, setUser]);

    // Resend countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSavePreferences = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Preferences saved successfully");
    };

    // Step 1: Validate inputs and request email OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error("Please enter your current password");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }
        if (newPassword === currentPassword) {
            toast.error("New password cannot be the same as current password");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        try {
            setIsSendingOtp(true);
            const res = await authService.sendChangePasswordOtp({ currentPassword });
            toast.success(res.message || "Verification code sent to your email");
            setCountdown(60);
            setOtpCode("");
            setIsOtpModalOpen(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send verification code";
            toast.error(message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Resend verification code inside the modal
    const handleResendOtp = async () => {
        if (countdown > 0 || isSendingOtp) return;
        try {
            setIsSendingOtp(true);
            const res = await authService.sendChangePasswordOtp({ currentPassword });
            toast.success(res.message || "A new verification code has been sent to your email");
            setCountdown(60);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to resend verification code";
            toast.error(message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Step 2: Confirm OTP and finalize change password
    const handleConfirmPasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode || otpCode.length !== 6) {
            toast.error("Please enter the 6-digit verification code");
            return;
        }

        try {
            setIsVerifyingOtp(true);
            const res = await authService.changePassword({
                currentPassword,
                oldPassword: currentPassword,
                newPassword,
                otp: otpCode.trim(),
            });

            toast.success(res.message || "Password changed successfully");
            setIsOtpModalOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setOtpCode("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to change password";
            toast.error(message);
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const closeOtpModal = () => {
        if (isVerifyingOtp) return;
        setIsOtpModalOpen(false);
        setOtpCode("");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                    Platform Settings & Preferences
                </h1>
                <p className="text-xs text-[#7ecfc4] mt-0.5">
                    Customize your logistics preferences, notification triggers, and security credentials.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Preferences & Notifications & Security */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Logistics Preferences */}
                    <form
                        onSubmit={handleSavePreferences}
                        className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-5"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]/60">
                            <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                                <Globe size={16} className="text-[#00c9a7]" />
                                Regional & Dispatch Preferences
                            </h2>
                            <span className="text-[10px] text-[#3a6b66]">Localization</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Default Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                >
                                    <option value="USD ($)">USD ($) - US Dollar</option>
                                    <option value="EUR (€)">EUR (€) - Euro</option>
                                    <option value="GBP (£)">GBP (£) - British Pound</option>
                                    <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Operating Timezone
                                </label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                >
                                    <option value="America/Chicago (UTC-5)">Central Time (US & Canada)</option>
                                    <option value="America/New_York (UTC-4)">Eastern Time (US & Canada)</option>
                                    <option value="America/Los_Angeles (UTC-7)">Pacific Time (US & Canada)</option>
                                    <option value="Europe/London (UTC+0)">London / GMT</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Distance & Weight Units
                                </label>
                                <select
                                    value={distanceUnit}
                                    onChange={(e) => setDistanceUnit(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                >
                                    <option value="Miles (mi)">Imperial (Miles, Lbs)</option>
                                    <option value="Kilometers (km)">Metric (Kilometers, Kg)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="submit"
                                variant="outline"
                                shape="box"
                                size="sm"
                                leftIcon={<Save size={14} />}
                            >
                                Save Preferences
                            </Button>
                        </div>
                    </form>

                    {/* Notification Triggers */}
                    <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]/60">
                            <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                                <Bell size={16} className="text-[#00c9a7]" />
                                Real-Time Notifications & Alerts
                            </h2>
                            <span className="text-[10px] text-[#3a6b66]">Channels</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                <div>
                                    <span className="text-xs font-bold text-[#e0faf5] block">
                                        Email Dispatch & Delivery Alerts
                                    </span>
                                    <span className="text-[11px] text-[#7ecfc4]">
                                        Receive email notifications whenever a consignment changes milestone.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEmailAlerts(!emailAlerts)}
                                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                                        emailAlerts ? "bg-[#00c9a7]" : "bg-[#1a4a4a]"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-[#0a0f0f] shadow-md transition-transform ${
                                            emailAlerts ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                <div>
                                    <span className="text-xs font-bold text-[#e0faf5] block">
                                        SMS Courier Arrival Updates
                                    </span>
                                    <span className="text-[11px] text-[#7ecfc4]">
                                        Send urgent driver updates and ETA notices directly via text message.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSmsUpdates(!smsUpdates)}
                                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                                        smsUpdates ? "bg-[#00c9a7]" : "bg-[#1a4a4a]"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-[#0a0f0f] shadow-md transition-transform ${
                                            smsUpdates ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                <div>
                                    <span className="text-xs font-bold text-[#e0faf5] block">
                                        Daily Logistics Summary Digest
                                    </span>
                                    <span className="text-[11px] text-[#7ecfc4]">
                                        Consolidated PDF report of all orders, manifest completions, and fuel telemetry.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDispatchReports(!dispatchReports)}
                                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                                        dispatchReports ? "bg-[#00c9a7]" : "bg-[#1a4a4a]"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-[#0a0f0f] shadow-md transition-transform ${
                                            dispatchReports ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <form
                        onSubmit={handleRequestOtp}
                        className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]/60">
                            <h2 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                                <Lock size={16} className="text-[#00c9a7]" />
                                Security & Password
                            </h2>
                            <span className="text-[10px] text-[#3a6b66]">Credentials</span>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66] hover:text-[#7ecfc4] cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66] hover:text-[#7ecfc4] cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66] hover:text-[#7ecfc4] cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="submit"
                                variant="gradient"
                                shape="box"
                                size="default"
                                isLoading={isSendingOtp}
                                loadingText="Sending OTP..."
                                leftIcon={<Lock size={14} />}
                            >
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Col: Two-Factor Auth & Platform Info */}
                <div className="space-y-6">
                    {/* 2FA Card */}
                    <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]/60">
                            <h3 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-2">
                                <Smartphone size={14} className="text-[#00c9a7]" />
                                Two-Factor Auth (2FA)
                            </h3>
                            <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                    twoFactorEnabled
                                        ? "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30"
                                        : "bg-[#3a6b66]/20 text-[#7ecfc4] border-[#1a4a4a]"
                                }`}
                            >
                                {twoFactorEnabled ? "Active" : "Disabled"}
                            </span>
                        </div>

                        <p className="text-xs text-[#7ecfc4] leading-relaxed">
                            Protect your dispatch records and cargo manifests with authenticator app or OTP verification.
                        </p>

                        <Button
                            type="button"
                            onClick={() => {
                                setTwoFactorEnabled(!twoFactorEnabled);
                                toast.success(
                                    twoFactorEnabled
                                        ? "Two-factor authentication disabled"
                                        : "Two-factor authentication enabled"
                                );
                            }}
                            variant="outline"
                            shape="box"
                            className="w-full"
                        >
                            {twoFactorEnabled ? "Disable 2FA Protection" : "Enable Authenticator 2FA"}
                        </Button>
                    </div>

                    {/* Developer Webhook & API Key Card */}
                    <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-3">
                        <h3 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-2">
                            <Key size={14} className="text-[#00b4d8]" />
                            Public API Integration
                        </h3>
                        <p className="text-[11px] text-[#7ecfc4] leading-relaxed">
                            Use your FreightAgent REST API key to connect ERP systems, Shopify or WooCommerce plugins.
                        </p>

                        <div className="p-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] font-mono text-[10px] text-[#3a6b66] flex items-center justify-between">
                            <span>fa_live_99831a09...84</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText("fa_live_99831a0942bf9182374e7");
                                    toast.success("API key copied to clipboard");
                                }}
                                className="text-[#00c9a7] hover:underline cursor-pointer"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <AnimatePresence>
                {isOtpModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full max-w-md p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-2xl relative overflow-hidden flex flex-col gap-5"
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={closeOtpModal}
                                disabled={isVerifyingOtp}
                                className="absolute top-5 right-5 p-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <X size={15} />
                            </button>

                            {/* Modal Header */}
                            <div className="flex items-center gap-3 pr-8">
                                <div className="w-10 h-10 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] shrink-0">
                                    <KeyRound size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#e0faf5]">
                                        Verify Password Change
                                    </h3>
                                    <p className="text-[11px] text-[#7ecfc4] mt-0.5">
                                        Security verification required
                                    </p>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleConfirmPasswordChange} className="flex flex-col gap-4">
                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 text-[11px] text-[#7ecfc4]/90 flex items-start gap-2">
                                    <Mail size={14} className="text-[#00c9a7] shrink-0 mt-0.5" />
                                    <span>
                                        A 6-digit security code was sent to{" "}
                                        <strong className="text-[#e0faf5]">{authUser?.email || "your registered email"}</strong>.
                                        Enter it below to confirm your new password.
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        Enter 6-Digit Email OTP
                                    </label>
                                    <div className="relative">
                                        <KeyRound
                                            size={15}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                        />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                            placeholder="000000"
                                            className="w-full pl-10 pr-3.5 py-3 text-center tracking-[0.5em] font-mono text-base font-black rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                        <span className="text-[#3a6b66]">Didn&apos;t receive email?</span>
                                        {countdown > 0 ? (
                                            <span className="text-[#3a6b66]">Resend in {countdown}s</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={isSendingOtp}
                                                className="text-[#00c9a7] hover:underline font-semibold cursor-pointer"
                                            >
                                                Resend Code
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={closeOtpModal}
                                        disabled={isVerifyingOtp}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        shape="box"
                                        size="default"
                                        isLoading={isVerifyingOtp}
                                        loadingText="Verifying..."
                                        rightIcon={<CheckCircle2 size={14} />}
                                        disabled={otpCode.length !== 6}
                                    >
                                        Confirm & Change
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
