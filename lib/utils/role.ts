import type { UserRole } from "@/lib/types";

/**
 * Role-based access control helpers.
 * Use these instead of hardcoding role strings.
 */

export function isEditor(role: UserRole | null | undefined): boolean {
  return role === "Editor";
}

export function isViewer(role: UserRole | null | undefined): boolean {
  return role === "Viewer";
}
