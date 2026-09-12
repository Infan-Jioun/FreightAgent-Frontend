import { Shield, CheckCircle2, Sparkles, Lock, Calendar } from "lucide-react";
import { IUserProfile } from "@/app/types/user.types";

interface ProfileSecurityCardsProps {
    profile: IUserProfile | null;
}

export default function ProfileSecurityCards({ profile }: ProfileSecurityCardsProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Security Status Card */}
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
    );
}
