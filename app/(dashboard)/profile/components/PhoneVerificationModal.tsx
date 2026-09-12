"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, X, ArrowRight, KeyRound, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICountry, COUNTRIES } from "@/app/constants/countries";

interface PhoneVerificationModalProps {
    isOpen: boolean;
    phoneStep: "input" | "otp";
    setPhoneStep: (step: "input" | "otp") => void;
    modalPhone: string;
    selectedCountry: ICountry;
    nationalPhone: string;
    onCountryChange: (country: ICountry) => void;
    onNationalPhoneChange: (val: string) => void;
    otpCode: string;
    setOtpCode: (val: string) => void;
    countdown: number;
    isSendingOtp: boolean;
    isVerifyingOtp: boolean;
    userEmail?: string;
    onClose: () => void;
    onSendOtp: (e?: React.FormEvent) => Promise<void>;
    onVerifyOtp: (e: React.FormEvent) => Promise<void>;
}

export default function PhoneVerificationModal({
    isOpen,
    phoneStep,
    setPhoneStep,
    modalPhone,
    selectedCountry,
    nationalPhone,
    onCountryChange,
    onNationalPhoneChange,
    otpCode,
    setOtpCode,
    countdown,
    isSendingOtp,
    isVerifyingOtp,
    userEmail,
    onClose,
    onSendOtp,
    onVerifyOtp,
}: PhoneVerificationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
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
                            onClick={onClose}
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
                                    {phoneStep === "input"
                                        ? "Verify Contact Phone"
                                        : "Enter Verification OTP"}
                                </h3>
                                <p className="text-[11px] text-[#7ecfc4] mt-0.5">
                                    {phoneStep === "input"
                                        ? "Select your country and enter your national number."
                                        : `Code dispatched to ${userEmail || "your registered email"}`}
                                </p>
                            </div>
                        </div>

                        {/* Step 1: Input Phone & Request OTP to Email */}
                        {phoneStep === "input" ? (
                            <form onSubmit={onSendOtp} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                        International Phone Number
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {/* Country Selector Dropdown with Flag and DialCode */}
                                        <div className="relative shrink-0">
                                            <select
                                                value={selectedCountry.code}
                                                onChange={(e) => {
                                                    const found = COUNTRIES.find((c) => c.code === e.target.value);
                                                    if (found) onCountryChange(found);
                                                }}
                                                className="h-10 pl-3 pr-7 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-semibold text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] appearance-none cursor-pointer transition-colors"
                                            >
                                                {COUNTRIES.map((c) => (
                                                    <option key={c.code} value={c.code} className="bg-[#0d1f1f] text-[#e0faf5]">
                                                        {c.flag} {c.code} ({c.dialCode})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3a6b66] pointer-events-none" />
                                        </div>

                                        {/* National Number Input */}
                                        <div className="relative flex-1">
                                            <input
                                                type="tel"
                                                value={nationalPhone}
                                                onChange={(e) => onNationalPhoneChange(e.target.value)}
                                                placeholder="1711000000"
                                                className="h-10 w-full px-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-mono text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-[#3a6b66] px-1">
                                        <span>
                                            E.164 Payload: <strong className="text-[#00e5c0] font-mono">{modalPhone || `${selectedCountry.dialCode}...`}</strong>
                                        </span>
                                        <span>{selectedCountry.name}</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 text-[11px] text-[#7ecfc4]/90 flex items-start gap-2">
                                    <Mail size={14} className="text-[#00c9a7] shrink-0 mt-0.5" />
                                    <span>
                                        For account security, the 6-digit confirmation code will be delivered directly to your registered email: <strong>{userEmail}</strong>.
                                    </span>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
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
                            <form onSubmit={onVerifyOtp} className="flex flex-col gap-4">
                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#00c9a7]/30 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl leading-none">{selectedCountry.flag}</span>
                                        <div>
                                            <span className="text-[10px] text-[#3a6b66] block">Phone to Verify</span>
                                            <span className="font-mono font-bold text-[#00e5c0]">{modalPhone}</span>
                                        </div>
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
                                                onClick={() => onSendOtp()}
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
    );
}
