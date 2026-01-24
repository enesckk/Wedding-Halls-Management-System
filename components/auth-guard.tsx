"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only checking client-side after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted, pathname, router, isAuthenticated, isEditor, loading]);

  // During SSR and initial render, show loading to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // After mount, check authentication
  const token = getToken();
  if (!token) {
    return null;
  }

  if (!isAuthenticated) return null;
  if (isEditorOnlyPath(pathname) && !isEditor) return null;

  return <>{children}</>;
}
