"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { userService } from "@/app/services/user.service";
import {
    IUserProfile,
    ISessionItem,
    ISessionsBreakdown,
    ISessionsData,
} from "@/app/types/user.types";
import { ICountry, COUNTRIES, parsePhoneCountry } from "@/app/constants/countries";
import { detectCurrentAddress } from "@/app/lib/geolocation";

export interface UseProfileManagerReturn {
    // Profile State
    profile: IUserProfile | null;
    name: string;
    setName: (name: string) => void;
    address: string;
    setAddress: (address: string) => void;
    phone: string;
    isSaving: boolean;
    isUploadingAvatar: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;

    // Location Auto-detect
    isLocating: boolean;
    handleDetectLocation: () => Promise<void>;

    // Form & Avatar Handlers
    handleSaveProfile: (e: React.FormEvent) => Promise<void>;
    handleAvatarSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    triggerAvatarUpload: () => void;

    // Phone Modal State & Handlers
    isPhoneModalOpen: boolean;
    phoneStep: "input" | "otp";
    setPhoneStep: (step: "input" | "otp") => void;
    modalPhone: string;
    setModalPhone: (phone: string) => void;
    selectedCountry: ICountry;
    setSelectedCountry: (c: ICountry) => void;
    nationalPhone: string;
    setNationalPhone: (n: string) => void;
    handleModalCountryChange: (country: ICountry) => void;
    handleModalNationalPhoneChange: (val: string) => void;
    otpCode: string;
    setOtpCode: (code: string) => void;
    isSendingOtp: boolean;
    isVerifyingOtp: boolean;
    countdown: number;
    openPhoneModal: () => void;
    closePhoneModal: () => void;
    handleSendPhoneOtp: (e?: React.FormEvent) => Promise<void>;
    handleVerifyOtp: (e: React.FormEvent) => Promise<void>;

    // Sessions State & Handlers
    sessions: ISessionItem[];
    breakdown: ISessionsBreakdown;
    isLoadingSessions: boolean;
    revokingSessionId: string | null;
    isRevokingAll: boolean;
    handleRevokeSession: (sessionId: string) => Promise<void>;
    handleRevokeAllOtherSessions: () => Promise<void>;
    refreshSessions: () => Promise<void>;
}

