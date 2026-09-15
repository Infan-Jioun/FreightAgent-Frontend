/**
 * Agent Domain Types & API Contracts
 * Defines entities, payloads, and state models for Carrier Road Agents.
 */

import { IShipment, ShipmentStatus } from "./shipment.types";
import { IPaginationMeta, IApiResponse } from "./admin.types";

export interface IAgentProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    assignedArea?: string | null;
    isAvailable: boolean;
    activeShipmentsCount: number;
    deliveredShipmentsCount: number;
    totalShipmentsCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type AgentAllowedStatus = "ACCEPTED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";

export interface IAgentAcceptPayload {
    location?: string;
    note?: string;
}

export interface IAgentUpdateStatusPayload {
    status: AgentAllowedStatus;
    location: string;
    note?: string;
}

export interface IAgentAvailabilityPayload {
    isAvailable: boolean;
}

export interface IAgentShipmentsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ShipmentStatus | "ALL";
}

export interface IAgentShipmentsResult {
    shipments: IShipment[];
    meta?: IPaginationMeta;
}

export type IAgentProfileResponse = IApiResponse<IAgentProfile>;
