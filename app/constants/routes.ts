
export const ROUTES = {
    // Public & Marketing
    HOME: "/",
    ABOUT: "/about",
    SERVICES: "/services",
    QUOTE: "/quote",
    CONTACT: "/contact",

    // Auth
    LOGIN: "/login",
    REGISTER: "/register",
    REGISTER_AGENT: "/register-agent",
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    // Dashboard Root
    DASHBOARD: "/dashboard",

    // Customer Portal Routes
    DASHBOARD_CUSTOMER: "/dashboard/customer",
    DASHBOARD_CUSTOMER_SHIPMENTS: "/dashboard/customer/shipments",
    DASHBOARD_CUSTOMER_SHIPMENTS_NEW: "/dashboard/customer/shipments/new",
    DASHBOARD_CUSTOMER_TRACKING: "/dashboard/customer/tracking",

    // Agent Portal Routes
    DASHBOARD_AGENT: "/dashboard/agent",
    DASHBOARD_AGENT_SHIPMENTS: "/dashboard/agent/shipments",
    DASHBOARD_AGENT_SHIPMENT_DETAIL: (id: string) => `/dashboard/agent/shipments/${id}`,
    DASHBOARD_AGENT_EARNINGS: "/dashboard/agent/earnings",

    // Admin Portal Routes
    DASHBOARD_ADMIN: "/dashboard/admin",
    DASHBOARD_ADMIN_SHIPMENTS: "/dashboard/admin/shipments",
    DASHBOARD_ADMIN_USERS: "/dashboard/admin/users",
    DASHBOARD_ADMIN_LOCATIONS: "/dashboard/admin/locations",
    DASHBOARD_ADMIN_FINANCES: "/dashboard/admin/finances",

    // General Dashboard / Account
    SHIPMENTS: "/dashboard/customer/shipments",
    SHIPMENT_CREATE: "/dashboard/customer/shipments/new",
    SHIPMENT_DETAIL: (id: string) => `/dashboard/agent/shipments/${id}`,
    TRACKING: (trackingId: string) => `/dashboard/customer/tracking?trackingId=${encodeURIComponent(trackingId)}`,
    PROFILE: "/profile",
    SETTINGS: "/settings",
    NOTIFICATIONS: "/dashboard/notifications",
    NOTIFICATION_DETAIL: (id: string) => `/dashboard/notifications/${id}`,
    CHAT: "/dashboard/chat",

    // Admin Legacy Aliases
    ADMIN_USERS: "/dashboard/admin/users",
    ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
    ADMIN_SHIPMENTS: "/dashboard/admin/shipments",
} as const;