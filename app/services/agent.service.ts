/**
 * Agent Service
 * Handles all carrier road agent operations under /api/v1/agent
 */

import api from "../lib/api";
import { API } from "../constants/api";
import {
    IAgentProfile,
    IAgentAcceptPayload,
    IAgentUpdateStatusPayload,
    IAgentShipmentsQueryParams,
    IAgentShipmentsResult,
    IAgentProfileResponse,
} from "../types/agent.types";
import { IShipment, IShipmentResponse, IShipmentsResponse } from "../types/shipment.types";
import { IPaginationMeta } from "../types/admin.types";
import { AppError } from "../errorHelper/appError";

export const agentService = {
    /**
     * Get assigned consignments for authenticated Agent
     * Endpoint: GET /api/v1/agent/assigned?page=1&limit=10&status=ASSIGNED
     */
    getAssignedShipments: async (
        params?: IAgentShipmentsQueryParams
    ): Promise<IAgentShipmentsResult> => {
        try {
            const res = await api.get<IShipmentsResponse>(API.AGENT.ASSIGNED, { params });
            const rawData = res.data?.data as unknown;
            let shipments: IShipment[] = [];
            let meta = res.data?.meta;

            if (Array.isArray(rawData)) {
                shipments = rawData;
            } else if (rawData && typeof rawData === "object") {
                const obj = rawData as { shipments?: IShipment[]; meta?: IPaginationMeta };
                if (Array.isArray(obj.shipments)) {
                    shipments = obj.shipments;
                }
                if (obj.meta) {
                    meta = obj.meta;
                }
            }

            return {
                shipments,
                meta,
            };
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Accept an assigned shipment
     * Endpoint: PATCH /api/v1/agent/shipments/:id/accept
     */
    acceptShipment: async (
        id: string,
        payload?: IAgentAcceptPayload
    ): Promise<IShipment> => {
        try {
            const res = await api.patch<IShipmentResponse>(
                API.AGENT.ACCEPT(id),
                payload || {}
            );
            const raw = res.data?.data as unknown;
            if (raw && typeof raw === "object" && "shipment" in raw && (raw as { shipment: IShipment }).shipment) {
                return (raw as { shipment: IShipment }).shipment;
            }
            return raw as IShipment;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Update transit status for assigned shipment
     * Endpoint: PATCH /api/v1/agent/shipments/:id/status
     */
    updateShipmentStatus: async (
        id: string,
        payload: IAgentUpdateStatusPayload
    ): Promise<IShipment> => {
        try {
            const res = await api.patch<IShipmentResponse>(
                API.AGENT.STATUS(id),
                payload
            );
            const raw = res.data?.data as unknown;
            if (raw && typeof raw === "object" && "shipment" in raw && (raw as { shipment: IShipment }).shipment) {
                return (raw as { shipment: IShipment }).shipment;
            }
            return raw as IShipment;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Get agent profile including active and delivered shipment counts
     * Endpoint: GET /api/v1/agent/profile
     */
    getProfile: async (): Promise<IAgentProfile> => {
        try {
            const res = await api.get<IAgentProfileResponse>(API.AGENT.PROFILE);
            const raw = res.data?.data as unknown;
            if (raw && typeof raw === "object" && "profile" in raw && (raw as { profile: IAgentProfile }).profile) {
                return (raw as { profile: IAgentProfile }).profile;
            }
            return raw as IAgentProfile;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Update agent availability status toggle
     * Endpoint: PATCH /api/v1/agent/availability
     */
    setAvailability: async (isAvailable: boolean): Promise<IAgentProfile> => {
        try {
            const res = await api.patch<IAgentProfileResponse>(API.AGENT.AVAILABILITY, {
                isAvailable,
            });
            const raw = res.data?.data as unknown;
            if (raw && typeof raw === "object" && "profile" in raw && (raw as { profile: IAgentProfile }).profile) {
                return (raw as { profile: IAgentProfile }).profile;
            }
            return raw as IAgentProfile;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    toggleAvailability: async (isAvailable: boolean): Promise<IAgentProfile> => {
        return agentService.setAvailability(isAvailable);
    },
};
