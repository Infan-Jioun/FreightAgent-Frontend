// This needs 'use client' because: it manages carrier wallet balance views, commission tabs, and interactive withdrawal requests with RBAC gating.
"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    DollarSign,
    RefreshCw,
    Loader2,
    Calendar,
    FileText,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
} from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/app/services/payment.service";
import {
    IAgentEarningsSummary,
    IAgentEarningItem,
    IAgentWithdrawalItem,
} from "@/app/types/payment.types";
import { AppError } from "@/app/errorHelper/appError";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WithdrawModal } from "./components/WithdrawModal";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function AgentEarningsPage() {
    const [summary, setSummary] = useState<IAgentEarningsSummary>({
        totalEarnedUSD: 0,
        totalWithdrawnUSD: 0,
        availableBalanceUSD: 0,
    });
    const [earningsList, setEarningsList] = useState<IAgentEarningItem[]>([]);
    const [withdrawalsList, setWithdrawalsList] = useState<IAgentWithdrawalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"commissions" | "withdrawals">("commissions");
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const loadWalletData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const [earningsRes, withdrawalsRes] = await Promise.all([
                paymentService.getAgentEarnings(),
                paymentService.getAgentWithdrawals(),
            ]);

            setSummary(
                earningsRes?.summary || {
                    totalEarnedUSD: 0,
                    totalWithdrawnUSD: 0,
                    availableBalanceUSD: 0,
                }
            );
            setEarningsList(Array.isArray(earningsRes?.earnings) ? earningsRes.earnings : []);
            setWithdrawalsList(Array.isArray(withdrawalsRes) ? withdrawalsRes : []);
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to load wallet and earnings data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadWalletData();
    }, [loadWalletData]);

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                        Financial Operations
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Carrier Earnings & Wallet
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Track dispatch commissions, monitor carrier settlement balances, and request funds withdrawal.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => loadWalletData(true)}
                        disabled={loading || refreshing}
                        className="p-2.5 rounded-xl border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                        title="Refresh wallet balances"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <PermissionGate permission="payments:withdraw">
                        <button
                            type="button"
                            onClick={() => setIsWithdrawModalOpen(true)}
                            disabled={summary.availableBalanceUSD <= 0}
                            className="px-4 py-2.5 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-xs font-black text-[#0a0f0f] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00c9a7]/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ArrowUpRight size={15} />
                            <span>Withdraw Funds</span>
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Total Earned */}
                <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7ecfc4] uppercase tracking-wider">
                            Total Earned
                        </span>
                        <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl sm:text-3xl font-black font-mono text-[#e0faf5] tracking-tight">
                            ${Number(summary?.totalEarnedUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-[#7ecfc4] ml-1.5 font-semibold">USD</span>
                    </div>
                    <p className="text-[11px] text-[#7ecfc4]/70 mt-1">
                        Cumulative lifetime commission from delivered shipments.
                    </p>
                </div>

                {/* 2. Total Withdrawn */}
                <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7ecfc4] uppercase tracking-wider">
                            Total Withdrawn
                        </span>
                        <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                            <Building2 size={18} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl sm:text-3xl font-black font-mono text-[#e0faf5] tracking-tight">
                            ${Number(summary?.totalWithdrawnUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-[#7ecfc4] ml-1.5 font-semibold">USD</span>
                    </div>
                    <p className="text-[11px] text-[#7ecfc4]/70 mt-1">
                        Total payouts disbursed to your verified bank accounts.
                    </p>
                </div>

                {/* 3. Available Balance */}
                <div className="p-5 rounded-3xl bg-linear-to-br from-[#0d1f1f] to-[#072424] border border-[#00c9a7]/40 shadow-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#00e5c0] uppercase tracking-wider">
                            Available Balance
                        </span>
                        <div className="p-2.5 rounded-2xl bg-[#00c9a7]/20 border border-[#00c9a7]/40 text-[#00e5c0]">
                            <Wallet size={18} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl sm:text-3xl font-black font-mono text-[#00e5c0] tracking-tight">
                            ${Number(summary?.availableBalanceUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-[#7ecfc4] ml-1.5 font-semibold">USD</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-[#7ecfc4]/80">Ready for instant payout</span>
                        <button
                            type="button"
                            onClick={() => setIsWithdrawModalOpen(true)}
                            disabled={summary.availableBalanceUSD <= 0}
                            className="text-[11px] font-bold text-[#00e5c0] hover:underline cursor-pointer disabled:opacity-40 disabled:no-underline"
                        >
                            Withdraw Now →
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#1a4a4a] pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("commissions")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === "commissions"
                            ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                            : "bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5]"
                    }`}
                >
                    <DollarSign size={14} />
                    <span>Paid Consignments & Commissions ({earningsList.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("withdrawals")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === "withdrawals"
                            ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                            : "bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5]"
                    }`}
                >
                    <FileText size={14} />
                    <span>Withdrawal History & Vouchers ({withdrawalsList.length})</span>
                </button>
            </div>

            {/* Content Table Views */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-2.5">
                        <Loader2 className="w-7 h-7 text-[#00c9a7] animate-spin" />
                        <span className="text-xs font-semibold text-[#7ecfc4]">Loading financial records...</span>
                    </div>
                ) : activeTab === "commissions" ? (
                    /* TAB 1: PAID CONSIGNMENTS & COMMISSION BREAKDOWN */
                    earningsList.length === 0 ? (
                        <div className="p-16 text-center">
                            <DollarSign className="w-12 h-12 mx-auto text-[#7ecfc4]/40 mb-3" />
                            <h3 className="text-sm font-bold text-[#e0faf5]">No paid shipments recorded</h3>
                            <p className="text-xs text-[#7ecfc4] mt-1 max-w-sm mx-auto">
                                When customers pay for consignments assigned to your terminal, your commission breakdown will appear here.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                    <TableHead className="py-3.5 px-4">Waybill Tracking</TableHead>
                                    <TableHead className="py-3.5 px-4">Route Corridor</TableHead>
                                    <TableHead className="py-3.5 px-4">Paid Date</TableHead>
                                    <TableHead className="py-3.5 px-4">Consignment Total</TableHead>
                                    <TableHead className="py-3.5 px-4 text-right">Commission Earned</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-[#1a4a4a]/40">
                                {earningsList.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-[#112a2a]/40 transition-colors">
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-mono font-bold text-[#e0faf5] text-xs">
                                                    {item.trackingId}
                                                </span>
                                                {item.weight && (
                                                    <span className="text-[11px] text-[#7ecfc4]/70">
                                                        {item.weight} kg cargo
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 text-xs text-[#e0faf5] font-semibold">
                                                <span>{item.origin || "Origin"}</span>
                                                <span className="text-[#00c9a7]">→</span>
                                                <span>{item.destination || "Destination"}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs text-[#7ecfc4]">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-[#00c9a7]" />
                                                <span>
                                                    {item.paidAt
                                                        ? new Date(item.paidAt).toLocaleDateString("en-US", {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })
                                                        : new Date(item.createdAt).toLocaleDateString("en-US", {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs font-mono font-semibold text-[#e0faf5]">
                                            ${Number(item?.totalCostUSD ?? (item as unknown as { totalCost?: number })?.totalCost ?? 0).toFixed(2)} USD
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-right">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-xs">
                                                +${Number(item?.agencyFeeUSD ?? (item as unknown as { agencyFee?: number })?.agencyFee ?? 0).toFixed(2)} USD
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                ) : (
                    /* TAB 2: WITHDRAWAL HISTORY & VOUCHERS */
                    withdrawalsList.length === 0 ? (
                        <div className="p-16 text-center">
                            <FileText className="w-12 h-12 mx-auto text-[#7ecfc4]/40 mb-3" />
                            <h3 className="text-sm font-bold text-[#e0faf5]">No withdrawal records found</h3>
                            <p className="text-xs text-[#7ecfc4] mt-1 max-w-sm mx-auto mb-4">
                                You haven't requested any payouts yet. When you withdraw available funds, your PDF vouchers will be saved here.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsWithdrawModalOpen(true)}
                                disabled={summary.availableBalanceUSD <= 0}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-bold hover:bg-[#00e5c0] transition-colors disabled:opacity-40"
                            >
                                <ArrowUpRight size={14} />
                                <span>Request Withdrawal</span>
                            </button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                    <TableHead className="py-3.5 px-4">Voucher Number</TableHead>
                                    <TableHead className="py-3.5 px-4">Date</TableHead>
                                    <TableHead className="py-3.5 px-4">Amount</TableHead>
                                    <TableHead className="py-3.5 px-4">Payout Account</TableHead>
                                    <TableHead className="py-3.5 px-4">Status</TableHead>
                                    <TableHead className="py-3.5 px-4 text-right">Official Slip</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-[#1a4a4a]/40">
                                {withdrawalsList.map((w) => (
                                    <TableRow key={w.id} className="hover:bg-[#112a2a]/40 transition-colors">
                                        <TableCell className="py-3.5 px-4">
                                            <span className="font-mono font-bold text-[#00e5c0] text-xs bg-[#0a1a1a] px-2.5 py-1 rounded-lg border border-[#1a4a4a]">
                                                {w.voucherNumber}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs text-[#7ecfc4]">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-[#00c9a7]" />
                                                <span>
                                                    {new Date(w.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs font-mono font-bold text-[#e0faf5]">
                                            ${Number(w?.amount ?? 0).toFixed(2)} USD
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col max-w-[200px] text-xs">
                                                <span className="text-[#e0faf5] font-medium truncate" title={w.bankInfo}>
                                                    {w.bankInfo}
                                                </span>
                                                {w.note && (
                                                    <span className="text-[10px] text-[#7ecfc4]/60 truncate" title={w.note}>
                                                        {w.note}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    w.status === "COMPLETED" || w.status === "PAID"
                                                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                                }`}
                                            >
                                                {w.status === "COMPLETED" || w.status === "PAID" ? (
                                                    <CheckCircle2 size={10} />
                                                ) : (
                                                    <Clock size={10} />
                                                )}
                                                <span>{w.status}</span>
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-right">
                                            {w.receiptUrl ? (
                                                <a
                                                    href={w.receiptUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-all shadow-xs"
                                                    title="Download Official Voucher Slip PDF"
                                                >
                                                    <Download size={12} />
                                                    <span>Download Slip</span>
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-[#7ecfc4]/50">Slip Generated</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                )}
            </div>

            {/* Fund Withdrawal Modal */}
            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                availableBalanceUSD={summary.availableBalanceUSD}
                onClose={() => setIsWithdrawModalOpen(false)}
                onSuccess={() => {
                    void loadWalletData(true);
                }}
            />
        </div>
    );
}
