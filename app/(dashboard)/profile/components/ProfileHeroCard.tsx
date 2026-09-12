"use client";

import Image from "next/image";
import {
    Shield,
    Truck,
    CheckCircle2,
    Camera,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";
import { IUserProfile } from "@/app/types/user.types";

interface ProfileHeroCardProps {
    profile: IUserProfile | null;
    name: string;
    phone: string;
    address: string;
    isUploadingAvatar: boolean;
    onUploadClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onAvatarSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function ProfileHeroCard({
    profile,
    name,
    phone,
    address,
    isUploadingAvatar,
    onUploadClick,
    fileInputRef,
    onAvatarSelect,
}: ProfileHeroCardProps) {
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

    return (
        <div className="p-6 rounded-3xl bg-linear-to-br from-[#0d1f1f] via-[#0d1f1f] to-[#112a2a] border border-[#1a4a4a] shadow-xl relative overflow-hidden">
            {/* Hidden File Input for Avatar Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={onAvatarSelect}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
            />

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
                        onClick={onUploadClick}
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
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                                    Verified
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
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
    );
}
