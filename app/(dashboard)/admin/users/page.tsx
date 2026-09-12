import { Metadata } from "next";
import AdminUsersClient from "./components/AdminUsersClient";

export const metadata: Metadata = {
    title: "User & Agent Directory | Admin Console | FreightAgent",
    description: "Manage platform user accounts, certified freight agents, role permissions, and security statuses.",
};

/**
 * Admin Users Page Server Component.
 * Adheres strictly to the Single Responsibility Principle (SRP):
 * Exposes route SEO metadata and mounts the interactive AdminUsersClient component.
 */
export default function AdminUsersPage() {
    return <AdminUsersClient />;
}