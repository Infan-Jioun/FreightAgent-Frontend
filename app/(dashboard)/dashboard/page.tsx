"use client";

import { useAuthStore } from "@/app/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import CustomerDashboard from "@/components/ui/dashboard/roles/CustomerDashboard";
import AgentDashboard from "@/components/ui/dashboard/roles/AgentDashboard";
import AdminDashboard from "@/components/ui/dashboard/roles/AdminDashboard";

export default function Dashboard() {
    const { user } = useAuthStore();
    // Strictly derive dashboard based on authenticated user's assigned role
    const currentRole = user?.role || "CUSTOMER";

    return (
        <div className="space-y-4">
            {/* Dynamic Animated Dashboard strictly rendered according to user role */}
            <AnimatePresence mode="wait">
                {currentRole === "ADMIN" && (
                    <motion.div
                        key="admin-dashboard"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <AdminDashboard />
                    </motion.div>
                )}

                {currentRole === "AGENT" && (
                    <motion.div
                        key="agent-dashboard"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <AgentDashboard />
                    </motion.div>
                )}

                {currentRole === "CUSTOMER" && (
                    <motion.div
                        key="customer-dashboard"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <CustomerDashboard />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}