"use client";

import React from "react";

import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64 transition-all duration-300">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
