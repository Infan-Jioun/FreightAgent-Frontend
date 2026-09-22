// This needs 'use client' because: it subscribes to the Zustand client authentication store to deliver reactive, role-based permission state to interactive UI components.
"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/app/store/authStore";
import {
    UserRole,
    Permission,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    getRoleDashboard,
} from "@/app/lib/permissions";

export interface UsePermissionReturn {
    role: UserRole | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isAgent: boolean;
    isCustomer: boolean;
    can: (permission: Permission) => boolean;
    canAny: (permissions: Permission[]) => boolean;
    canAll: (permissions: Permission[]) => boolean;
    canAccess: (pathname: string) => boolean;
    dashboardPath: string;
}

export function usePermission(): UsePermissionReturn {
    const { user, isAuthenticated } = useAuthStore();
    const role: UserRole | null = (user?.role as UserRole) || null;

    const isAdmin = role === "ADMIN";
    const isAgent = role === "AGENT";
    const isCustomer = role === "CUSTOMER";

    const dashboardPath = useMemo(() => getRoleDashboard(role), [role]);

    const can = useMemo(
        () => (permission: Permission): boolean => hasPermission(role, permission),
        [role]
    );

    const canAny = useMemo(
        () => (permissions: Permission[]): boolean => hasAnyPermission(role, permissions),
        [role]
    );

    const canAll = useMemo(
        () => (permissions: Permission[]): boolean => hasAllPermissions(role, permissions),
        [role]
    );

    const canAccess = useMemo(
        () => (pathname: string): boolean => canAccessRoute(role, pathname),
        [role]
    );

    return {
        role,
        isAuthenticated,
        isAdmin,
        isAgent,
        isCustomer,
        can,
        canAny,
        canAll,
        canAccess,
        dashboardPath,
    };
}

export default usePermission;
