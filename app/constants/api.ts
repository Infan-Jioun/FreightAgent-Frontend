
export const API = {
    // Auth
    AUTH: {
        REGISTER: "/auth/register",
        REGISTER_AGENT: "/auth/create-agent",
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        VERIFY_OTP: "/auth/verify-otp",
        SEND_OTP: "/auth/send-otp",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        REFRESH_TOKEN: "/auth/refresh-token",
        ME: "/auth/me",
        CHANGE_PASSWORD_OTP: "/auth/change-password/send-otp",
        CHANGE_PASSWORD: "/auth/change-password",
    },
    USER: {
        ME: "/user/me",
        UPDATE_PROFILE: "/user/profile",
        UPLOAD_AVATAR: "/user/avatar",
        REQUEST_PHONE_VERIFICATION: "/user/phone/request",
        VERIFY_PHONE: "/user/phone/verify",
        ACTIVE_SESSIONS: "/user/sessions",
        DELETE_SESSION: (id: string) => `/user/sessions/${id}`,
    },
    // Shipment
    SHIPMENT: {
        CREATE: "/shipment",
        GET_ALL: "/shipment",
        GET_MY: "/shipment/my",
        GET_BY_ID: (id: string) => `/shipment/${id}`,
        TRACK: (trackingId: string) => `/shipment/track/${trackingId}`,
        UPDATE_STATUS: (id: string) => `/shipment/${id}/status`,
        DELETE: (id: string) => `/shipment/${id}`,
    },

    // Admin
    ADMIN: {
        GET_ALL_USERS: "/admin/users",
        GET_USER_BY_ID: (id: string) => `/admin/users/${id}`,
        UPDATE_ROLE: (id: string) => `/admin/users/${id}/role`,
        DELETE_USER: (id: string) => `/admin/users/${id}`,
    },
} as const;