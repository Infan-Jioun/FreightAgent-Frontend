import api from "../lib/api";
import { API } from "../constants/api";
import { IApiResponse } from "../types/auth.types";
import { getErrorMessage } from "../errorHelper/appError";
import {
    IUserProfile,
    IUpdateProfilePayload,
    IRequestPhonePayload,
    IVerifyPhonePayload,
    ISessionsData,
} from "../types/user.types";

export const userService = {
    getMe: async (): Promise<IUserProfile> => {
        try {
            const res = await api.get<IApiResponse<IUserProfile>>(API.USER.ME);
            if (!res.data.data) {
                throw new Error(res.data.message || "Failed to fetch user profile");
            }
            return res.data.data;
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, "Failed to fetch user profile"));
        }
    },

    updateProfile: async (
        payload: IUpdateProfilePayload,
        imageFile?: File
    ): Promise<IUserProfile> => {
        try {
            if (imageFile) {
                const formData = new FormData();
                if (payload.name?.trim()) {
                    formData.append("name", payload.name.trim());
                }
                if (payload.address?.trim() && payload.address.trim().length >= 3) {
                    formData.append("address", payload.address.trim());
                }
                formData.append("image", imageFile);

                // Note: Do not set explicit "Content-Type": "multipart/form-data" header.
                // Axios and the browser will automatically compute the correct boundary parameter.
                const res = await api.patch<IApiResponse<IUserProfile>>(
                    API.USER.UPDATE_PROFILE,
                    formData
                );
                if (!res.data.data) {
                    throw new Error(res.data.message || "Failed to update profile");
                }
                return res.data.data;
            }

            // Omit empty fields so backend Zod .optional() passes without length errors
            const cleanBody: Record<string, unknown> = {};
            if (payload.name?.trim()) {
                cleanBody.name = payload.name.trim();
            }
            if (payload.address?.trim() && payload.address.trim().length >= 3) {
                cleanBody.address = payload.address.trim();
            }

            const res = await api.patch<IApiResponse<IUserProfile>>(
                API.USER.UPDATE_PROFILE,
                cleanBody
            );
            if (!res.data.data) {
                throw new Error(res.data.message || "Failed to update profile");
            }
            return res.data.data;
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, "Failed to update profile"));
        }
    },

    uploadAvatar: async (file: File): Promise<{ image: string }> => {
        try {
            const formData = new FormData();
            formData.append("image", file);

            // Note: Do not set explicit "Content-Type": "multipart/form-data" header.
            // Axios and the browser will automatically compute the correct boundary parameter.
            const res = await api.post<IApiResponse<{ image: string }>>(
                API.USER.UPLOAD_AVATAR,
                formData
            );
            if (!res.data.data) {
                throw new Error(res.data.message || "Failed to upload avatar");
            }
            return res.data.data;
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, "Failed to upload avatar"));
        }
    },

    requestPhoneVerification: async (
        payload: IRequestPhonePayload
    ): Promise<{ message: string }> => {
        try {
            const res = await api.post<IApiResponse<null>>(
                API.USER.REQUEST_PHONE_VERIFICATION,
                { phone: payload.phone.trim() }
            );
            return { message: res.data.message || "Verification code sent to your email" };
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, "Failed to send phone verification code"));
        }
    },

    verifyPhone: async (
        payload: IVerifyPhonePayload
    ): Promise<IUserProfile> => {
        try {
            const res = await api.post<IApiResponse<IUserProfile>>(
                API.USER.VERIFY_PHONE,
                {
                    phone: payload.phone.trim(),
                    code: payload.code.trim(),
                }
            );
            if (!res.data.data) {
                throw new Error(res.data.message || "Failed to verify phone number");
            }
            return res.data.data;
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, "Failed to verify phone number"));
        }
    },

    getActiveSessions: async (): Promise<ISessionsData> => {
        try {
            const res = await api.get<IApiResponse<ISessionsData>>(
                API.USER.ACTIVE_SESSIONS
            );
            return res.data.data || {
                sessions: [],
                breakdown: { total: 0, mobile: 0, tablet: 0, desktop: 0 },
            };
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, "Failed to load active sessions"));
        }
    },

    revokeSession: async (sessionId: string): Promise<{ message: string }> => {
        try {
            const res = await api.delete<IApiResponse<null>>(
                API.USER.DELETE_SESSION(sessionId)
            );
            return { message: res.data.message || "Session revoked successfully" };
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, "Failed to revoke session"));
        }
    },
};
