"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/app/hooks/usePermission";
import { useAuthStore } from "@/app/store/authStore";
import { ROUTES } from "@/app/constants/routes";
import { Loader2, Package } from "lucide-react";

export default function ShipmentsRedirectClient() {
  const { role: permRole, isAgent, isAdmin } = usePermission();
  const { user } = useAuthStore();
  const router = useRouter();

  const role = permRole || user?.role || "CUSTOMER";

  useEffect(() => {
    let target: string = ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;

    if (role === "ADMIN" || isAdmin) {
      target = ROUTES.DASHBOARD_ADMIN_SHIPMENTS;
    } else if (role === "AGENT" || isAgent) {
      target = ROUTES.DASHBOARD_AGENT_SHIPMENTS;
    } else {
      target = ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
    }

    router.replace(target);
  }, [role, isAdmin, isAgent, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0]">
        <Package className="w-6 h-6 animate-pulse" />
      </div>
      <div className="text-center">
        <h2 className="text-sm font-bold text-[#e0faf5]">
          Directing to Consignments...
        </h2>
        <p className="text-xs text-[#7ecfc4] mt-0.5">
          Loading your role-specific freight manifest workspace.
        </p>
      </div>
      <Loader2 className="w-5 h-5 text-[#00c9a7] animate-spin" />
    </div>
  );
}
