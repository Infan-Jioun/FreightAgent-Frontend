
export const API = {
    // Auth
    AUTH: {
        REGISTER: "/auth/register",
        REGISTER_CUSTOMER: "/auth/register",
        CREATE_AGENT: "/auth/create-agent",
        REGISTER_AGENT: "/auth/create-agent",
        GOOGLE_AGENT: "/auth/google/agent",
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        VERIFY_OTP: "/auth/verify-otp",
        SEND_OTP: "/auth/send-otp",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        REFRESH_TOKEN: "/auth/refresh-token",
        ME: "/auth/me",
        GET_ME: "/auth/me",
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
        GET_ASSIGNED: "/shipment/agent/assigned",
        GET_BY_ID: (id: string) => `/shipment/${id}`,
        TRACK: (trackingId: string) => `/shipment/track/${trackingId}`,
        UPDATE_STATUS: (id: string) => `/shipment/${id}/status`,
        DELETE: (id: string) => `/shipment/${id}`,
    },

    // Agent
    AGENT: {
        ASSIGNED: "/agent/assigned",
        ASSIGNED_SHIPMENTS: "/agent/assigned",
        ACCEPT: (id: string) => `/agent/shipments/${id}/accept`,
        ACCEPT_SHIPMENT: (id: string) => `/agent/shipments/${id}/accept`,
        STATUS: (id: string) => `/agent/shipments/${id}/status`,
        UPDATE_STATUS: (id: string) => `/agent/shipments/${id}/status`,
        PROFILE: "/agent/profile",
        AVAILABILITY: "/agent/availability",
    },

    // Admin
    ADMIN: {
        GET_ALL_USERS: "/admin/users",
        GET_USER_BY_ID: (id: string) => `/admin/users/${id}`,
        UPDATE_ROLE: (id: string) => `/admin/users/${id}/role`,
        UPDATE_STATUS: (id: string) => `/admin/users/${id}/status`,
        DELETE_USER: (id: string) => `/admin/users/${id}`,
        GET_AGENTS: "/admin/agents",
        ASSIGN_SHIPMENT: (id: string) => `/admin/shipments/${id}/assign`,
    },

    // Payment
    PAYMENT: {
        CREATE_INTENT: "/payment/create-intent",
        CALCULATE_PRICING: "/payment/calculate-pricing",
        REFUND: "/payment/refund",
    },
} as const;