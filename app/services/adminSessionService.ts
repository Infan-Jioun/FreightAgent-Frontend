import api from "../lib/api";
import { API } from "../constants/api";
import {
    IUserSessionData,
    IUserSession,
    IDeviceBreakdown,
    ApiResponse,
} from "../types/session.types";
import { AppError } from "../errorHelper/appError";

/**
 * Computes breakdown by device type if not provided directly by API
 */
export function computeDeviceBreakdown(sessions: IUserSession[]): IDeviceBreakdown {
    const breakdown: IDeviceBreakdown = {
        total: sessions.length,
        mobile: 0,
        tablet: 0,
        desktop: 0,
    };

    sessions.forEach((s) => {
        const type = (s.deviceType || "").toLowerCase();
        if (type === "mobile") {
            breakdown.mobile += 1;
        } else if (type === "tablet") {
            breakdown.tablet += 1;
        } else {
            breakdown.desktop += 1;
        }
    });

    return breakdown;
}

/**
 * Typed Admin Session API Client
 * Connects with /admin/users/:userId/sessions endpoints with full auth cookies & bearer token support.
 */
export const adminSessionService = {
    /**
     * 1. Get all active sessions & device breakdown for target user
     */
    getUserSessions: async (userId: string): Promise<IUserSessionData> => {
        if (!userId) {
            throw new Error("User ID is required to fetch sessions");
        }

        try {
            const response = await api.get<ApiResponse<IUserSessionData | IUserSession[]>>(
                API.ADMIN.GET_USER_SESSIONS(userId)
            );

            const raw = response.data?.data;
            if (!raw) {
                return {
                    sessions: [],
                    breakdown: { total: 0, mobile: 0, tablet: 0, desktop: 0 },
                };
            }

            // Case A: Full UserSessionData object with user, sessions, breakdown
            if ("sessions" in raw && Array.isArray((raw as IUserSessionData).sessions)) {
                const typedData = raw as IUserSessionData;
                return {
                    user: typedData.user,
                    sessions: typedData.sessions,
                    breakdown: typedData.breakdown || computeDeviceBreakdown(typedData.sessions),
                };
            }

            // Case B: Array of sessions directly returned
            if (Array.isArray(raw)) {
                const sessions = raw as IUserSession[];
                return {
                    sessions,
                    breakdown: computeDeviceBreakdown(sessions),
                };
            }

            return {
                sessions: [],
                breakdown: { total: 0, mobile: 0, tablet: 0, desktop: 0 },
            };
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    /**
     * 2. Revoke a single specific session
     */
    revokeSession: async (userId: string, sessionId: string): Promise<void> => {
        if (!userId || !sessionId) {
            throw new Error("Both userId and sessionId are required to revoke a session");
        }

        try {
            await api.delete<ApiResponse<null>>(
                API.ADMIN.REVOKE_USER_SESSION(userId, sessionId)
            );
        } catch (err: unknown) {
            // Also try fallback endpoint if admin endpoint varies
            try {
                await api.delete<ApiResponse<null>>(API.USER.DELETE_SESSION(sessionId));
            } catch {
                throw AppError.fromAxios(err);
            }
        }
    },

    /**
     * 3. Force logout target user from all devices
     */
    revokeAllSessions: async (userId: string): Promise<void> => {
        if (!userId) {
            throw new Error("User ID is required to revoke all sessions");
        }

        try {
            await api.delete<ApiResponse<null>>(
                API.ADMIN.REVOKE_ALL_USER_SESSIONS(userId)
            );
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },
};

export default adminSessionService;
