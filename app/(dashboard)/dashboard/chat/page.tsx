import type { Metadata } from "next";
import ChatRedirectClient from "./ChatRedirectClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consignment Chat Gateway | FreightAgent",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardChatPage() {
  return <ChatRedirectClient />;
}
