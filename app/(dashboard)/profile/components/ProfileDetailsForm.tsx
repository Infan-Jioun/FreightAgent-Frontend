"use client";

import { User, CheckCircle2, MapPin, Save, LocateFixed, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parsePhoneCountry } from "@/app/constants/countries";

interface ProfileDetailsFormProps {
    name: string;
    setName: (val: string) => void;
    email?: string;
    phone: string;
    address: string;
    setAddress: (val: string) => void;
    isSaving: boolean;
    isLocating: boolean;
    isProfileRateLimited?: boolean;
    profileRateLimitMsg?: string;
    onSave: (e: React.FormEvent) => Promise<void>;
    onDetectLocation: () => Promise<void>;
    onOpenPhoneModal: () => void;
}

export default function ProfileDetailsForm({
    name,
    setName,
    email,
    phone,
    address,
    setAddress,
    isSaving,
    isLocating,
    isProfileRateLimited = false,
    profileRateLimitMsg = "",
    onSave,
    onDetectLocation,
    onOpenPhoneModal,
}: ProfileDetailsFormProps) {
    // Parse verified phone into country flag, dialCode, and national number
    const { country, nationalNumber } = parsePhoneCountry(phone);

    return (
        <form
            onSubmit={onSave}
            className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 flex flex-col gap-5"
        >
            {/* Form Title */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]/60">
                <h3 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                    <User size={16} className="text-[#00c9a7]" />
                    Personal & Facility Details
                </h3>
                <span className="text-[10px] text-[#3a6b66]">
                    Synced directly with Ai Detector
                </span>
            </div>

            {/* Inputs Grid — Symmetrical 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field 1: Full Name */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between h-5">
                        <label className="text-[11px] font-semibold text-[#7ecfc4]">
                            Full Name
                        </label>
                        <span className="text-[10px] text-[#3a6b66]">
                            Legal / Display
                        </span>
                    </div>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10 w-full px-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                            placeholder="Enter your full legal or dispatch name"
                            required
                        />
                    </div>
                </div>

                {/* Field 2: Account Email (Read-Only) */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between h-5">
                        <label className="text-[11px] font-semibold text-[#7ecfc4]">
                            Account Email
                        </label>
                        <span className="text-[10px] text-[#00e5c0] flex items-center gap-1">
                            <CheckCircle2 size={11} /> Primary Sign-in
                        </span>
                    </div>
                    <div className="relative flex items-center">
                        <input
                            type="email"
                            value={email || ""}
                            readOnly
                            disabled
                            className="h-10 w-full px-3.5 rounded-2xl bg-[#0a1414] border border-[#1a4a4a]/40 text-xs text-[#3a6b66] cursor-not-allowed select-none"
                        />
                    </div>
                </div>

                {/* Field 3: Verified Contact Phone with Country Flag & Code */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between h-5">
                        <label className="text-[11px] font-semibold text-[#7ecfc4]">
                            Contact Phone Number
                        </label>
                        {phone ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Verified
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                                Unverified
                            </span>
                        )}
                    </div>
                    <div className="relative flex items-center">
                        {/* Country Flag & Dial Code Pill */}
                        <div className="absolute left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#112a2a] border border-[#1a4a4a] text-xs pointer-events-none select-none">
                            <span className="text-sm leading-none" role="img" aria-label={country.name}>
                                {country.flag}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-[#00c9a7]">
                                {country.dialCode}
                            </span>
                        </div>

                        {/* Phone Display Input */}
                        <input
                            type="text"
                            value={nationalNumber || (phone ? phone : "No phone verified yet")}
                            readOnly
                            disabled
                            className={`h-10 w-full pl-24 pr-22 rounded-2xl bg-[#0a1414] border border-[#1a4a4a]/40 text-xs cursor-not-allowed select-none ${
                                phone ? "text-[#e0faf5] font-mono tracking-wide" : "text-[#3a6b66]"
                            }`}
                        />

                        {/* Symmetrical Action Button */}
                        <Button
                            type="button"
                            variant={phone ? "outline" : "teal"}
                            size="xs"
                            shape="square"
                            onClick={onOpenPhoneModal}
                            className="absolute right-2 h-7"
                        >
                            {phone ? "Update" : "Verify"}
                        </Button>
                    </div>
                </div>

                {/* Field 4: Operating Facility / Address with Auto-detect Location */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between h-5">
                        <label className="text-[11px] font-semibold text-[#7ecfc4]">
                            Operating Facility / Address
                        </label>
                        <span className="text-[10px] text-[#3a6b66]">
                            GPS Auto-fill Supported
                        </span>
                    </div>
                    <div className="relative flex items-center">
                        <MapPin
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                        />
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="h-10 w-full pl-9 pr-22 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden transition-colors"
                            placeholder="e.g. Terminal 04, Port of Chattogram, BD"
                        />
                        {/* Symmetrical Action Button */}
                        <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            shape="square"
                            onClick={onDetectLocation}
                            isLoading={isLocating}
                            loadingText="Locating..."
                            leftIcon={<LocateFixed size={12} className="text-[#00c9a7]" />}
                            className="absolute right-2 h-7"
                            title="Auto-detect current location address via GPS"
                        >
                            Locate
                        </Button>
                    </div>
                </div>
            </div>

            {/* Rate Limit Warning Banner if 429 Daily Limit Reached */}
            {isProfileRateLimited && (
                <div className="p-3.5 rounded-2xl bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 flex items-start gap-3 text-xs text-[#ff6b6b]">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#ff6b6b]" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold">Daily Profile Update Limit Reached (3/3)</span>
                        <span className="text-[11px] text-[#ff6b6b]/90 leading-relaxed">
                            {profileRateLimitMsg ||
                                "You have reached the maximum daily limit (3/3) for profile updates. Please try again tomorrow."}
                        </span>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
                {isProfileRateLimited ? (
                    <span className="text-[11px] text-[#ff6b6b] font-semibold">
                        Daily update quota exhausted (3 of 3)
                    </span>
                ) : (
                    <span />
                )}

                <Button
                    type="submit"
                    variant="gradient"
                    shape="box"
                    size="default"
                    disabled={isSaving || isProfileRateLimited}
                    isLoading={isSaving}
                    loadingText="Saving Details..."
                    leftIcon={<Save size={15} />}
                >
                    Save Profile Changes
                </Button>
            </div>
        </form>
    );
}
