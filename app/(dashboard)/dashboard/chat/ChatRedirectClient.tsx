"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/app/hooks/usePermission";
import { ROUTES } from "@/app/constants/routes";
import { Loader2, MessageSquare } from "lucide-react";
import { ChatClient } from "@/components/chat/ChatClient";

export default function ChatRedirectClient() {
  const { isAgent, isCustomer, isAdmin, isAuthenticated } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Administrators have full permission to supervise and participate in all dispatch chats
    if (isAdmin) {
      return;
    }

    // Customers and Agents communicate strictly through individual shipments
    let target: string = ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
    if (isAgent) {
      target = ROUTES.DASHBOARD_AGENT_SHIPMENTS;
    } else if (isCustomer) {
      target = ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS;
    }
    router.replace(target);
  }, [isAgent, isCustomer, isAdmin, isAuthenticated, router]);

  // If Admin, render the full Dispatch Monitoring Console
  if (isAdmin) {
    return (
      <div className="relative p-1.5 sm:p-4 md:p-6 max-w-[1440px] mx-auto w-full min-h-[calc(100vh-85px)] flex items-center justify-center">
        {/* Decorative concentric background rings */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 select-none">
          <div className="size-[580px] rounded-full border border-[#00c9a7]/20" />
          <div className="absolute size-[880px] rounded-full border border-[#00c9a7]/10" />
          <div className="absolute size-[1180px] rounded-full border border-[#00c9a7]/5" />
        </div>

        <ChatClient />
      </div>
    );
  }

  // Non-admin redirecting state
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="size-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0]">
        <MessageSquare className="size-6 animate-pulse" />
      </div>
      <div>
        <h2 className="text-base font-bold text-[#e0faf5]">
          Redirecting to Shipments...
        </h2>
        <p className="text-xs text-[#7ecfc4] mt-1 max-w-sm">
          Consignment communication is available directly via the Chat button inside each shipment.
        </p>
      </div>
      <Loader2 className="size-5 text-[#00c9a7] animate-spin" />
    </div>
  );
}
