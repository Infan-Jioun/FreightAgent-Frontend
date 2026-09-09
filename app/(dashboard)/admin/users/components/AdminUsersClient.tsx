"use client";

import { useState, useMemo, useCallback } from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { adminService } from "@/app/services/admin.service";
import { IAdminUser, ICreateUserPayload, UserRole } from "@/app/types/admin.types";
import UsersStatsCards from "./UsersStatsCards";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";
import UpdateRoleModal from "./UpdateRoleModal";
import DeleteUserModal from "./DeleteUserModal";
import UserDetailsModal from "./UserDetailsModal";
import AddUserModal from "./AddUserModal";

const USERS_PER_PAGE = 8;

interface AdminUsersClientProps {
    initialUsers: IAdminUser[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
    const { user: currentAdmin } = useAuthStore();

    // ── Data State (Initialized from SSR) ───────────────────────────────
    const [usersList, setUsersList] = useState<IAdminUser[]>(initialUsers);
    const [refreshing, setRefreshing] = useState(false);

    // ── Filters & Search State ──────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
    const [verifiedFilter, setVerifiedFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modals & Mutation States ────────────────────────────────────────
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<IAdminUser | null>(null);
    const [editingUserForRole, setEditingUserForRole] = useState<IAdminUser | null>(null);
    const [updatingRole, setUpdatingRole] = useState(false);

    const [deletingUser, setDeletingUser] = useState<IAdminUser | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);

    // ── Manual Refresh Function ─────────────────────────────────────────
    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            const freshUsers = await adminService.getAllUsers();
            setUsersList(freshUsers);
            toast.success("User directory refreshed");
        } catch (err: any) {
            console.error("Failed to refresh users:", err);
            toast.error(err?.message || "Failed to refresh user list");
        } finally {
            setRefreshing(false);
        }
    }, []);

    // ── Filtering Logic ─────────────────────────────────────────────────
    const filteredUsers = useMemo(() => {
        return usersList.filter((u) => {
            const q = searchQuery.toLowerCase();
            const matchesQuery =
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.id?.toLowerCase().includes(q);

            const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

            const matchesVerified =
                verifiedFilter === "ALL" ||
                (verifiedFilter === "VERIFIED" ? u.emailVerified : !u.emailVerified);

            return matchesQuery && matchesRole && matchesVerified;
        });
    }, [usersList, searchQuery, roleFilter, verifiedFilter]);

    // ── Pagination Calculation ──────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(start, start + USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    // ── Update Role ─────────────────────────────────────────────────────
    const handleSaveRole = async (newRole: UserRole) => {
        if (!editingUserForRole?.id) return;

        setUpdatingRole(true);
        try {
            const updatedUser = await adminService.updateUserRole(
                editingUserForRole.id,
                newRole
            );

            setUsersList((prev) =>
                prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            );

            setSelectedUserForDetails((prev) =>
                prev?.id === updatedUser.id ? updatedUser : prev
            );

            toast.success(`Role updated to ${newRole} for ${editingUserForRole.name}`);
            setEditingUserForRole(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update role");
        } finally {
            setUpdatingRole(false);
        }
    };

    // ── Delete User ─────────────────────────────────────────────────────
    const handleDeleteUser = async () => {
        if (!deletingUser?.id) return;

        if (deletingUser.id === currentAdmin?.id) {
            toast.error("You cannot delete your own account");
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
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete user");
        } finally {
            setDeleting(false);
        }
    };

    // ── Create User ─────────────────────────────────────────────────────
    const handleCreateUser = async (formData: ICreateUserPayload) => {
        setCreatingUser(true);
        try {
            const created = await adminService.createUser(formData);
            setUsersList((prev) => [created, ...prev]);
            toast.success(`${formData.name} created successfully`);
            setIsAddUserOpen(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create user");
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                            User & Agent Directory
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e11d48]/15 text-[#f43f5e] border border-[#e11d48]/30">
                            ADMIN CONSOLE
                        </span>
                    </div>
                    <p className="text-xs text-[#7ecfc4] mt-1">
                        Live management of system accounts, certified Freigeht agents, and merchant customers via Admin APIs.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live Refresh Button */}
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-all disabled:opacity-50 cursor-pointer"
                        title="Refresh users from server"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin text-[#00c9a7]" : ""} />
                    </button>

                    {/* Add / Invite User */}
                    <button
                        type="button"
                        onClick={() => setIsAddUserOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-md shadow-[#00c9a7]/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <UserPlus size={15} />
                        <span>Add User / Agent</span>
                    </button>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <UsersStatsCards users={usersList} />

            {/* Filter & Search Bar */}
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
                verifiedFilter={verifiedFilter}
                onVerifiedFilterChange={(v) => {
                    setVerifiedFilter(v);
                    setCurrentPage(1);
                }}
            />

            {/* Users Table */}
            <UsersTable
                users={paginatedUsers}
                loading={false}
                currentAdminId={currentAdmin?.id}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={filteredUsers.length}
                pageSize={USERS_PER_PAGE}
                onPageChange={setCurrentPage}
                onViewDetails={setSelectedUserForDetails}
                onChangeRole={setEditingUserForRole}
                onDelete={setDeletingUser}
            />

            {/* ── MODAL: Update User Role ── */}
            <UpdateRoleModal
                isOpen={Boolean(editingUserForRole)}
                user={editingUserForRole}
                updating={updatingRole}
                onClose={() => setEditingUserForRole(null)}
                onSaveRole={handleSaveRole}
            />

            {/* ── MODAL: Delete User Confirmation ── */}
            <DeleteUserModal
                isOpen={Boolean(deletingUser)}
                user={deletingUser}
                deleting={deleting}
                currentAdminId={currentAdmin?.id}
                onClose={() => setDeletingUser(null)}
                onConfirmDelete={handleDeleteUser}
            />

            {/* ── MODAL: User Details ── */}
            <UserDetailsModal
                isOpen={Boolean(selectedUserForDetails)}
                user={selectedUserForDetails}
                onClose={() => setSelectedUserForDetails(null)}
                onChangeRoleClick={(user) => setEditingUserForRole(user)}
            />

            {/* ── MODAL: Add User / Agent ── */}
            <AddUserModal
                isOpen={isAddUserOpen}
                creating={creatingUser}
                onClose={() => setIsAddUserOpen(false)}
                onSubmit={handleCreateUser}
            />
        </div>
    );
}
