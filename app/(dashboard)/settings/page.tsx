"use client";

import { useState } from "react";
import {
    Settings,
    Bell,
    Shield,
    Key,
    Globe,
    Moon,
    Lock,
    Smartphone,
    Save,
    Check,
    HelpCircle,
    Eye,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    // Preferences state
    const [currency, setCurrency] = useState("USD ($)");
    const [timezone, setTimezone] = useState("America/Chicago (UTC-5)");
    const [distanceUnit, setDistanceUnit] = useState("Miles (mi)");

    // Notification toggles
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsUpdates, setSmsUpdates] = useState(true);
    const [dispatchReports, setDispatchReports] = useState(false);
    const [marketingNews, setMarketingNews] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // 2FA state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

    const handleSavePreferences = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Preferences saved successfully");
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error("Please enter your current password");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setUpdatingPassword(true);
        setTimeout(() => {
            setUpdatingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Security credentials updated");
        }, 800);
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
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
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
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
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
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                >
                                    <option value="Miles (mi)">Imperial (Miles, Lbs)</option>
                                    <option value="Kilometers (km)">Metric (Kilometers, Kg)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-2xl bg-[#112a2a] hover:bg-[#00c9a7]/20 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center gap-2"
                            >
                                <Save size={14} />
                                Save Preferences
                            </button>
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
                                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
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
                                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
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
                                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
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
                        onSubmit={handleUpdatePassword}
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
                                        type={showPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66] hover:text-[#7ecfc4]"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        New Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={updatingPassword}
                                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2"
                            >
                                <Lock size={14} />
                                {updatingPassword ? "Updating..." : "Update Password"}
                            </button>
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

                        <button
                            type="button"
                            onClick={() => {
                                setTwoFactorEnabled(!twoFactorEnabled);
                                toast.success(
                                    twoFactorEnabled
                                        ? "Two-factor authentication disabled"
                                        : "Two-factor authentication enabled"
                                );
                            }}
                            className="w-full py-2.5 rounded-2xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors"
                        >
                            {twoFactorEnabled ? "Disable 2FA Protection" : "Enable Authenticator 2FA"}
                        </button>
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
                                className="text-[#00c9a7] hover:underline"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
