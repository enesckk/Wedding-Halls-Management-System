/**
 * Centralized route config for dashboard protection.
 * Editor-only paths: Viewer cannot access; hide from sidebar for Viewer.
 */
export const EDITOR_ONLY_PATHS = ["/dashboard/ayarlar"] as const;

export function isEditorOnlyPath(pathname: string): boolean {
  return EDITOR_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}
