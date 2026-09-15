import { Metadata } from "next";
import AdminUsersClient from "@/app/(dashboard)/admin/users/components/AdminUsersClient";

export const metadata: Metadata = {
    title: "User Management | Admin Console | FreightAgent",
    description: "Manage platform users, certified freight agents, role permissions, and access status.",
};

export default function DashboardAdminUsersPage() {
    return <AdminUsersClient />;
}
