"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import {
    User,
    Mail,
    Shield,
    CheckCircle2,
    Calendar,
    Building,
    MapPin,
    Phone,
    Camera,
    Save,
    Key,
    Sparkles,
    Truck,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();

    const [name, setName] = useState(user?.name || "Cargo Manager");
    const [email] = useState(user?.email || "user@freightagent.com");
    const [phone, setPhone] = useState("+1 (555) 019-2834");
    const [company, setCompany] = useState("Nexus Supply Chain Logistics");
    const [location, setLocation] = useState("Chicago, Illinois, US");
    const [bio, setBio] = useState(
        "Freight and logistics specialist handling commercial cargo distribution and multi-modal shipment coordination."
    );
    const [saving, setSaving] = useState(false);

    const role = user?.role || "CUSTOMER";

    const getRoleBadge = () => {
        switch (role) {
            case "ADMIN":
                return {
                    label: "Platform Administrator",
                    style: "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30",
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

    const roleBadge = getRoleBadge();
    const BadgeIcon = roleBadge.icon;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            if (user) {
                setUser({
                    ...user,
                    name,
                });
            }
            setSaving(false);
            toast.success("Profile details updated successfully");
        }, 600);
    };

    const initials = name
        ? name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "FA";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                    Account Profile
                </h1>
                <p className="text-xs text-[#7ecfc4] mt-0.5">
                    Manage your personal information, organization credentials, and platform role.
                </p>
            </div>

            {/* Profile Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0d1f1f] via-[#0d1f1f] to-[#112a2a] border border-[#1a4a4a] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#00c9a7]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    {/* Avatar with edit button */}
                    <div className="relative group">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f] font-black text-3xl shadow-xl shadow-[#00c9a7]/20 flex-shrink-0">
                            {initials}
                        </div>
                        <button
                            onClick={() => toast.info("Avatar upload available in next release")}
                            className="absolute bottom-0 right-0 p-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-[#00c9a7] hover:border-[#00c9a7] shadow-lg transition-colors"
                            title="Change Avatar"
                        >
                            <Camera size={14} />
                        </button>
                    </div>

                    {/* User Summary Info */}
                    <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            <h2 className="text-xl sm:text-2xl font-black text-[#e0faf5] truncate">
                                {name}
                            </h2>
                            <div
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadge.style} w-fit mx-auto sm:mx-0`}
                            >
                                <BadgeIcon size={12} strokeWidth={2.5} />
                                <span>{roleBadge.label}</span>
                            </div>
                        </div>

                        <p className="text-xs text-[#7ecfc4] flex items-center justify-center sm:justify-start gap-2">
                            <Mail size={13} className="text-[#00c9a7]" />
                            <span>{email}</span>
                            <span className="w-1 h-1 rounded-full bg-[#1a4a4a]" />
                            <span className="text-[#00e5c0] flex items-center gap-1 font-semibold text-[11px]">
                                <CheckCircle2 size={12} /> Email Verified
                            </span>
                        </p>

                        <p className="text-xs text-[#7ecfc4]/80 max-w-xl line-clamp-2 pt-1">
                            {bio}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Form & Side Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Col: 2 spans */}
                <div className="lg:col-span-2">
                    <form
                        onSubmit={handleSave}
                        className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 space-y-5"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#1a4a4a]/60">
                            <h3 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                                <User size={16} className="text-[#00c9a7]" />
                                Personal & Company Details
                            </h3>
                            <span className="text-[10px] text-[#3a6b66]">
                                Keep your records up to date for manifests
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            {/* Email Address (Read-only) */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1414] border border-[#1a4a4a]/50 text-xs text-[#3a6b66] cursor-not-allowed"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                    />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Company Name */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Company / Agency
                                </label>
                                <div className="relative">
                                    <Building
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                    />
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Regional Location */}
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Headquarters / Base City
                                </label>
                                <div className="relative">
                                    <MapPin
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                    />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Bio / Operations Note */}
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-semibold text-[#7ecfc4]">
                                    Operations Bio
                                </label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-95 transition-opacity flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={15} />
                                {saving ? "Saving Changes..." : "Save Profile"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Col: Account Metadata & Security Summary */}
                <div className="space-y-6">
                    {/* Security & Verification Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] space-y-4">
                        <h4 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-2">
                            <Shield size={14} className="text-[#00c9a7]" />
                            Security & Credential Status
                        </h4>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-[#3a6b66] block">Email Verification</span>
                                    <span className="font-bold text-[#00e5c0]">Confirmed</span>
                                </div>
                                <CheckCircle2 size={18} className="text-[#00e5c0]" />
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-[#3a6b66] block">OAuth Google Linked</span>
                                    <span className="font-bold text-[#e0faf5]">Active Session</span>
                                </div>
                                <Sparkles size={16} className="text-[#00b4d8]" />
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-[#3a6b66] block">Account Access Role</span>
                                    <span className="font-bold text-[#00c9a7]">{role}</span>
                                </div>
                                <Key size={16} className="text-[#00c9a7]" />
                            </div>
                        </div>
                    </div>

                    {/* Member Since / System Stats Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] space-y-3">
                        <span className="text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider block">
                            Platform Membership
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#112a2a] border border-[#1a4a4a] flex items-center justify-center text-[#7ecfc4]">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-[#e0faf5] block">
                                    Member Since
                                </span>
                                <span className="text-[11px] text-[#7ecfc4]">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "October 2023"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
