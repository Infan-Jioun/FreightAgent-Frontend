/**
 * FreightAgent — Role-Based Access Control (RBAC) & Permissions Engine
 * Domain Layer: Defines system-wide role contracts, action-level permissions, and route policies.
 */

export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER";

export type Permission =
    // User & Agent Directory Management
    | "users:create"
    | "users:read"
    | "users:update"
    | "users:delete"
    | "users:suspend"
    | "users:change_role"
    // Consignment & Shipment Operations
    | "shipments:create"
    | "shipments:read_all"
    | "shipments:read_assigned"
    | "shipments:read_own"
    | "shipments:update_status"
    | "shipments:assign_agent"
    | "shipments:accept"
    | "shipments:delete"
    // Settlement, Billing & Payouts
    | "payments:checkout"
    | "payments:refund"
    | "payments:withdraw"
    | "payments:view_commissions"
    // Infrastructure & Port/Hub Logistics
    | "locations:create"
    | "locations:update"
    | "locations:block"
    | "locations:delete"
    // Telemetry & Metrics
    | "analytics:platform"
    | "analytics:agent"
    | "analytics:customer";

/**
 * Strict role-to-permission mapping table.
 * ADMIN has complete operational authority over platform resources.
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
    ADMIN: [
        "users:create",
        "users:read",
        "users:update",
        "users:delete",
        "users:suspend",
        "users:change_role",
        "shipments:create",
        "shipments:read_all",
        "shipments:read_assigned",
        "shipments:read_own",
        "shipments:update_status",
        "shipments:assign_agent",
        "shipments:accept",
        "shipments:delete",
        "payments:checkout",
        "payments:refund",
        "payments:withdraw",
        "payments:view_commissions",
        "locations:create",
        "locations:update",
        "locations:block",
        "locations:delete",
        "analytics:platform",
        "analytics:agent",
        "analytics:customer",
    ],
    AGENT: [
        "shipments:read_assigned",
        "shipments:accept",
        "shipments:update_status",
        "payments:withdraw",
        "payments:view_commissions",
        "analytics:agent",
    ],
    CUSTOMER: [
        "shipments:create",
        "shipments:read_own",
        "payments:checkout",
        "analytics:customer",
    ],
};

/**
 * Checks whether a specific role holds the requested permission.
 */
export function hasPermission(
    role: UserRole | null | undefined,
    permission: Permission
): boolean {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.includes(permission);
}

/**
 * Checks whether a role holds at least one of the provided permissions.
 */
export function hasAnyPermission(
    role: UserRole | null | undefined,
    permissions: Permission[]
): boolean {
    if (!role || permissions.length === 0) return false;
    return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Checks whether a role holds every one of the provided permissions.
 */
export function hasAllPermissions(
    role: UserRole | null | undefined,
    permissions: Permission[]
): boolean {
    if (!role || permissions.length === 0) return false;
    return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Returns the designated landing dashboard path for a given role.
 */
export function getRoleDashboard(role: UserRole | null | undefined): string {
    if (role === "ADMIN") return "/dashboard/admin";
    if (role === "AGENT") return "/dashboard/agent";
    return "/dashboard/customer";
}

/**
 * Enforces route authorization boundaries per role.
 * Edge Runtime safe (zero node-only or external library imports).
 */
export function canAccessRoute(
    role: UserRole | null | undefined,
    pathname: string
): boolean {
    if (!role) return false;

    if (role === "ADMIN") {
        return true;
    }

    if (role === "AGENT") {
        if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) {
            return false;
        }
        return true;
    }

    if (role === "CUSTOMER") {
        if (
            pathname.startsWith("/dashboard/admin") ||
            pathname.startsWith("/admin") ||
            pathname.startsWith("/dashboard/agent")
        ) {
            return false;
        }
        return true;
    }

    return false;
}
