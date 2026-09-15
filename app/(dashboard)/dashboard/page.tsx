"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { ROUTES } from "@/app/constants/routes";
import { Loader2 } from "lucide-react";

export default function DashboardRootPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const role = user?.role;
        if (role === "ADMIN") {
            router.replace(ROUTES.DASHBOARD_ADMIN);
        } else if (role === "AGENT") {
            router.replace(ROUTES.DASHBOARD_AGENT);
        } else {
            router.replace(ROUTES.DASHBOARD_CUSTOMER);
        }
    }, [user, router]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00c9a7] animate-spin" />
            <p className="text-xs font-semibold text-[#7ecfc4]">
                Redirecting to your workspace...
            </p>
        </div>
    );
}