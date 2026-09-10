"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/app/store/authStore";
import { userService } from "@/app/services/user.service";
import { IUserProfile, ISessionItem, ISessionsBreakdown } from "@/app/types/user.types";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Shield,
    CheckCircle2,
    Calendar,
    MapPin,
    Phone,
    Camera,
    Save,
    Sparkles,
    Truck,
    Smartphone,
    Laptop,
    Tablet,
    Globe,
    Lock,
    Send,
    LogOut,
    Check,
    RefreshCw,
    X,
    KeyRound,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user: authUser, setUser } = useAuthStore();

    // ─── Profile State ─────────────────────────────────────────────────────
    const [profile, setProfile] = useState<IUserProfile | null>(null);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    // ─── Loading States ────────────────────────────────────────────────────
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // ─── Phone Verification Modal State ────────────────────────────────────
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
    const [modalPhone, setModalPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // ─── Sessions State (Rendered at Bottom) ────────────────────────────────
    const [sessions, setSessions] = useState<ISessionItem[]>([]);
    const [breakdown, setBreakdown] = useState<ISessionsBreakdown>({
        total: 0,
        mobile: 0,
        tablet: 0,
        desktop: 0,
    });
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Load Initial Profile & Sessions on Mount ──────────────────────────
    useEffect(() => {
        loadProfile();
        loadSessions();
    }, []);

    // ─── OTP Resend Countdown Timer ────────────────────────────────────────
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const loadProfile = async () => {
        try {
            setIsLoadingProfile(true);
            const data = await userService.getMe();
            setProfile(data);
            setName(data.name || "");
            setAddress(data.address || "");
            setPhone(data.phone || "");

            if (authUser) {
                setUser({
                    ...authUser,
                    name: data.name,
                    image: data.image,
                    role: data.role,
                    emailVerified: data.emailVerified,
                });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load profile";
            toast.error(message);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const loadSessions = async () => {
        try {
            setIsLoadingSessions(true);
            const data = await userService.getActiveSessions();
            setSessions(data.sessions || []);
            setBreakdown(
                data.breakdown || { total: 0, mobile: 0, tablet: 0, desktop: 0 }
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load active sessions";
            toast.error(message);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    // ─── Save Profile Details (Name & Address) ─────────────────────────────
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedAddress = address.trim();

        if (!trimmedName || trimmedName.length < 2) {
            toast.error("Full name must contain at least 2 characters");
            return;
        }

        if (trimmedAddress && trimmedAddress.length < 3) {
            toast.error("Address must contain at least 3 characters if provided");
            return;
        }

        try {
            setIsSaving(true);
            const updated = await userService.updateProfile({
                name: trimmedName,
                address: trimmedAddress || undefined,
            });

            setProfile((prev) => (prev ? { ...prev, ...updated } : updated));

            if (authUser) {
                setUser({
                    ...authUser,
                    name: updated.name,
                });
            }

            toast.success("Profile details updated successfully");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to update profile";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Avatar Upload to Cloudinary ────────────────────────────────────────
    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file (PNG, JPG, WEBP)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file size must be under 5MB");
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const toastId = toast.loading("Uploading avatar to Cloudinary...");
            const res = await userService.uploadAvatar(file);

            setProfile((prev) => (prev ? { ...prev, image: res.image } : prev));

            if (authUser) {
                setUser({
                    ...authUser,
                    image: res.image,
                });
            }

            toast.dismiss(toastId);
            toast.success("Avatar updated successfully");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to upload avatar";
            toast.error(message);
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // ─── Open Phone Verification Modal ──────────────────────────────────────
    const openPhoneModal = () => {
        setModalPhone(phone || "+880");
        setOtpCode("");
        setPhoneStep("input");
        setIsPhoneModalOpen(true);
    };

    const closePhoneModal = () => {
        if (!isSendingOtp && !isVerifyingOtp) {
            setIsPhoneModalOpen(false);
            setOtpCode("");
            setPhoneStep("input");
        }
    };

    // ─── Step 1: Send OTP to Registered Email ──────────────────────────────
    const handleSendPhoneOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const formatted = modalPhone.trim();
        if (!formatted) {
            toast.error("Please enter your phone number");
            return;
        }

        if (!formatted.startsWith("+")) {
            toast.error("Phone number must include country code starting with '+' (e.g. +88017XXXXXXXX or +12125551234)");
            return;
        }

        if (formatted.length < 8) {
            toast.error("Phone number is too short. Please include full country and area code");
            return;
        }

        try {
            setIsSendingOtp(true);
            const res = await userService.requestPhoneVerification({
                phone: formatted,
            });

            toast.success(res.message || "Verification OTP dispatched!", {
                description: `A 6-digit code was sent to ${profile?.email}. Enter it below.`,
            });

            setPhoneStep("otp");
            setCountdown(60); // 60 seconds resend cooldown
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send verification code";
            toast.error(message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    // ─── Step 2: Verify OTP and Save Phone ──────────────────────────────────
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCode = otpCode.trim();
        if (trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
            toast.error("Please enter the complete 6-digit numeric verification code");
            return;
        }

        try {
            setIsVerifyingOtp(true);
            const updated = await userService.verifyPhone({
                phone: modalPhone.trim(),
                code: trimmedCode,
            });

            setPhone(updated.phone || modalPhone.trim());
            setProfile((prev) => (prev ? { ...prev, phone: updated.phone } : prev));
            setIsPhoneModalOpen(false);
            setOtpCode("");
            setPhoneStep("input");

            toast.success("Phone number verified and saved successfully!");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Invalid or expired verification code";
            toast.error(message);
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // ─── Revoke Active Session ──────────────────────────────────────────────
    const handleRevokeSession = async (sessionId: string) => {
        try {
            setRevokingSessionId(sessionId);
            const res = await userService.revokeSession(sessionId);
            toast.success(res.message || "Session revoked");
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            setBreakdown((prev) => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
            }));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to revoke session";
            toast.error(message);
        } finally {
            setRevokingSessionId(null);
        }
    };

    // ─── Role Badges & Icon Helpers ─────────────────────────────────────────
    const getRoleBadge = (role?: string) => {
        switch (role) {
            case "ADMIN":
                return {
                    label: "Platform Administrator",
                    style: "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/30",
                    icon: Shield,
                };
            case "AGENT":
                return {
                    label: "Certified Dispatch Agent",
                    style: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
                    icon: Truck,
                };
            default:
                return {
                    label: "Verified Customer",
                    style: "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30",
                    icon: CheckCircle2,
                };
        }
    };

    const roleBadge = getRoleBadge(profile?.role);
    const BadgeIcon = roleBadge.icon;

    const initials = name
        ? name
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "FA";

    const getDeviceIcon = (deviceType: string | null) => {
        const type = (deviceType || "").toLowerCase();
        if (type === "mobile") return <Smartphone size={16} className="text-[#00c9a7]" />;
        if (type === "tablet") return <Tablet size={16} className="text-[#00b4d8]" />;
        return <Laptop size={16} className="text-[#7ecfc4]" />;
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Hidden File Input for Avatar Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarSelect}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
            />

            {/* Top Page Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                    Account Profile & Credentials
                </h1>
                <p className="text-xs text-[#7ecfc4] mt-0.5">
                    Manage your verified identity, Cloudinary profile image, contact details, and multi-device sessions.
                </p>
            </div>

            {/* Profile Hero Card */}
            <div className="p-6 rounded-3xl bg-linear-to-br from-[#0d1f1f] via-[#0d1f1f] to-[#112a2a] border border-[#1a4a4a] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#00c9a7]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    {/* Avatar with Cloudinary Upload Trigger */}
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f] font-black text-3xl shadow-xl shadow-[#00c9a7]/20 overflow-hidden relative border-2 border-[#1a4a4a]">
                            {profile?.image ? (
                                <Image
                                    src={profile.image}
                                    alt={name || "User Avatar"}
                                    width={112}
                                    height={112}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span>{initials}</span>
                            )}

                            {isUploadingAvatar && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Camera button overlay */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] hover:border-[#00c9a7] text-[#00c9a7] hover:text-[#00e5c0] shadow-lg transition-colors cursor-pointer"
                            title="Upload Avatar to Cloudinary"
                        >
                            <Camera size={15} />
                        </button>
                    </div>

                    {/* User Summary Info */}
                    <div className="text-center sm:text-left flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            <h2 className="text-xl sm:text-2xl font-black text-[#e0faf5] truncate">
                                {name || "Freight Operator"}
                            </h2>
                            <div
                                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border ${roleBadge.style} w-fit mx-auto sm:mx-0`}
                            >
                                <BadgeIcon size={13} strokeWidth={2.5} />
                                <span>{roleBadge.label}</span>
                            </div>
                        </div>

                        {/* Contact Chips */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#7ecfc4]">
                            <span className="flex items-center gap-1.5">
                                <Mail size={13} className="text-[#00c9a7]" />
                                <span>{profile?.email || "loading..."}</span>
                                {profile?.emailVerified && (
                                    <span title="Email verified" className="inline-flex items-center">
                                        <CheckCircle2 size={13} className="text-[#00e5c0]" />
                                    </span>
                                )}
                            </span>

                            <span className="w-1 h-1 rounded-full bg-[#1a4a4a]" />

                            <span className="flex items-center gap-1.5">
                                <Phone size={13} className="text-[#00b4d8]" />
                                <span>{phone || "No phone added"}</span>
                                {phone ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                                        Verified
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                                        Unverified
                                    </span>
                                )}
                            </span>
                        </div>

                        {address && (
                            <p className="text-xs text-[#7ecfc4]/80 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                                <MapPin size={13} className="text-[#00c9a7] shrink-0" />
                                <span className="truncate">{address}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Middle Section: Personal Details Form (2 Cols) + Security Stats (1 Col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Form */}
                <div className="lg:col-span-2">
                    <form
                        onSubmit={handleSaveProfile}
                        className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 flex flex-col gap-5"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]/60">
                            <h3 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                                <User size={16} className="text-[#00c9a7]" />
                                Personal & Facility Details
                            </h3>
                            <span className="text-[10px] text-[#3a6b66]">
                                Synced directly with PostgreSQL via Prisma
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                    placeholder="Enter your full legal or dispatch name"
                                    required
                                />
                            </div>

                            {/* Email Address (Read-Only) */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        Account Email
                                    </label>
                                    <span className="text-[10px] text-[#00e5c0] flex items-center gap-1">
                                        <CheckCircle2 size={11} /> Primary Sign-in
                                    </span>
                                </div>
                                <input
                                    type="email"
                                    value={profile?.email || ""}
                                    readOnly
                                    disabled
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1414] border border-[#1a4a4a]/40 text-xs text-[#3a6b66] cursor-not-allowed select-none"
                                />
                            </div>

                            {/* Verified Contact Phone with Modal Verification Trigger */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        Contact Phone Number
                                    </label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="xs"
                                        onClick={openPhoneModal}
                                        className="text-[11px] font-bold"
                                    >
                                        {phone ? "Change / Re-verify" : "Verify Phone"}
                                    </Button>
                                </div>
                                <div className="relative flex items-center">
                                    <Phone
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                    />
                                    <input
                                        type="text"
                                        value={phone || "No phone verified yet"}
                                        readOnly
                                        disabled
                                        className={`w-full pl-9 pr-24 py-2.5 rounded-2xl bg-[#0a1414] border border-[#1a4a4a]/40 text-xs cursor-not-allowed ${
                                            phone ? "text-[#e0faf5] font-mono" : "text-[#3a6b66]"
                                        }`}
                                    />
                                    <Button
                                        type="button"
                                        variant={phone ? "outline" : "teal"}
                                        size="xs"
                                        shape="square"
                                        onClick={openPhoneModal}
                                        className="absolute right-2"
                                    >
                                        {phone ? "Update" : "Verify"}
                                    </Button>
                                </div>
                            </div>

                            {/* Address / Facility Location */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Operating Facility / Address
                                </label>
                                <div className="relative">
                                    <MapPin
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                    />
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                        placeholder="e.g. Terminal 04, Port of Chattogram, BD"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-3 flex justify-end">
                            <Button
                                type="submit"
                                variant="gradient"
                                shape="box"
                                size="default"
                                isLoading={isSaving}
                                loadingText="Saving Details..."
                                leftIcon={<Save size={15} />}
                            >
                                Save Profile Changes
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Security & Metadata Summary Cards */}
                <div className="flex flex-col gap-6">
                    {/* Security Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col gap-3.5 shadow-md">
                        <h4 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-2">
                            <Shield size={14} className="text-[#00c9a7]" />
                            Security & Credential Status
                        </h4>

                        <div className="flex flex-col gap-2.5 text-xs">
                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-[#3a6b66]">Email Verification</span>
                                    <span className="font-bold text-[#00e5c0]">
                                        {profile?.emailVerified ? "Confirmed" : "Unverified"}
                                    </span>
                                </div>
                                <CheckCircle2 size={16} className="text-[#00e5c0]" />
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-[#3a6b66]">Platform Access Role</span>
                                    <span className="font-bold text-[#e0faf5]">{profile?.role || "CUSTOMER"}</span>
                                </div>
                                <Sparkles size={16} className="text-[#00b4d8]" />
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-[#3a6b66]">Two-Factor Authentication</span>
                                    <span className="font-bold text-[#7ecfc4]">
                                        {profile?.twoFactorEnabled ? "Active" : "Standard Security"}
                                    </span>
                                </div>
                                <Lock size={16} className="text-[#00c9a7]" />
                            </div>
                        </div>
                    </div>

                    {/* Account Tenure Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col gap-3 shadow-md">
                        <span className="text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider block">
                            Platform Membership
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#112a2a] border border-[#1a4a4a] flex items-center justify-center text-[#7ecfc4]">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-[#e0faf5] block">
                                    Registered Member
                                </span>
                                <span className="text-[11px] text-[#7ecfc4]">
                                    {profile?.createdAt
                                        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                                              month: "long",
                                              day: "numeric",
                                              year: "numeric",
                                          })
                                        : "Recent"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Active Device Sessions ("session bottom e dekabe") */}
            <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl flex flex-col gap-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a4a4a]/60">
                    <div>
                        <h3 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                            <Laptop size={16} className="text-[#00c9a7]" />
                            Active Device Sign-in Sessions
                        </h3>
                        <p className="text-xs text-[#7ecfc4] mt-0.5">
                            Authenticated sessions currently connected to your FreightAgent account across workstations and mobile devices.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        size="xs"
                        onClick={loadSessions}
                        leftIcon={<RefreshCw size={12} className={isLoadingSessions ? "animate-spin" : ""} />}
                    >
                        Refresh Sessions
                    </Button>
                </div>

                {/* Device Breakdown Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Total Sessions
                            </span>
                            <span className="text-xl font-black text-[#e0faf5]">{breakdown.total}</span>
                        </div>
                        <Globe size={20} className="text-[#00c9a7]" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Desktops
                            </span>
                            <span className="text-xl font-black text-[#e0faf5]">{breakdown.desktop}</span>
                        </div>
                        <Laptop size={20} className="text-[#00b4d8]" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Mobile Phones
                            </span>
                            <span className="text-xl font-black text-[#e0faf5]">{breakdown.mobile}</span>
                        </div>
                        <Smartphone size={20} className="text-[#00e5c0]" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Tablets
                            </span>
                            <span className="text-xl font-black text-[#e0faf5]">{breakdown.tablet}</span>
                        </div>
                        <Tablet size={20} className="text-[#f59e0b]" />
                    </div>
                </div>

                {/* Sessions Cards List */}
                {isLoadingSessions ? (
                    <div className="min-h-[160px] flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#7ecfc4] bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a]/50">
                        No active session records found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    session.isCurrent
                                        ? "bg-[#00c9a7]/10 border-[#00c9a7]/50 shadow-xs shadow-[#00c9a7]/10"
                                        : "bg-[#0a1a1a] border-[#1a4a4a]/70 hover:border-[#1a4a4a]"
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-[#112a2a] border border-[#1a4a4a] flex items-center justify-center shrink-0 mt-0.5">
                                        {getDeviceIcon(session.deviceType)}
                                    </div>

                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-xs font-bold text-[#e0faf5]">
                                                {session.browser || "Standard Browser"} on{" "}
                                                {session.os || session.deviceName || "Desktop"}
                                            </h4>
                                            {session.isCurrent && (
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                                                    Current Active Session
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2.5 text-[11px] text-[#3a6b66] pt-0.5">
                                            <span>IP: {session.ipAddress || "Unknown IP"}</span>
                                            <span>•</span>
                                            <span>
                                                Signed in:{" "}
                                                {new Date(session.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Revoke Remote Session Action */}
                                {!session.isCurrent && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        shape="box"
                                        onClick={() => handleRevokeSession(session.id)}
                                        isLoading={revokingSessionId === session.id}
                                        loadingText="Revoking..."
                                        leftIcon={<LogOut size={13} />}
                                    >
                                        Revoke Session
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Phone Verification Modal ("Verify Phone etar modde model otp dibe") */}
            <AnimatePresence>
                {isPhoneModalOpen && (
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
                                onClick={closePhoneModal}
                                disabled={isSendingOtp || isVerifyingOtp}
                                className="absolute top-5 right-5 p-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7] transition-colors cursor-pointer"
                            >
                                <X size={15} />
                            </button>

                            {/* Modal Header */}
                            <div className="flex items-center gap-3 pr-8">
                                <div className="w-10 h-10 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#e0faf5]">
                                        {phoneStep === "input" ? "Verify Contact Phone" : "Enter Verification OTP"}
                                    </h3>
                                    <p className="text-[11px] text-[#7ecfc4] mt-0.5">
                                        {phoneStep === "input"
                                            ? "6-digit OTP will be dispatched to your account email."
                                            : `Code dispatched to ${profile?.email}`}
                                    </p>
                                </div>
                            </div>

                            {/* Step 1: Input Phone & Request OTP to Email */}
                            {phoneStep === "input" ? (
                                <form onSubmit={handleSendPhoneOtp} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                            International Phone Number (E.164 Format)
                                        </label>
                                        <div className="relative">
                                            <Phone
                                                size={15}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                            />
                                            <input
                                                type="tel"
                                                value={modalPhone}
                                                onChange={(e) => setModalPhone(e.target.value)}
                                                placeholder="+8801711000000 or +12125551234"
                                                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-mono text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <span className="text-[10px] text-[#3a6b66]">
                                            Include country code prefix (+880, +1, +44, etc.).
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 text-[11px] text-[#7ecfc4]/90 flex items-start gap-2">
                                        <Mail size={14} className="text-[#00c9a7] shrink-0 mt-0.5" />
                                        <span>
                                            For account security, the 6-digit confirmation code will be delivered directly to your registered email: <strong>{profile?.email}</strong>.
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={closePhoneModal}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="gradient"
                                            shape="box"
                                            size="default"
                                            isLoading={isSendingOtp}
                                            loadingText="Sending Code..."
                                            rightIcon={<ArrowRight size={14} />}
                                        >
                                            Send Code to Email
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                /* Step 2: Input OTP & Verify */
                                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                                    <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#00c9a7]/30 flex items-center justify-between text-xs">
                                        <div>
                                            <span className="text-[10px] text-[#3a6b66] block">Phone to Verify</span>
                                            <span className="font-mono font-bold text-[#00e5c0]">{modalPhone}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="xs"
                                            onClick={() => setPhoneStep("input")}
                                            disabled={isVerifyingOtp}
                                        >
                                            Change Number
                                        </Button>
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
                                                    onClick={handleSendPhoneOtp}
                                                    disabled={isSendingOtp}
                                                    className="text-[#00c9a7] hover:underline font-semibold cursor-pointer"
                                                >
                                                    Resend Code
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPhoneStep("input")}
                                            disabled={isVerifyingOtp}
                                        >
                                            Back
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="teal"
                                            shape="box"
                                            size="default"
                                            isLoading={isVerifyingOtp}
                                            loadingText="Verifying..."
                                            leftIcon={<CheckCircle2 size={15} />}
                                        >
                                            Verify & Update Phone
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