export function useProfileManager(
    initialProfile: IUserProfile | null,
    initialSessions: ISessionsData | null
): UseProfileManagerReturn {
    const { user: authUser, setUser } = useAuthStore();

    // ─── Profile State ─────────────────────────────────────────────────────
    const [profile, setProfile] = useState<IUserProfile | null>(initialProfile);
    const [name, setName] = useState(initialProfile?.name || "");
    const [address, setAddress] = useState(initialProfile?.address || "");
    const [phone, setPhone] = useState(initialProfile?.phone || "");

    // ─── Loading States ────────────────────────────────────────────────────
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // ─── Phone Verification Modal State ────────────────────────────────────
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
    const [modalPhone, setModalPhone] = useState("");
    const [selectedCountry, setSelectedCountry] = useState<ICountry>(COUNTRIES[0]);
    const [nationalPhone, setNationalPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // ─── Sessions State ────────────────────────────────────────────────────
    const [sessions, setSessions] = useState<ISessionItem[]>(
        initialSessions?.sessions || []
    );
    const [breakdown, setBreakdown] = useState<ISessionsBreakdown>(
        initialSessions?.breakdown || {
            total: 0,
            mobile: 0,
            tablet: 0,
            desktop: 0,
        }
    );
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
    const [isRevokingAll, setIsRevokingAll] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Synchronize initialProfile changes if SSR revalidates or updates
    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
            setName(initialProfile.name || "");
            setAddress(initialProfile.address || "");
            setPhone(initialProfile.phone || "");
        }
    }, [initialProfile]);

    // Synchronize initialSessions changes if SSR revalidates
    useEffect(() => {
        if (initialSessions) {
            setSessions(initialSessions.sessions || []);
            setBreakdown(
                initialSessions.breakdown || {
                    total: 0,
                    mobile: 0,
                    tablet: 0,
                    desktop: 0,
                }
            );
        }
    }, [initialSessions]);

    // ─── OTP Resend Countdown Timer ────────────────────────────────────────
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // ─── Trigger File Input ────────────────────────────────────────────────
    const triggerAvatarUpload = () => {
        fileInputRef.current?.click();
    };

    // ─── Auto-detect Current Location Address ──────────────────────────────
    const handleDetectLocation = async (): Promise<void> => {
        try {
            setIsLocating(true);
            const detectedAddress = await detectCurrentAddress();
            setAddress(detectedAddress);
            toast.success("Facility location detected successfully", {
                description: detectedAddress,
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unable to detect location. Please check browser permissions.";
            toast.error(message);
        } finally {
            setIsLocating(false);
        }
    };

    // ─── Save Profile Details (Name & Address) ─────────────────────────────
    const handleSaveProfile = async (e: React.FormEvent): Promise<void> => {
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
    const handleAvatarSelect = async (
        e: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
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
    const openPhoneModal = (): void => {
        const parsed = parsePhoneCountry(phone || "+880");
        setSelectedCountry(parsed.country);
        setNationalPhone(parsed.nationalNumber);
        setModalPhone(phone || `${parsed.country.dialCode}`);
        setOtpCode("");
        setPhoneStep("input");
        setIsPhoneModalOpen(true);
    };

    const closePhoneModal = (): void => {
        if (!isSendingOtp && !isVerifyingOtp) {
            setIsPhoneModalOpen(false);
            setOtpCode("");
            setPhoneStep("input");
        }
    };

    const handleModalCountryChange = (country: ICountry): void => {
        setSelectedCountry(country);
        const cleanNational = nationalPhone.replace(/\D/g, "");
        setModalPhone(`${country.dialCode}${cleanNational}`);
    };

    const handleModalNationalPhoneChange = (val: string): void => {
        // If user pastes a full international number with +, auto-detect country
        if (val.startsWith("+")) {
            const parsed = parsePhoneCountry(val);
            setSelectedCountry(parsed.country);
            setNationalPhone(parsed.nationalNumber);
            setModalPhone(val);
            return;
        }

        const clean = val.replace(/\D/g, "");
        setNationalPhone(clean);
        setModalPhone(`${selectedCountry.dialCode}${clean}`);
    };

    // ─── Step 1: Send OTP to Registered Email ──────────────────────────────
    const handleSendPhoneOtp = async (e?: React.FormEvent): Promise<void> => {
        if (e) e.preventDefault();
        const formatted = modalPhone.trim();
        if (!formatted) {
            toast.error("Please enter your phone number");
            return;
        }

        if (!formatted.startsWith("+")) {
            toast.error(
                "Phone number must include country code starting with '+' (e.g. +88017XXXXXXXX or +12125551234)"
            );
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
            setCountdown(60);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send verification code";
            toast.error(message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    // ─── Step 2: Verify OTP and Save Phone ──────────────────────────────────
    const handleVerifyOtp = async (e: React.FormEvent): Promise<void> => {
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

    // ─── Refresh Active Sessions ────────────────────────────────────────────
    const refreshSessions = async (): Promise<void> => {
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

    // ─── Revoke Active Session ──────────────────────────────────────────────
    const handleRevokeSession = async (sessionId: string): Promise<void> => {
        try {
            setRevokingSessionId(sessionId);
            const res = await userService.revokeSession(sessionId);
            toast.success(res.message || "Session revoked successfully");
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            setBreakdown((prev) => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
            }));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to revoke session";
            if (/record.*not found|not found/i.test(message)) {
                toast.success("Session revoked successfully");
                setSessions((prev) => prev.filter((s) => s.id !== sessionId));
                setBreakdown((prev) => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                }));
            } else {
                toast.error(message);
            }
        } finally {
            setRevokingSessionId(null);
        }
    };

    // ─── Revoke All Other Remote Sessions ───────────────────────────────────
    const handleRevokeAllOtherSessions = async (): Promise<void> => {
        const remoteSessions = sessions.filter((s) => !s.isCurrent);
        if (remoteSessions.length === 0) return;

        try {
            setIsRevokingAll(true);
            await Promise.all(
                remoteSessions.map((s) =>
                    userService.revokeSession(s.id).catch(() => null)
                )
            );
            toast.success("All other sessions terminated successfully");
            await refreshSessions();
        } catch {
            toast.error("Failed to revoke some sessions");
        } finally {
            setIsRevokingAll(false);
        }
    };

    return {
        profile,
        name,
        setName,
        address,
        setAddress,
        phone,
        isSaving,
        isUploadingAvatar,
        fileInputRef,

        isLocating,
        handleDetectLocation,

        handleSaveProfile,
        handleAvatarSelect,
        triggerAvatarUpload,

        isPhoneModalOpen,
        phoneStep,
        setPhoneStep,
        modalPhone,
        setModalPhone,
        selectedCountry,
        setSelectedCountry,
        nationalPhone,
        setNationalPhone,
        handleModalCountryChange,
        handleModalNationalPhoneChange,
        otpCode,
        setOtpCode,
        isSendingOtp,
        isVerifyingOtp,
        countdown,
        openPhoneModal,
        closePhoneModal,
        handleSendPhoneOtp,
        handleVerifyOtp,

        sessions,
        breakdown,
        isLoadingSessions,
        revokingSessionId,
        isRevokingAll,
        handleRevokeSession,
        handleRevokeAllOtherSessions,
        refreshSessions,
    };
}
