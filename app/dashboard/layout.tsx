"use client";

import React, { useState, useEffect } from "react";

import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { NotificationBell } from "@/components/notification-bell";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/components/ui/use-mobile";
import { cn } from "@/lib/utils";
import { isSuperAdmin, isEditor } from "@/lib/utils/role";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile(); // 1024px'den küçük ekranlar için true

  // Tablet ve mobilde sidebar kapalıyken sayfa tam genişlikte olmalı
  // Desktop'ta (lg ve üzeri) sidebar genişliğine göre padding ayarla
  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 72 : 256);
  
  // Tablet ve mobilde sidebar açıkken overlay göster
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar 
          open={sidebarOpen} 
          onOpenChange={setSidebarOpen} 
          isMobile={isMobile}
          onCollapsedChange={setSidebarCollapsed}
        />
        <main 
          className={cn(
            "transition-all duration-300 ease-in-out w-full",
            isMobile ? "pl-0" : (sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")
          )}
          style={isMobile ? { paddingLeft: 0 } : { paddingLeft: `${sidebarWidth}px` }}
        >
          {/* Header with Notifications */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className={cn(
                  isMobile ? "flex" : "lg:hidden"
                )}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <NotificationBell />
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {(user.name || user.email || "K")[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate max-w-[140px] leading-tight">
                          {user.name || user.email || "Kullanıcı"}
                        </span>
                        <Badge 
                          variant={isSuperAdmin(user.role) ? "default" : isEditor(user.role) ? "secondary" : "outline"}
                          className="text-[10px] px-1.5 py-0 h-4 w-fit mt-0.5 font-medium"
                        >
                          {isSuperAdmin(user.role) 
                            ? "Yönetici" 
                            : isEditor(user.role) 
                              ? (() => {
                                  const departmentNames: Record<number, string> = {
                                    0: "Nikah",
                                    1: "Nişan",
                                    2: "Konser",
                                    3: "Toplantı",
                                    4: "Özel",
                                  };
                                  const deptName = user.department !== undefined && user.department !== null 
                                    ? departmentNames[user.department] 
                                    : null;
                                  return deptName ? `Editör - ${deptName}` : "Editör";
                                })()
                              : "Viewer"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
