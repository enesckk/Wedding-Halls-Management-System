"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2, LogOut, User } from "lucide-react";
import { mockUser } from "@/lib/data";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-lg font-semibold text-foreground sm:block">
            Nikah Salonları Yönetim Sistemi
          </span>
          <span className="text-lg font-semibold text-foreground sm:hidden">
            NSYS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <User className="h-4 w-4" />
            <span>{mockUser.name}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Çıkış Yap</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
