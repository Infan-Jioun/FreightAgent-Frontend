/**
 * Payment & Financial Domain Contracts
 * Typed interfaces for post-payment verification, agent commission earnings,
 * fund withdrawals with PDF slips, and administrative financial analytics.
 */

import { PaymentStatus, IShipment } from "./shipment.types";

export interface IVerifyPaymentStatusPayload {
    shipmentId: string;
}

export interface IVerifyPaymentStatusResult {
    paymentStatus: PaymentStatus;
    invoiceUrl?: string;
    paidAt?: string;
    shipment?: IShipment;
}

// ─── Agent Earnings & Wallet Contracts ──────────────────────────────────────────

export interface IAgentEarningsSummary {
    totalEarnedUSD: number;
    totalWithdrawnUSD: number;
    availableBalanceUSD: number;
    pendingBalanceUSD?: number;
}

export interface IAgentEarningItem {
    id: string;
    shipmentId: string;
    trackingId: string;
    origin?: string;
    destination?: string;
    weight?: number;
    agencyFeeUSD: number;
    totalCostUSD: number;
    paymentStatus: string;
    paidAt?: string;
    createdAt: string;
}

export interface IAgentEarningsResponse {
    summary: IAgentEarningsSummary;
    earnings: IAgentEarningItem[];
}

export interface IAgentWithdrawPayload {
    amount: number;
    bankInfo: string;
    note?: string;
}

export interface IAgentWithdrawalItem {
    id: string;
    voucherNumber: string;
    amount: number;
    status: string;
    bankInfo: string;
    note?: string;
    receiptUrl?: string;
    createdAt: string;
}

export interface IAgentWithdrawResult {
    receiptUrl?: string;
    withdrawal: IAgentWithdrawalItem;
    remainingBalance: number;
}

// ─── Admin Financial Analytics & Audit Contracts ───────────────────────────────

export interface IAdminFinancialOverview {
    totalRevenueUSD: number;
    totalPlatformFeeUSD: number;
    totalAgencyFeeUSD: number;
    totalWithdrawalsPaidUSD: number;
    netPlatformBalanceUSD: number;
}

export interface IAdminRecentTransaction {
    id: string;
    shipmentId?: string;
    trackingId: string;
    customerName?: string;
    amount: number;
    paymentStatus: string;
    invoiceUrl?: string;
    createdAt: string;
}

export interface IAdminFinanceStatsResponse {
    financialOverview: IAdminFinancialOverview;
    recentTransactions: IAdminRecentTransaction[];
}

export interface IAdminWithdrawalAuditItem {
    id: string;
    voucherNumber: string;
    agentId: string;
    agentName?: string;
    agentEmail?: string;
    amount: number;
    status: string;
    bankInfo: string;
    note?: string;
    receiptUrl?: string;
    createdAt: string;
}
