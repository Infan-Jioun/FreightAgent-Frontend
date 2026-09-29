"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/app/hooks/usePermission";
import { useAuthStore } from "@/app/store/authStore";
import { ROUTES } from "@/app/constants/routes";
import { Loader2, Package } from "lucide-react";

export default function ShipmentDetailRedirectClient({ id }: { id: string }) {
  const { role: permRole, isAgent, isAdmin } = usePermission();
  const { user } = useAuthStore();
  const router = useRouter();

  const role = permRole || user?.role || "CUSTOMER";

  useEffect(() => {
    if (!id) {
      router.replace(ROUTES.DASHBOARD);
      return;
    }

    if (role === "ADMIN" || isAdmin) {
      router.replace(ROUTES.DASHBOARD_ADMIN_SHIPMENTS);
    } else if (role === "AGENT" || isAgent) {
      router.replace(ROUTES.DASHBOARD_AGENT_SHIPMENT_DETAIL(id));
    } else {
      router.replace(ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS);
    }
  }, [id, role, isAdmin, isAgent, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0]">
        <Package className="w-6 h-6 animate-pulse" />
      </div>
      <div className="text-center">
        <h2 className="text-sm font-bold text-[#e0faf5]">
          Locating Consignment...
        </h2>
        <p className="text-xs text-[#7ecfc4] mt-0.5">
          Redirecting to consignment record #{id.slice(0, 8)}
        </p>
      </div>
      <Loader2 className="w-5 h-5 text-[#00c9a7] animate-spin" />
    </div>
  );
}
