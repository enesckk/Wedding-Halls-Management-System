"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useUser } from "@/lib/user-context";
import { getToken } from "@/lib/api/client";
import { isEditorOnlyPath } from "@/lib/dashboard-routes";

/**
 * Centralized client-side protection for all /dashboard/* routes.
 * - No JWT → redirect to /
 * - Viewer on Editor-only page → redirect to /dashboard
 * Renders children only when authorized.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading } = useUser();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }
    if (isLoading) return;
    if (!currentUser) {
      router.replace("/");
      return;
    }
    if (isEditorOnlyPath(pathname) && currentUser.role !== "Editor") {
      router.replace("/dashboard");
    }
  }, [pathname, router, currentUser, isLoading]);

  const token = typeof window !== "undefined" ? getToken() : null;
  if (!token) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentUser) return null;
  if (isEditorOnlyPath(pathname) && currentUser.role !== "Editor") return null;

  return <>{children}</>;
}
