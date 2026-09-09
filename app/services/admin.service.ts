import api from "../lib/api";
import { API } from "../constants/api";
import {
    IAdminUser,
    ICreateUserPayload,
    UserRole,
    IApiResponse,
} from "../types/admin.types";
export * from "../types/admin.types";

export const adminService = {
    /**
     * Fetch all registered users
     */
    getAllUsers: async (): Promise<IAdminUser[]> => {
        const res = await api.get<IApiResponse<IAdminUser[]>>(API.ADMIN.GET_ALL_USERS);
        return res.data.data ?? [];
    },

    /**
     * Fetch a single user by ID
     */
    getUserById: async (id: string): Promise<IAdminUser> => {
        const res = await api.get<IApiResponse<IAdminUser>>(API.ADMIN.GET_USER_BY_ID(id));
        return res.data.data;
    },

    /**
     * Update a user's role (ADMIN, AGENT, CUSTOMER)
     */
    updateUserRole: async (
        id: string,
        role: UserRole
    ): Promise<IAdminUser> => {
        const res = await api.patch<IApiResponse<IAdminUser>>(API.ADMIN.UPDATE_ROLE(id), { role });
        return res.data.data;
    },

    /**
     * Delete a user by ID
     */
    deleteUser: async (id: string): Promise<IApiResponse<null>> => {
        const res = await api.delete<IApiResponse<null>>(API.ADMIN.DELETE_USER(id));
        return res.data;
    },

    /**
     * Create/Register an agent or user through admin portal
     */
    createUser: async (payload: ICreateUserPayload): Promise<IAdminUser> => {
        const endpoint =
            payload.role === "AGENT"
                ? API.AUTH.REGISTER_AGENT
                : API.AUTH.REGISTER;
        const res = await api.post<IApiResponse<IAdminUser>>(endpoint, payload);
        return res.data.data;
    },
};