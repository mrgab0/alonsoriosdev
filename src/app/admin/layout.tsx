import React from "react";
import AdminNav from "@/components/AdminNav";
import { ChatbotWidget } from "@/components/ChatbotWidget";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNav>
      {children}
      <ChatbotWidget />
    </AdminNav>
  );
}
