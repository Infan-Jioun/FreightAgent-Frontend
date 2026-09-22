/**
 * Payment Service
 * Typed API client layer for Stripe Payment Intent, Pricing Calculation, and Admin Refunds.
 */

import api from "../lib/api";
import { API } from "../constants/api";
import { IApiResponse } from "../types/admin.types";
import {
    IShipmentCost,
} from "../types/shipment.types";
import {
    CreatePaymentIntentResponse,
    IVerifyPaymentStatusResult,
    IAgentEarningsResponse,
    IAgentWithdrawPayload,
    IAgentWithdrawResult,
    IAgentWithdrawalItem,
    IAdminFinanceStatsResponse,
    IAdminWithdrawalAuditItem,
    IAdminRecentTransaction,
    IAdminFinancialOverview,
    IAgentEarningsSummary,
    IAgentEarningItem,
    ICalculatePricingParams,
    ICalculatePricingResult,
    IRefundPaymentResult,
} from "../types/payment.types";
import { AppError } from "../errorHelper/appError";

export type {
    ICalculatePricingParams,
    ICalculatePricingResult,
    IRefundPaymentResult,
};

export const paymentService = {
    /**
     * Create or retrieve Stripe PaymentIntent for a consignment
     * Endpoint: POST /api/v1/payment/create-intent
     */
    createPaymentIntent: async (
        shipmentId: string,
        currency = "USD"
    ): Promise<CreatePaymentIntentResponse> => {
        try {
            const res = await api.post<IApiResponse<CreatePaymentIntentResponse>>(
                API.PAYMENT.CREATE_INTENT,
                { shipmentId, currency }
            );
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Verify payment status immediately after Stripe Elements client-side confirmation
     * Endpoint: POST /api/v1/payment/verify-status
     */
    verifyPaymentStatus: async (
        shipmentId: string
    ): Promise<IVerifyPaymentStatusResult> => {
        try {
            const res = await api.post<IApiResponse<IVerifyPaymentStatusResult>>(
                API.PAYMENT.VERIFY_STATUS,
                { shipmentId }
            );
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Calculate comprehensive shipping & logistics pricing
     * Endpoint: POST /api/v1/payment/calculate-pricing
     */
    calculatePricing: async (
        params: ICalculatePricingParams
    ): Promise<ICalculatePricingResult> => {
        try {
            const res = await api.post<IApiResponse<ICalculatePricingResult>>(
                API.PAYMENT.CALCULATE_PRICING,
                params
            );
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Issue full or partial Stripe refund for a paid consignment (Admin only)
     * Endpoint: POST /api/v1/payment/refund
     */
    refundPayment: async (
        shipmentId: string,
        reason: string
    ): Promise<IRefundPaymentResult> => {
        try {
            const res = await api.post<IApiResponse<IRefundPaymentResult>>(
                API.PAYMENT.REFUND,
                { shipmentId, reason }
            );
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Fetch agent wallet balance, total earned, and commission earnings breakdown
     * Endpoint: GET /api/v1/payment/agent/earnings
     */
    getAgentEarnings: async (): Promise<IAgentEarningsResponse> => {
        try {
            const res = await api.get<IApiResponse<unknown>>(
                API.PAYMENT.AGENT_EARNINGS
            );
            const raw = (res.data?.data || res.data) as Record<string, unknown> | undefined;
            const summaryObj = (raw?.summary || raw) as Record<string, unknown> | undefined;

            const summary: IAgentEarningsSummary = {
                totalEarnedUSD: Number(summaryObj?.totalEarnedUSD ?? 0),
                totalWithdrawnUSD: Number(summaryObj?.totalWithdrawnUSD ?? 0),
                availableBalanceUSD: Number(summaryObj?.availableBalanceUSD ?? 0),
                pendingBalanceUSD: Number(summaryObj?.pendingBalanceUSD ?? 0),
            };

            const earnings = Array.isArray(raw?.earnings)
                ? (raw.earnings as IAgentEarningItem[])
                : Array.isArray(raw?.data)
                ? (raw.data as IAgentEarningItem[])
                : Array.isArray(raw)
                ? (raw as unknown as IAgentEarningItem[])
                : [];

            return {
                summary,
                earnings,
            };
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Submit agent fund withdrawal request
     * Endpoint: POST /api/v1/payment/agent/withdraw
     */
    withdrawAgentFunds: async (
        payload: IAgentWithdrawPayload
    ): Promise<IAgentWithdrawResult> => {
        try {
            const res = await api.post<IApiResponse<IAgentWithdrawResult>>(
                API.PAYMENT.AGENT_WITHDRAW,
                payload
            );
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Fetch agent withdrawal history with voucher numbers and slip download links
     * Endpoint: GET /api/v1/payment/agent/withdrawals
     */
    getAgentWithdrawals: async (): Promise<IAgentWithdrawalItem[]> => {
        try {
            const res = await api.get<IApiResponse<unknown>>(
                API.PAYMENT.AGENT_WITHDRAWALS
            );
            const raw = (res.data?.data || res.data) as Record<string, unknown> | unknown[] | undefined;
            if (Array.isArray(raw)) {
                return raw as IAgentWithdrawalItem[];
            }
            if (raw && typeof raw === "object") {
                if ("withdrawals" in raw && Array.isArray((raw as { withdrawals: unknown }).withdrawals)) {
                    return (raw as { withdrawals: IAgentWithdrawalItem[] }).withdrawals;
                }
                if ("data" in raw && Array.isArray((raw as { data: unknown }).data)) {
                    return (raw as { data: IAgentWithdrawalItem[] }).data;
                }
            }
            return [];
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Fetch admin macro financial statistics & recent transactions
     * Endpoint: GET /api/v1/payment/admin/stats
     */
    getAdminFinancialStats: async (): Promise<IAdminFinanceStatsResponse> => {
        try {
            const res = await api.get<IApiResponse<unknown>>(
                API.PAYMENT.ADMIN_STATS
            );
            const raw = (res.data?.data || res.data) as Record<string, unknown> | undefined;
            const overviewObj = (raw?.financialOverview || raw?.overview || raw) as Record<string, unknown> | undefined;

            const financialOverview: IAdminFinancialOverview = {
                totalRevenueUSD: Number(overviewObj?.totalRevenueUSD ?? 0),
                totalPlatformFeeUSD: Number(overviewObj?.totalPlatformFeeUSD ?? 0),
                totalAgencyFeeUSD: Number(overviewObj?.totalAgencyFeeUSD ?? 0),
                totalWithdrawalsPaidUSD: Number(overviewObj?.totalWithdrawalsPaidUSD ?? 0),
                netPlatformBalanceUSD: Number(overviewObj?.netPlatformBalanceUSD ?? 0),
            };

            const rawTransactions = Array.isArray(raw?.recentTransactions)
                ? (raw.recentTransactions as Record<string, unknown>[])
                : Array.isArray(raw?.transactions)
                ? (raw.transactions as Record<string, unknown>[])
                : Array.isArray(raw?.data)
                ? (raw.data as Record<string, unknown>[])
                : [];

            const recentTransactions: IAdminRecentTransaction[] = rawTransactions.map((tx) => {
                const rawCost = tx?.cost as Record<string, unknown> | undefined;
                const rawAmt = tx?.amount ?? tx?.totalCost ?? rawCost?.totalCost ?? tx?.totalAmount ?? tx?.amountUSD ?? 0;
                const numAmt = typeof rawAmt === "number" ? rawAmt : parseFloat(String(rawAmt)) || 0;
                const rawUser = tx?.user as Record<string, unknown> | undefined;
                const rawCustomer = tx?.customer as Record<string, unknown> | undefined;
                return {
                    id: String(tx.id || tx._id || tx.shipmentId || Math.random()),
                    shipmentId: tx.shipmentId ? String(tx.shipmentId) : undefined,
                    trackingId: String(tx.trackingId || tx.trackingNumber || "N/A"),
                    customerName: (tx.customerName || rawCustomer?.name || rawUser?.name || tx.userName || "Merchant Customer") as string,
                    amount: isNaN(numAmt) ? 0 : numAmt,
                    paymentStatus: String(tx.paymentStatus || tx.status || "PAID"),
                    invoiceUrl: (tx.invoiceUrl || tx.receiptUrl) as string | undefined,
                    createdAt: String(tx.createdAt || tx.paidAt || new Date().toISOString()),
                };
            });

            return {
                financialOverview,
                recentTransactions,
            };
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Fetch all agent withdrawals audit ledger for platform administrators
     * Endpoint: GET /api/v1/payment/admin/withdrawals
     */
    getAdminWithdrawalsAudit: async (): Promise<IAdminWithdrawalAuditItem[]> => {
        try {
            const res = await api.get<IApiResponse<unknown>>(
                API.PAYMENT.ADMIN_WITHDRAWALS
            );
            const raw = (res.data?.data || res.data) as Record<string, unknown> | unknown[] | undefined;
            const rawObj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : undefined;
            const rawAuditList: Record<string, unknown>[] = Array.isArray(raw)
                ? (raw as Record<string, unknown>[])
                : Array.isArray(rawObj?.withdrawals)
                ? (rawObj.withdrawals as Record<string, unknown>[])
                : Array.isArray(rawObj?.data)
                ? (rawObj.data as Record<string, unknown>[])
                : [];

            const withdrawals: IAdminWithdrawalAuditItem[] = rawAuditList.map((w) => {
                const rawAmt = w?.amount ?? w?.amountUSD ?? 0;
                const numAmt = typeof rawAmt === "number" ? rawAmt : parseFloat(String(rawAmt)) || 0;
                const rawAgent = w?.agent as Record<string, unknown> | undefined;
                const rawUser = w?.user as Record<string, unknown> | undefined;
                return {
                    id: String(w.id || w._id || Math.random()),
                    voucherNumber: String(w.voucherNumber || w.voucherNo || "N/A"),
                    agentId: String(w.agentId || w.userId || ""),
                    agentName: (w.agentName || rawAgent?.name || rawUser?.name || "Carrier Agent") as string,
                    agentEmail: (w.agentEmail || rawAgent?.email || rawUser?.email) as string | undefined,
                    amount: isNaN(numAmt) ? 0 : numAmt,
                    status: String(w.status || "COMPLETED"),
                    bankInfo: String(w.bankInfo || w.bankDetails || w.accountInfo || ""),
                    note: w.note ? String(w.note) : undefined,
                    receiptUrl: (w.receiptUrl || w.slipUrl || w.voucherUrl) as string | undefined,
                    createdAt: String(w.createdAt || new Date().toISOString()),
                };
            });

            return withdrawals;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },
};

/**
 * Quick price calculator helper
 */
export const getFreightQuote = async (
    originCode: string,
    destCode: string,
    weightKg: number,
    cargoValueUSD = 0
) => {
    return paymentService.calculatePricing({
        origin: originCode,
        destination: destCode,
        weightKg,
        declaredCargoValueUSD: cargoValueUSD,
    });
};

