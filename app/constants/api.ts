
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
        CHECK_PHONE: "/auth/check-phone",
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
        GET_USER_SESSIONS: (id: string) => `/admin/users/${id}/sessions`,
        REVOKE_USER_SESSION: (userId: string, sessionId: string) =>
            `/admin/users/${userId}/sessions/${sessionId}`,
        REVOKE_ALL_USER_SESSIONS: (userId: string) => `/admin/users/${userId}/sessions`,
    },
    // Location
 
    LOCATION: {
        SEARCH: "/locations/search",
        GET_BY_CODE: (code: string) => `/locations/code/${code}`,
        GET_BY_ID: (id: string) => `/locations/${id}`,
        GET_ALL: "/locations",
        CREATE: "/locations",
        UPDATE: (id: string) => `/locations/${id}`,
        BLOCK: (id: string) => `/locations/${id}/block`,
        UNBLOCK: (id: string) => `/locations/${id}/unblock`,
        DELETE: (id: string) => `/locations/${id}`,
        RESTORE: (id: string) => `/locations/${id}/restore`,
    },
    // Payment
    PAYMENT: {
        CREATE_INTENT: "/payment/create-intent",
        CALCULATE_PRICING: "/payment/calculate-pricing",
        REFUND: "/payment/refund",
        VERIFY_STATUS: "/payment/verify-status",
        AGENT_EARNINGS: "/payment/agent/earnings",
        AGENT_WITHDRAW: "/payment/agent/withdraw",
        AGENT_WITHDRAWALS: "/payment/agent/withdrawals",
        ADMIN_STATS: "/payment/admin/stats",
        ADMIN_WITHDRAWALS: "/payment/admin/withdrawals",
    },
} as const;