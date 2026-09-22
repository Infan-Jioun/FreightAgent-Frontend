/**
 * Payment & Financial Domain Contracts
 * Re-exports canonical types from central interface.ts.
 */

export type {
    PaymentStatus,
    IShipment,
    IVerifyPaymentStatusPayload,
    IVerifyPaymentStatusResult,
    IAgentEarningsSummary,
    IAgentEarningItem,
    IAgentEarningsResponse,
    IAgentWithdrawPayload,
    IAgentWithdrawalItem,
    IAgentWithdrawResult,
    IAdminFinancialOverview,
    IAdminRecentTransaction,
    IAdminFinanceStatsResponse,
    IAdminWithdrawalAuditItem,
    ICalculatePricingParams,
    ICalculatePricingResult,
    IRefundPaymentResult,
} from "./interface";

/** Shape returned by POST /api/v1/payment/create-intent */
export interface CreatePaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amountUSD: number;
    currency: string;
}

