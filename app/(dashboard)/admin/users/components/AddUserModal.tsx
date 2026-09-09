"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ICreateUserPayload, UserRole } from "@/app/types/admin.types";

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
}: AddUserModalProps) {
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
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] p-6 shadow-2xl shadow-black relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        title="Close modal"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0]">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#e0faf5]">Add User or Agent</h3>
                            <p className="text-xs text-[#7ecfc4]">Register a new account via Admin Portal</p>
                        </div>
                    </div>

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
                                className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
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
                                className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
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
                                className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-[#7ecfc4] block mb-1">Role *</label>
                            <select
                                value={form.role}
                                onChange={(e) =>
                                    setForm({ ...form, role: e.target.value as any })
                                }
                                className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] cursor-pointer"
                            >
                                <option value="CUSTOMER">Customer (Shipper)</option>
                                <option value="AGENT">Freigeht Agent (Carrier)</option>
                                <option value="ADMIN">Platform Administrator</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3">
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
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-[#00c9a7]/20 cursor-pointer"
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
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
