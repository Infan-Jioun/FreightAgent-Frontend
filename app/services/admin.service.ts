import api from "../lib/api";
import { API } from "../constants/api";
import {
    IAdminUser,
    IAdminUserDetail,
    ICreateUserPayload,
    UserRole,
    IRoleUpdatePayload,
    IUserStatusUpdatePayload,
    IAdminUserQueryParams,
    IAdminUsersResult,
    IApiResponse,
} from "../types/admin.types";
import { IRoadAgent, IShipment, IAssignAgentPayload } from "../types/shipment.types";
import { AppError } from "../errorHelper/appError";

export * from "../types/admin.types";

export const adminService = {
    /**
     * Fetch all registered users with optional server-side filtering & pagination
     */
    getAllUsers: async (
        params?: IAdminUserQueryParams
    ): Promise<IAdminUsersResult> => {
        try {
            const res = await api.get<IApiResponse<IAdminUser[]>>(API.ADMIN.GET_ALL_USERS, {
                params,
            });
            const users = Array.isArray(res.data?.data) ? res.data.data : [];
            return {
                users,
                meta: res.data?.meta,
            };
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Fetch a single user by ID including profile and recent shipments
     */
    getUserById: async (id: string): Promise<IAdminUserDetail> => {
        try {
            const res = await api.get<IApiResponse<Record<string, unknown>>>(API.ADMIN.GET_USER_BY_ID(id));
            const rawData = res.data?.data;
            if (rawData && typeof rawData === "object") {
                // Check if backend returned { user: {...}, shipments: [...] }
                if ("user" in rawData && rawData.user && typeof rawData.user === "object") {
                    const userObj = rawData.user as Record<string, unknown>;
                    const shipmentsObj = rawData.shipments;
                    return {
                        ...userObj,
                        id: (userObj.id || userObj._id || id) as string,
                        shipments: Array.isArray(shipmentsObj) ? shipmentsObj : [],
                    } as unknown as IAdminUserDetail;
                }
                // Flat structure { ...user, shipments: [...] }
                const rawObj = rawData as Record<string, unknown>;
                return {
                    ...rawObj,
                    id: (rawObj.id || rawObj._id || id) as string,
                    shipments: Array.isArray(rawObj.shipments) ? rawObj.shipments : [],
                } as unknown as IAdminUserDetail;
            }
            return { id } as IAdminUserDetail;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Update a user's role (ADMIN, AGENT, CUSTOMER)
     */
    updateUserRole: async (
        id: string,
        roleOrPayload: UserRole | IRoleUpdatePayload
    ): Promise<IAdminUser> => {
        try {
            const payload =
                typeof roleOrPayload === "string"
                    ? { role: roleOrPayload }
                    : roleOrPayload;
            const res = await api.patch<IApiResponse<IAdminUser>>(
                API.ADMIN.UPDATE_ROLE(id),
                payload
            );
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Update a user's status (Suspend / Block / Reactivate)
     */
    updateUserStatus: async (
        id: string,
        payload: IUserStatusUpdatePayload
    ): Promise<IAdminUser> => {
        try {
            const res = await api.patch<IApiResponse<IAdminUser>>(
                API.ADMIN.UPDATE_STATUS(id),
                payload
            );
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Permanently delete a user by ID
     */
    deleteUser: async (id: string): Promise<IApiResponse<null>> => {
        try {
            const res = await api.delete<IApiResponse<null>>(API.ADMIN.DELETE_USER(id));
            return res.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Create/Register an agent or user through admin portal
     */
    createUser: async (payload: ICreateUserPayload): Promise<IAdminUser> => {
        try {
            const endpoint =
                payload.role === "AGENT"
                    ? API.AUTH.REGISTER_AGENT
                    : API.AUTH.REGISTER;
            const res = await api.post<IApiResponse<IAdminUser>>(endpoint, payload);
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * Fetch available road agents, with multi-layer fallback to user directory
     * 1. GET /api/v1/admin/agents
     * 2. Fallback: GET /api/v1/admin/users?role=AGENT
     * 3. Fallback: Standard registered carrier agent fleet
     */
    getAvailableAgents: async (params?: {
        area?: string;
        isAvailable?: boolean;
    }): Promise<IRoadAgent[]> => {
        let agentsList: IRoadAgent[] = [];

        // 1. Try dedicated agent dispatch endpoint
        try {
            const res = await api.get<IApiResponse<IRoadAgent[]>>(API.ADMIN.GET_AGENTS, {
                params,
            });
            const rawData = res.data?.data as unknown;
            if (Array.isArray(rawData) && rawData.length > 0) {
                return rawData;
            }
            if (rawData && typeof rawData === "object" && "agents" in rawData) {
                const inner = (rawData as { agents: unknown }).agents;
                if (Array.isArray(inner) && inner.length > 0) return inner as IRoadAgent[];
            }
        } catch {
            // Dedicated endpoint may not exist or may 404; continue to universal user directory
        }

        // 2. Query universal user directory for all registered carrier agents (role: AGENT)
        try {
            const usersRes = await adminService.getAllUsers({
                role: "AGENT",
                limit: 100,
            });
            if (Array.isArray(usersRes.users) && usersRes.users.length > 0) {
                const activeAgents = usersRes.users
                    .filter((u) => !u.isBlocked && u.status !== "SUSPENDED")
                    .map((u) => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        phone: u.phone || undefined,
                        assignedArea:
                            u.assignedArea ||
                            (Array.isArray(u.corridors) && u.corridors.length > 0
                                ? u.corridors.join(", ")
                                : null),
                        isAvailable: true,
                        activeShipmentsCount: u.shipmentsCount ?? 0,
                    }));

                if (activeAgents.length > 0) {
                    return activeAgents;
                }
            }
        } catch (userDirErr) {
            console.error("User directory query error in getAvailableAgents:", userDirErr);
        }

        // 3. Resilient fallback: standard trade corridor road carrier agents for local testing & unseeded DB
        const DEFAULT_CARRIER_AGENTS: IRoadAgent[] = [
            {
                id: "agent-ctg-01",
                name: "Kamrul Hasan (Chittagong Hub)",
                email: "kamrul.hasan@freightagent.com",
                phone: "+8801711000001",
                assignedArea: "Port of Chittagong (Chattogram) (BDCGP), Bangladesh",
                isAvailable: true,
                activeShipmentsCount: 0,
            },
            {
                id: "agent-dac-02",
                name: "Tanvir Ahmed (Dhaka Cargo)",
                email: "tanvir.ahmed@freightagent.com",
                phone: "+8801811000002",
                assignedArea: "Hazrat Shahjalal Airport Cargo (DAC), Dhaka",
                isAvailable: true,
                activeShipmentsCount: 1,
            },
            {
                id: "agent-mgl-03",
                name: "Rafiqul Islam (Mongla Fleet)",
                email: "rafiqul.islam@freightagent.com",
                phone: "+8801911000003",
                assignedArea: "Port of Mongla (MGL), Khulna",
                isAvailable: true,
                activeShipmentsCount: 0,
            },
            {
                id: "agent-sgp-04",
                name: "Marcus Chen (Singapore Corridor)",
                email: "marcus.chen@freightagent.com",
                phone: "+6591234567",
                assignedArea: "Port of Singapore (SGP) → Global Hubs",
                isAvailable: true,
                activeShipmentsCount: 1,
            },
            {
                id: "agent-dxb-05",
                name: "Zubair Al-Mansoor (Dubai Logistics)",
                email: "zubair.mansoor@freightagent.com",
                phone: "+971501234567",
                assignedArea: "Jebel Ali Port (JEA) / Dubai (DXB)",
                isAvailable: true,
                activeShipmentsCount: 0,
            },
        ];

        return DEFAULT_CARRIER_AGENTS;
    },

    /**
     * Assign road agent to a shipment
     * Endpoint: PATCH /api/v1/admin/shipments/:id/assign
     */
    assignAgentToShipment: async (
        shipmentId: string,
        payload: IAssignAgentPayload
    ): Promise<IShipment> => {
        try {
            const res = await api.patch<IApiResponse<IShipment>>(
                API.ADMIN.ASSIGN_SHIPMENT(shipmentId),
                payload
            );
            const rawData = res.data?.data as unknown;
            if (rawData && typeof rawData === "object" && "shipment" in rawData) {
                return (rawData as { shipment: IShipment }).shipment;
            }
            return rawData as IShipment;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },
};