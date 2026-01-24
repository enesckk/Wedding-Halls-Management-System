"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-context";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Home,
  LogOut,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Shield,
} from "lucide-react";
import { useState } from "react";

/** Editor-only items hidden for Viewer. Align with lib/dashboard-routes EDITOR_ONLY_PATHS. */
const navItems = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Home, roles: ["Editor", "Viewer"] as const },
  { href: "/dashboard/takvim", label: "Takvim", icon: Calendar, roles: ["Editor", "Viewer"] as const },
  { href: "/dashboard/salonlar", label: "Salonlar", icon: Building2, roles: ["Editor", "Viewer"] as const },
  { href: "/dashboard/mesajlar", label: "Mesajlar", icon: MessageSquare, roles: ["Editor", "Viewer"] as const },
  { href: "/dashboard/talepler", label: "Talepler", icon: FileText, roles: ["Editor"] as const },
  { href: "/dashboard/ayarlar", label: "Ayarlar", icon: Settings, roles: ["Editor"] as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, isEditor } = useUser();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
    router.push("/");
  };

  const filteredNavItems = currentUser
    ? navItems.filter((item) => item.roles.includes(currentUser.role))
    : [];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground">
              Nikah Salonları
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-secondary text-primary font-medium",
                collapsed && "justify-center px-2"
              )}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "mb-2 flex items-center gap-3 rounded-lg bg-muted p-3",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {isEditor ? (
              <Shield className="h-4 w-4 text-primary" />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          {!collapsed && currentUser && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {currentUser.name}
                </p>
                <Badge
                  variant={isEditor ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {isEditor ? "Editor" : "Viewer"}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </Button>
      </div>
    </aside>
  );
}
