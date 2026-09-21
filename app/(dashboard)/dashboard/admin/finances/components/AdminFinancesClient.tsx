"use client";

import { useEffect, useState, useCallback } from "react";
import {
    TrendingUp,
    RefreshCw,
    Loader2,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    Search,
    Landmark,
    ShieldCheck,
    CreditCard,
    Building2,
    Users,
    Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/app/services/payment.service";
import {
    IAdminFinancialOverview,
    IAdminRecentTransaction,
    IAdminWithdrawalAuditItem,
} from "@/app/types/payment.types";
import { AppError } from "@/app/errorHelper/appError";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/ui/status-badge";

export default function AdminFinancesClient() {
    const [overview, setOverview] = useState<IAdminFinancialOverview>({
        totalRevenueUSD: 0,
        totalPlatformFeeUSD: 0,
        totalAgencyFeeUSD: 0,
        totalWithdrawalsPaidUSD: 0,
        netPlatformBalanceUSD: 0,
    });
    const [transactions, setTransactions] = useState<IAdminRecentTransaction[]>([]);
    const [withdrawals, setWithdrawals] = useState<IAdminWithdrawalAuditItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"transactions" | "withdrawals">("transactions");
    const [searchTerm, setSearchTerm] = useState("");

    const loadFinanceData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const [statsRes, auditRes] = await Promise.all([
                paymentService.getAdminFinancialStats(),
                paymentService.getAdminWithdrawalsAudit(),
            ]);

            setOverview(statsRes.financialOverview);
            setTransactions(Array.isArray(statsRes?.recentTransactions) ? statsRes.recentTransactions : []);

            const safeWithdrawals = Array.isArray(auditRes)
                ? auditRes
                : (auditRes as unknown as { withdrawals?: IAdminWithdrawalAuditItem[] })?.withdrawals &&
                  Array.isArray((auditRes as unknown as { withdrawals: IAdminWithdrawalAuditItem[] }).withdrawals)
                ? (auditRes as unknown as { withdrawals: IAdminWithdrawalAuditItem[] }).withdrawals
                : [];
            setWithdrawals(safeWithdrawals);
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to fetch platform financial metrics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadFinanceData();
    }, [loadFinanceData]);

    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const filteredTransactions = safeTransactions.filter((tx) => {
        const query = searchTerm.toLowerCase();
        return (
            tx.trackingId?.toLowerCase().includes(query) ||
            tx.customerName?.toLowerCase().includes(query) ||
            tx.id?.toLowerCase().includes(query)
        );
    });

    const safeWithdrawals = Array.isArray(withdrawals) ? withdrawals : [];
    const filteredWithdrawals = safeWithdrawals.filter((w) => {
        const query = searchTerm.toLowerCase();
        return (
            w.voucherNumber?.toLowerCase().includes(query) ||
            w.agentName?.toLowerCase().includes(query) ||
            w.agentEmail?.toLowerCase().includes(query) ||
            w.bankInfo?.toLowerCase().includes(query)
        );
    });

    const formatSafeDate = (dateStr?: string | null) => {
        if (!dateStr) return "Recent";
        const d = new Date(dateStr);
        return isNaN(d.getTime())
            ? "Recent"
            : d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              });
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                        Corporate Treasury
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Platform Financial Analytics & Audit
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Macro platform revenue breakdown, agent commission liabilities, and global carrier payout audits.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadFinanceData(true)}
                    disabled={loading || refreshing}
                    className="p-2.5 rounded-xl border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                    title="Refresh corporate finances"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Macro Financial Overview Metric Cards (5 Cards Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. Total Revenue */}
                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#7ecfc4] uppercase tracking-wider">
                            Total Revenue
                        </span>
                        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <CreditCard size={15} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-black font-mono text-[#e0faf5]">
                            ${Number(overview?.totalRevenueUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#7ecfc4] ml-1 font-semibold">USD</span>
                    </div>
                    <span className="text-[10px] text-[#7ecfc4]/60 mt-1 block">Gross payments collected</span>
                </div>

                {/* 2. Platform Net Earnings */}
                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#00e5c0] uppercase tracking-wider">
                            Platform Net
                        </span>
                        <div className="p-2 rounded-xl bg-[#00c9a7]/20 border border-[#00c9a7]/35 text-[#00e5c0]">
                            <TrendingUp size={15} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-black font-mono text-[#00e5c0]">
                            ${Number(overview?.totalPlatformFeeUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#7ecfc4] ml-1 font-semibold">USD</span>
                    </div>
                    <span className="text-[10px] text-[#7ecfc4]/60 mt-1 block">Retained platform margins</span>
                </div>

                {/* 3. Agent Liabilities */}
                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                            Agent Liabilities
                        </span>
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                            <Users size={15} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-black font-mono text-amber-300">
                            ${Number(overview?.totalAgencyFeeUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#7ecfc4] ml-1 font-semibold">USD</span>
                    </div>
                    <span className="text-[10px] text-[#7ecfc4]/60 mt-1 block">Carrier dispatch fees</span>
                </div>

                {/* 4. Agent Payouts Paid */}
                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                            Payouts Paid
                        </span>
                        <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300">
                            <Building2 size={15} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-black font-mono text-sky-200">
                            ${Number(overview?.totalWithdrawalsPaidUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#7ecfc4] ml-1 font-semibold">USD</span>
                    </div>
                    <span className="text-[10px] text-[#7ecfc4]/60 mt-1 block">Carrier withdrawals settled</span>
                </div>

                {/* 5. Platform Treasury Balance */}
                <div className="p-4 rounded-3xl bg-linear-to-br from-[#0d1f1f] to-[#0a2e2e] border border-[#00c9a7]/50 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#00e5c0] uppercase tracking-wider">
                            Treasury Balance
                        </span>
                        <div className="p-2 rounded-xl bg-[#00c9a7]/25 border border-[#00c9a7]/50 text-[#00e5c0]">
                            <Landmark size={15} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-black font-mono text-[#00e5c0]">
                            ${Number(overview?.netPlatformBalanceUSD ?? 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#7ecfc4] ml-1 font-semibold">USD</span>
                    </div>
                    <span className="text-[10px] text-[#7ecfc4]/80 mt-1 block font-medium">Liquid treasury holding</span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
                {/* Tabs */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("transactions")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "transactions"
                                ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                                : "bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5]"
                        }`}
                    >
                        <Receipt size={14} />
                        <span>Customer Paid Transactions ({safeTransactions.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("withdrawals")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "withdrawals"
                                ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                                : "bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5]"
                        }`}
                    >
                        <ShieldCheck size={14} />
                        <span>Carrier Withdrawals Audit ({safeWithdrawals.length})</span>
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative max-w-xs w-full">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7ecfc4]/70"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={
                            activeTab === "transactions"
                                ? "Search waybill, customer..."
                                : "Search voucher, agent..."
                        }
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#7ecfc4]/50 focus:outline-hidden focus:border-[#00c9a7]"
                    />
                </div>
            </div>

            {/* Audit & Transaction Tables */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-2.5">
                        <Loader2 className="w-7 h-7 text-[#00c9a7] animate-spin" />
                        <span className="text-xs font-semibold text-[#7ecfc4]">Fetching platform ledger...</span>
                    </div>
                ) : activeTab === "transactions" ? (
                    /* TAB 1: RECENT PAID TRANSACTIONS */
                    filteredTransactions.length === 0 ? (
                        <div className="p-16 text-center">
                            <Receipt className="w-12 h-12 mx-auto text-[#7ecfc4]/40 mb-3" />
                            <h3 className="text-sm font-bold text-[#e0faf5]">No transactions found</h3>
                            <p className="text-xs text-[#7ecfc4] mt-1 max-w-sm mx-auto">
                                No recent transactions matched your current search filters.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                    <TableHead className="py-3.5 px-4">Tracking Waybill</TableHead>
                                    <TableHead className="py-3.5 px-4">Customer Shipper</TableHead>
                                    <TableHead className="py-3.5 px-4">Date</TableHead>
                                    <TableHead className="py-3.5 px-4">Amount</TableHead>
                                    <TableHead className="py-3.5 px-4">Payment Status</TableHead>
                                    <TableHead className="py-3.5 px-4 text-right">Invoice Receipt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-[#1a4a4a]/40">
                                {filteredTransactions.map((tx) => (
                                    <TableRow key={tx.id} className="hover:bg-[#112a2a]/40 transition-colors">
                                        <TableCell className="py-3.5 px-4">
                                            <span className="font-mono font-bold text-[#e0faf5] text-xs">
                                                {tx.trackingId}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs text-[#e0faf5] font-semibold">
                                            {tx.customerName || "Merchant Customer"}
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs text-[#7ecfc4]">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-[#00c9a7]" />
                                                <span>{formatSafeDate(tx.createdAt)}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs font-mono font-bold text-[#00e5c0]">
                                            ${Number(tx?.amount ?? 0).toFixed(2)} USD
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4">
                                            <PaymentStatusBadge status={tx.paymentStatus} />
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-right">
                                            {tx.invoiceUrl ? (
                                                <a
                                                    href={tx.invoiceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-all shadow-xs"
                                                    title="Download Customer Invoice PDF"
                                                >
                                                    <Download size={12} />
                                                    <span>Receipt PDF</span>
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-[#7ecfc4]/50">Generated via Stripe</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                ) : (
                    /* TAB 2: GLOBAL CARRIER WITHDRAWALS AUDIT */
                    filteredWithdrawals.length === 0 ? (
                        <div className="p-16 text-center">
                            <ShieldCheck className="w-12 h-12 mx-auto text-[#7ecfc4]/40 mb-3" />
                            <h3 className="text-sm font-bold text-[#e0faf5]">No withdrawal audits found</h3>
                            <p className="text-xs text-[#7ecfc4] mt-1 max-w-sm mx-auto">
                                No carrier fund withdrawals match the specified criteria.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                    <TableHead className="py-3.5 px-4">Voucher Number</TableHead>
                                    <TableHead className="py-3.5 px-4">Carrier Agent</TableHead>
                                    <TableHead className="py-3.5 px-4">Date</TableHead>
                                    <TableHead className="py-3.5 px-4">Amount</TableHead>
                                    <TableHead className="py-3.5 px-4">Payout Account</TableHead>
                                    <TableHead className="py-3.5 px-4">Status</TableHead>
                                    <TableHead className="py-3.5 px-4 text-right">Official Slip</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-[#1a4a4a]/40">
                                {filteredWithdrawals.map((w) => (
                                    <TableRow key={w.id} className="hover:bg-[#112a2a]/40 transition-colors">
                                        <TableCell className="py-3.5 px-4">
                                            <span className="font-mono font-bold text-[#00e5c0] text-xs bg-[#0a1a1a] px-2.5 py-1 rounded-lg border border-[#1a4a4a]">
                                                {w.voucherNumber}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col text-xs min-w-0">
                                                <span className="font-bold text-[#e0faf5] truncate">
                                                    {w.agentName || "Carrier Agent"}
                                                </span>
                                                {w.agentEmail && (
                                                    <span className="text-[11px] text-[#7ecfc4]/70 truncate font-mono">
                                                        {w.agentEmail}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-xs text-[#7ecfc4]">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-[#00c9a7]" />
                                                <span>{formatSafeDate(w.createdAt)}</span>
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
                                                    title="Download Agent Withdrawal Slip PDF"
                                                >
                                                    <Download size={12} />
                                                    <span>Slip PDF</span>
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-[#7ecfc4]/50">Recorded</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                )}
            </div>
        </div>
    );
}
