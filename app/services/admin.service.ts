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
};