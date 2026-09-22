// This needs 'use client' because: it conditionally renders interactive UI fragments based on reactive client authentication and role-based permissions.
"use client";

import React from "react";
import { Permission, UserRole } from "@/app/lib/permissions";
import { usePermission } from "@/app/hooks/usePermission";

export interface PermissionGateProps {
    permission?: Permission;
    anyPermission?: Permission[];
    allPermissions?: Permission[];
    allowedRoles?: UserRole[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function PermissionGate({
    permission,
    anyPermission,
    allPermissions,
    allowedRoles,
    fallback = null,
    children,
}: PermissionGateProps): React.JSX.Element | null {
    const { role, can, canAny, canAll } = usePermission();

    if (!role) {
        return fallback ? <>{fallback}</> : null;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return fallback ? <>{fallback}</> : null;
    }

    if (permission && !can(permission)) {
        return fallback ? <>{fallback}</> : null;
    }

    if (anyPermission && anyPermission.length > 0 && !canAny(anyPermission)) {
        return fallback ? <>{fallback}</> : null;
    }

    if (allPermissions && allPermissions.length > 0 && !canAll(allPermissions)) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}

export default PermissionGate;
