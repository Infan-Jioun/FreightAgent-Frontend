/**
 * Shipment Domain Types & API Contracts
 * Defines entities, payloads, and query structures for the Freight & Shipment module.
 */

import { IPaginationMeta, IApiResponse } from "./admin.types";

export type ShipmentStatus =
    | "PENDING"
    | "ASSIGNED"
    | "ACCEPTED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "AT_CUSTOMS"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED";

export interface IShipmentCost {
    id?: string;
    shipmentId?: string;
    originHandling: number;
    oceanFreight: number;
    bafSurcharge: number;
    thcOrigin: number;
    thcDestination: number;
    transshipmentFee: number;
    customsClearance: number;
    customsDuty: number;
    vat: number;
    destinationHandling: number;
    cargoInsurance: number;
    lastMileDelivery: number;
    agencyFee: number;
    platformFee: number;
    totalCost: number;
    currency: string;
    exchangeRate?: number;
    convertedTotal?: number;
}

export interface CreatePaymentIntentResponse {
    clientSecret: string | null;
    paymentIntentId: string;
    amountUSD: number;
    amountInCents: number;
    status: string;
}

export interface IRoadAgent {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    assignedArea?: string | null;
    isAvailable?: boolean;
    activeShipmentsCount?: number;
}

export interface IAdminAssignee {
    id: string;
    name: string;
    email: string;
}

export interface IStatusLogUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface IStatusLog {
    id: string;
    shipmentId?: string;
    status: ShipmentStatus;
    location: string;
    note?: string | null;
    updateBy?: string | null;
    updatedByUser?: IStatusLogUser | null;
    createdAt: string;
}

export interface IShipmentSender {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
}

export interface IShipment {
    id: string;
    trackingId: string;
    userId: string;
    origin: string;
    destination: string;
    weight: number;
    description?: string | null;
    status: ShipmentStatus;
    paymentStatus?: PaymentStatus;
    stripePaymentIntentId?: string | null;
    stripeRefundId?: string | null;
    paidAt?: string | null;
    invoiceUrl?: string | null;
    cost?: IShipmentCost | null;
    declaredCargoValue?: number;
    estimatedDate?: string | null;
    assignedAgentId?: string | null;
    assignedAgent?: IRoadAgent | null;
    assignedById?: string | null;
    assignedBy?: IAdminAssignee | null;
    createdAt: string;
    updatedAt: string;
    statusLogs?: IStatusLog[];
    user?: IShipmentSender;
}

export interface IAssignAgentPayload {
    agentId: string;
    note?: string;
}

export interface ICreateShipmentPayload {
    origin: string;
    destination: string;
    weight: number;
    description?: string;
    estimatedDate?: string;
}

export interface IUpdateShipmentStatusPayload {
    status: ShipmentStatus;
    location: string;
    note?: string;
}

export interface IShipmentQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    searchTerm?: string;
    status?: ShipmentStatus | "ALL";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IShipmentsResult {
    shipments: IShipment[];
    meta?: IPaginationMeta;
}

export type IShipmentResponse = IApiResponse<IShipment>;
export type IShipmentsResponse = IApiResponse<IShipment[]>;
