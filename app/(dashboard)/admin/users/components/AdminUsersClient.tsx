"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { adminService } from "@/app/services/admin.service";
import {
    IAdminUser,
    ICreateUserPayload,
    UserRole,
    IPaginationMeta,
} from "@/app/types/admin.types";
import { getErrorMessage } from "@/app/errorHelper/appError";
import UsersStatsCards from "./UsersStatsCards";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";
import UpdateRoleModal from "./UpdateRoleModal";
import SuspendUserModal from "./SuspendUserModal";
import DeleteUserModal from "./DeleteUserModal";
import UserDetailsModal from "./UserDetailsModal";
import AddUserModal from "./AddUserModal";

// Centralized Reusable UI Components
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaButton } from "@/components/ui/CtaButton";

interface AdminUsersClientProps {
    initialUsers?: IAdminUser[];
}

export default function AdminUsersClient({ initialUsers = [] }: AdminUsersClientProps) {
    const { user: currentAdmin } = useAuthStore();

    // ── Data & Loading State ────────────────────────────────────────────
    const [usersList, setUsersList] = useState<IAdminUser[]>(initialUsers);
    const [paginationMeta, setPaginationMeta] = useState<IPaginationMeta | null>(null);
    const [loadingUsers, setLoadingUsers] = useState(initialUsers.length === 0);
    const [refreshing, setRefreshing] = useState(false);

    // ── Filters & Search State ──────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modals & Action Target States ───────────────────────────────────
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<IAdminUser | null>(null);

    const [editingUserForRole, setEditingUserForRole] = useState<IAdminUser | null>(null);
    const [updatingRole, setUpdatingRole] = useState(false);

    const [targetUserForStatus, setTargetUserForStatus] = useState<IAdminUser | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [deletingUser, setDeletingUser] = useState<IAdminUser | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);

    // ── Fetch Users ─────────────────────────────────────────────────────
    const fetchUsers = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoadingUsers(true);
        }

        try {
            const res = await adminService.getAllUsers({
                page: currentPage,
                limit: pageSize,
                search: searchQuery.trim() || undefined,
                role: roleFilter === "ALL" ? undefined : roleFilter,
                status: statusFilter === "ALL" ? undefined : statusFilter,
            });

            setUsersList(res.users);
            if (res.meta) {
                setPaginationMeta(res.meta);
            }
            if (isRefresh) {
                toast.success("User directory refreshed");
            }
        } catch (err: unknown) {
            const msg = getErrorMessage(err, "Failed to load user directory");
            toast.error(msg);
        } finally {
            setLoadingUsers(false);
            setRefreshing(false);
        }
    }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ── Role Update Mutation ────────────────────────────────────────────
    const handleSaveRole = async (newRole: UserRole, assignedArea?: string) => {
        if (!editingUserForRole?.id) return;

        if (editingUserForRole.id === currentAdmin?.id) {
            toast.error("You cannot modify your own administrative role.");
            setEditingUserForRole(null);
            return;
        }

        setUpdatingRole(true);
        try {
            const updatedUser = await adminService.updateUserRole(
                editingUserForRole.id,
                { role: newRole, assignedArea }
            );

            setUsersList((prev) =>
                prev.map((u) =>
                    u.id === updatedUser.id
                        ? { ...u, role: updatedUser.role, assignedArea: assignedArea || u.assignedArea }
                        : u
                )
            );

            if (selectedUserForDetails?.id === updatedUser.id) {
                setSelectedUserForDetails((prev) =>
                    prev
                        ? { ...prev, role: updatedUser.role, assignedArea: assignedArea || prev.assignedArea }
                        : prev
                );
            }

            toast.success(
                assignedArea
                    ? `Role updated to ${newRole} (Area: ${assignedArea}) for ${editingUserForRole.name}`
                    : `Role updated to ${newRole} for ${editingUserForRole.name}`
            );
            setEditingUserForRole(null);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to update user role"));
        } finally {
            setUpdatingRole(false);
        }
    };

    // ── Status Update Mutation (Suspend / Reactivate) ───────────────────
    const handleSaveStatus = async ({
        isBlocked,
        reason,
    }: {
        isBlocked: boolean;
        reason?: string;
    }) => {
        if (!targetUserForStatus?.id) return;

        if (targetUserForStatus.id === currentAdmin?.id) {
            toast.error("You cannot suspend your own Administrator account.");
            setTargetUserForStatus(null);
            return;
        }

        setUpdatingStatus(true);
        try {
            const updatedUser = await adminService.updateUserStatus(targetUserForStatus.id, {
                isBlocked,
                status: isBlocked ? "SUSPENDED" : "ACTIVE",
                reason,
                blockedReason: reason,
            });

            setUsersList((prev) =>
                prev.map((u) =>
                    u.id === targetUserForStatus.id
                        ? {
                              ...u,
                              isBlocked,
                              status: isBlocked ? "SUSPENDED" : "ACTIVE",
                              blockedReason: isBlocked ? reason || null : null,
                              blockedAt: isBlocked ? new Date().toISOString() : null,
                          }
                        : u
                )
            );

            if (selectedUserForDetails?.id === targetUserForStatus.id) {
                setSelectedUserForDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              isBlocked,
                              status: isBlocked ? "SUSPENDED" : "ACTIVE",
                              blockedReason: isBlocked ? reason || null : null,
                              blockedAt: isBlocked ? new Date().toISOString() : null,
                          }
                        : prev
                );
            }

            toast.success(
                isBlocked
                    ? `${targetUserForStatus.name} has been suspended.`
                    : `${targetUserForStatus.name} has been reactivated.`
            );
            setTargetUserForStatus(null);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to update account status"));
        } finally {
            setUpdatingStatus(false);
        }
    };

    // ── Delete User Mutation ────────────────────────────────────────────
    const handleDeleteUser = async () => {
        if (!deletingUser?.id) return;

        if (deletingUser.id === currentAdmin?.id) {
            toast.error("You cannot delete your own Administrator account.");
            setDeletingUser(null);
            return;
        }

        setDeleting(true);
        try {
            await adminService.deleteUser(deletingUser.id);

            setUsersList((prev) => prev.filter((u) => u.id !== deletingUser.id));

            if (selectedUserForDetails?.id === deletingUser.id) {
                setSelectedUserForDetails(null);
            }

            toast.success(`${deletingUser.name} deleted successfully`);
            setDeletingUser(null);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to delete user"));
        } finally {
            setDeleting(false);
        }
    };

    // ── Create User / Agent ─────────────────────────────────────────────
    const handleCreateUser = async (formData: ICreateUserPayload) => {
        setCreatingUser(true);
        try {
            const created = await adminService.createUser(formData);
            setUsersList((prev) => [created, ...prev]);
            toast.success(`${formData.name} registered successfully`);
            setIsAddUserOpen(false);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to create user / agent"));
        } finally {
            setCreatingUser(false);
        }
    };

    // ── Client-side Filter Fallback ─────────────────────────────────────
    const filteredUsers = useMemo(() => {
        return usersList.filter((u) => {
            const q = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !q ||
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.id?.toLowerCase().includes(q);

            const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

            const isBlocked = Boolean(u.isBlocked || u.status === "SUSPENDED");
            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" ? !isBlocked : isBlocked);

            return matchesQuery && matchesRole && matchesStatus;
        });
    }, [usersList, searchQuery, roleFilter, statusFilter]);

    // Compute effective pagination based on API meta or local fallback
    const totalCount = paginationMeta?.total ?? filteredUsers.length;
    const totalPages = Math.max(1, paginationMeta?.totalPage ?? Math.ceil(totalCount / pageSize));

    const paginatedUsers = useMemo(() => {
        if (paginationMeta?.totalPage && paginationMeta.totalPage > 1) {
            return filteredUsers;
        }
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize, paginationMeta]);

    return (
        <div className="space-y-6 pb-8">
            {/* Reusable PageHeader */}
            <PageHeader
                title="User & Agent Directory"
                subtitle="Live management of system accounts, certified Freight agents, and merchant customers."
                badge="ADMIN CONSOLE"
                badgeColor="red"
                actions={
                    <>
                        <button
                            type="button"
                            onClick={() => fetchUsers(true)}
                            disabled={refreshing || loadingUsers}
                            className="p-2.5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-all disabled:opacity-50 cursor-pointer"
                            title="Refresh user list"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin text-[#00c9a7]" : ""} />
                        </button>

                        <CtaButton
                            onClick={() => setIsAddUserOpen(true)}
                            icon={<UserPlus size={15} />}
                        >
                            Add User / Agent
                        </CtaButton>
                    </>
                }
            />

            {/* Statistics Cards */}
            <UsersStatsCards users={usersList} />

            {/* Search & Filter Controls */}
            <UsersFilters
                searchQuery={searchQuery}
                onSearchChange={(q) => {
                    setSearchQuery(q);
                    setCurrentPage(1);
                }}
                roleFilter={roleFilter}
                onRoleFilterChange={(r) => {
                    setRoleFilter(r);
                    setCurrentPage(1);
                }}
                statusFilter={statusFilter}
                onStatusFilterChange={(s) => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                }}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
            />

            {/* User Directory Table */}
            <UsersTable
                users={paginatedUsers}
                loading={loadingUsers}
                currentAdminId={currentAdmin?.id}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onViewDetails={setSelectedUserForDetails}
                onChangeRole={setEditingUserForRole}
                onToggleStatus={setTargetUserForStatus}
                onDelete={setDeletingUser}
            />

            {/* Role Update Modal */}
            <UpdateRoleModal
                isOpen={Boolean(editingUserForRole)}
                user={editingUserForRole}
                updating={updatingRole}
                currentAdminId={currentAdmin?.id}
                onClose={() => setEditingUserForRole(null)}
                onSaveRole={handleSaveRole}
            />

            {/* Suspend / Reactivate Modal */}
            <SuspendUserModal
                isOpen={Boolean(targetUserForStatus)}
                user={targetUserForStatus}
                processing={updatingStatus}
                currentAdminId={currentAdmin?.id}
                onClose={() => setTargetUserForStatus(null)}
                onConfirmStatus={handleSaveStatus}
            />

            {/* Delete User Confirmation Modal */}
            <DeleteUserModal
                isOpen={Boolean(deletingUser)}
                user={deletingUser}
                deleting={deleting}
                currentAdminId={currentAdmin?.id}
                onClose={() => setDeletingUser(null)}
                onConfirmDelete={handleDeleteUser}
            />

            {/* User Detailed View Modal */}
            <UserDetailsModal
                isOpen={Boolean(selectedUserForDetails)}
                user={selectedUserForDetails}
                currentAdminId={currentAdmin?.id}
                onClose={() => setSelectedUserForDetails(null)}
                onChangeRoleClick={setEditingUserForRole}
                onToggleStatusClick={setTargetUserForStatus}
            />

            {/* Add User / Agent Modal */}
            <AddUserModal
                isOpen={isAddUserOpen}
                creating={creatingUser}
                onClose={() => setIsAddUserOpen(false)}
                onSubmit={handleCreateUser}
            />
        </div>
    );
}
