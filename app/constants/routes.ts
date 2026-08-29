
export const ROUTES = {
    // Auth
    LOGIN: "/login",
    REGISTER: "/register",
    REGISTER_AGENT: "/register-agent",
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    // Dashboard
    DASHBOARD: "/dashboard",
    SHIPMENTS: "/shipments",
    SHIPMENT_CREATE: "/shipments/create",
    SHIPMENT_DETAIL: (id: string) => `/shipments/${id}`,
    TRACKING: (trackingId: string) => `/tracking/${trackingId}`,
    PROFILE: "/profile",
    SETTINGS: "/settings",

    // Admin
    ADMIN_USERS: "/admin/users",
    ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
    ADMIN_SHIPMENTS: "/admin/shipments",
} as const;