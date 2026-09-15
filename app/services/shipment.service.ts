/**
 * Shipment Service
 * Production API communication layer for all logistics & consignment operations.
 */

import api from "../lib/api";
import { API } from "../constants/api";
import {
    IShipment,
    ICreateShipmentPayload,
    IUpdateShipmentStatusPayload,
    IShipmentQueryParams,
    IShipmentsResult,
    IShipmentResponse,
    IShipmentsResponse,
} from "../types/shipment.types";
import { IApiResponse, IPaginationMeta } from "../types/admin.types";
import { AppError } from "../errorHelper/appError";

export * from "../types/shipment.types";

export const shipmentService = {
    /**
     * Create a new consignment / shipment (Admin, Customer, Agent)
     * Backend rate limit: 20 requests per hour
     */
    /**
     * Create a new consignment / shipment (Admin, Customer, Agent)
     * Backend rate limit: 20 requests per hour
     */
    createShipment: async (payload: ICreateShipmentPayload): Promise<IShipment> => {
        try {
            const res = await api.post<IShipmentResponse>(API.SHIPMENT.CREATE, payload);
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
     * Get all shipments across the network with optional status & search filter (Admin, Agent)
     * Backend rate limit: 30 requests per minute
     */
    getAllShipments: async (params?: IShipmentQueryParams): Promise<IShipmentsResult> => {
        try {
            const res = await api.get<IShipmentsResponse>(API.SHIPMENT.GET_ALL, {
                params: {
                    ...params,
                    searchTerm: params?.search || params?.searchTerm,
                },
            });
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
     * Get consignments booked by the authenticated user (Customer, Agent, Admin)
     * Backend rate limit: 30 requests per minute
     */
    getMyShipments: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<IShipmentsResult> => {
        try {
            const res = await api.get<IShipmentsResponse>(API.SHIPMENT.GET_MY, { params });
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
     * Get assigned consignments for authenticated Agent
     * Backend rate limit: 30 requests per minute
     */
    getAssignedShipments: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<IShipmentsResult> => {
        try {
            const res = await api.get<IShipmentsResponse>(API.SHIPMENT.GET_ASSIGNED, { params });
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
     * Get detailed consignment data by ID
     * Backend rate limit: 30 requests per minute
     */
    getShipmentById: async (id: string): Promise<IShipment> => {
        try {
            const res = await api.get<IShipmentResponse>(API.SHIPMENT.GET_BY_ID(id));
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
     * Public / authenticated shipment tracking by tracking code
     * Backend rate limit: 30 requests per minute
     */
    trackShipment: async (trackingId: string): Promise<IShipment> => {
        try {
            const res = await api.get<IShipmentResponse>(API.SHIPMENT.TRACK(encodeURIComponent(trackingId.trim())), {
                skipAuthRedirect: true,
            });
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
     * Update transit status and append status milestone log (Admin, Agent)
     * Backend rate limit: 20 requests per minute
     */
    updateStatus: async (
        id: string,
        payload: IUpdateShipmentStatusPayload
    ): Promise<IShipment> => {
        try {
            const res = await api.patch<IShipmentResponse>(
                API.SHIPMENT.UPDATE_STATUS(id),
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
     * Delete shipment (Admin only)
     * Backend rate limit: 5 requests per hour
     */
    deleteShipment: async (id: string): Promise<void> => {
        try {
            await api.delete<IApiResponse<null>>(API.SHIPMENT.DELETE(id));
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },
};
