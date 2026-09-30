import type { Metadata } from "next";
import { ChatClient } from "@/components/chat/ChatClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consignment Real-time Chat | FreightAgent",
  description: "Real-time communication with assigned carrier agents, dispatch operators, and shippers.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ChatPage() {
  return (
    <div className="p-3 sm:p-5 md:p-6 max-w-[1400px] mx-auto w-full">
      <ChatClient />
    </div>
  );
}
