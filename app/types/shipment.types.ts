/**
 * Shipment Domain Types & API Contracts
 * Defines entities, payloads, and query structures for the Freight & Shipment module.
 */

import { IApiResponse, IPaginationMeta, IShipment, ShipmentStatus } from "./interface";

export type {
    IPaginationMeta,
    IApiResponse,
    ShipmentStatus,
    PaymentStatus,
    IShipmentCost,
    IRoadAgent,
    IAdminAssignee,
    IStatusLogUser,
    IStatusLog,
    IShipmentSender,
    IShipment,
    IResolvedAgentInfo,
} from "./interface";

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
