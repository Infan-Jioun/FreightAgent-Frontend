/**
 * Payment Service
 * Typed API client layer for Stripe Payment Intent, Pricing Calculation, and Admin Refunds.
 */

import api from "../lib/api";
import { API } from "../constants/api";
import { IApiResponse } from "../types/admin.types";
import {
    CreatePaymentIntentResponse,
    IShipmentCost,
} from "../types/shipment.types";
import { AppError } from "../errorHelper/appError";

export interface ICalculatePricingParams {
    origin: string;
    destination: string;
    weightKg: number;
    declaredCargoValueUSD?: number;
}

export interface ICalculatePricingResult {
    costBreakdown: IShipmentCost;
    totalUSD: number;
    currency: string;
}

export interface IRefundPaymentResult {
    success: boolean;
    refundId: string;
    status: string;
    amountUSD: number;
}

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

