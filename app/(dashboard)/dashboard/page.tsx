// This needs 'use client' because: it uses client routing and reactive auth permissions to redirect users to their role-designated dashboard workspace.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/app/hooks/usePermission";
import { Loader2 } from "lucide-react";

export default function DashboardRootPage() {
    const { dashboardPath } = usePermission();
    const router = useRouter();

    useEffect(() => {
        router.replace(dashboardPath);
    }, [dashboardPath, router]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00c9a7] animate-spin" />
            <p className="text-xs font-semibold text-[#7ecfc4]">
                Redirecting to your workspace...
            </p>
        </div>
    );
}