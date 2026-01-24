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
  const { user, isAuthenticated, isEditor, loading } = useUser();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (isEditorOnlyPath(pathname) && !isEditor) {
      router.replace("/dashboard");
    }
  }, [pathname, router, isAuthenticated, isEditor, loading]);

  const token = typeof window !== "undefined" ? getToken() : null;
  if (!token) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (isEditorOnlyPath(pathname) && !isEditor) return null;

  return <>{children}</>;
}
