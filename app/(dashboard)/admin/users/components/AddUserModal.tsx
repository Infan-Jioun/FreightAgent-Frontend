"use client";

import React, { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ICreateUserPayload, UserRole } from "@/app/types/admin.types";
import { Modal } from "@/components/ui/Modal";

interface AddUserModalProps {
    isOpen: boolean;
    creating?: boolean;
    onClose: () => void;
    onSubmit: (form: ICreateUserPayload) => void;
}

export default function AddUserModal({
    isOpen,
    creating = false,
    onClose,
    onSubmit,
}: AddUserModalProps): React.JSX.Element | null {
    const [form, setForm] = useState<ICreateUserPayload>({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
        phone: "",
    });

    if (!isOpen) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            toast.error("Name and Email are required");
            return;
        }

        onSubmit({
            ...form,
            password: form.password || "TempPass123!@",
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="md"
            icon={<UserPlus size={20} />}
            title="Add User or Agent"
            description="Register a new account via Admin Portal"
        >
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
                <div>
                    <label className="text-[11px] font-bold text-[#7ecfc4] block mb-1">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7]"
                    />
                </div>

                <div>
                    <label className="text-[11px] font-bold text-[#7ecfc4] block mb-1">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="sarah@freightagent.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7]"
                    />
                </div>

                <div>
                    <label className="text-[11px] font-bold text-[#7ecfc4] block mb-1">
                        Phone Number (optional)
                    </label>
                    <input
                        type="tel"
                        value={form.phone || ""}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7]"
                    />
                </div>

                <div>
                    <label className="text-[11px] font-bold text-[#7ecfc4] block mb-1">
                        Initial Password (optional)
                    </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Defaults to TempPass123!@"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7]"
                    />
                </div>

                <div>
                    <label className="text-[11px] font-bold text-[#7ecfc4] block mb-1">Role *</label>
                    <select
                        value={form.role}
                        onChange={(e) =>
                            setForm({ ...form, role: e.target.value as UserRole })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] cursor-pointer"
                    >
                        <option value="CUSTOMER">Customer (Shipper)</option>
                        <option value="AGENT">Freight Agent (Carrier)</option>
                        <option value="ADMIN">Platform Administrator</option>
                    </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1a4a4a]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-[#1a4a4a] text-xs font-semibold text-[#7ecfc4] hover:bg-[#112a2a] transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={creating}
                        className="px-4 py-2 rounded-xl bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-[#00c9a7]/20 cursor-pointer"
                    >
                        {creating ? (
                            <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={14} />
                                <span>Create Account</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
