import type { UserRole } from "@/lib/types";

/**
 * Role-based access control helpers.
 * Use these instead of hardcoding role strings.
 */

export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === "SuperAdmin";
}

export function isEditor(role: UserRole | null | undefined): boolean {
  return role === "Editor";
}

export function isViewer(role: UserRole | null | undefined): boolean {
  return role === "Viewer";
}

/**
 * Check if user can edit (SuperAdmin or Editor)
 */
export function canEdit(role: UserRole | null | undefined): boolean {
  return role === "SuperAdmin" || role === "Editor";
}

/**
 * Check if user can manage halls (only SuperAdmin)
 */
export function canManageHalls(role: UserRole | null | undefined): boolean {
  return role === "SuperAdmin";
}

/**
 * Check if user can manage schedules (SuperAdmin or Editor)
 */
export function canManageSchedules(role: UserRole | null | undefined): boolean {
  return role === "SuperAdmin" || role === "Editor";
}

/**
 * Parse allowed user IDs from center description
 */
export function parseAllowedUserIds(description: string): string[] {
  if (!description) return [];
  const editorMatch = description.match(/Erişim İzni Olan Editörler:\s*\[([^\]]+)\]/);
  if (editorMatch) {
    return editorMatch[1]
      .split(',')
      .map(id => id.trim().replace(/['"]/g, ''))
      .filter(id => id.length > 0);
  }
  return [];
}

/**
 * Check if user has access to a center
 * SuperAdmin always has access
 * Editor has access if their ID is in the center's allowedUserIds
 */
export function canAccessCenter(
  userRole: UserRole | null | undefined,
  userId: string | null | undefined,
  centerDescription: string | null | undefined
): boolean {
  // SuperAdmin always has access
  if (isSuperAdmin(userRole)) return true;
  
  // Viewer never has access
  if (isViewer(userRole)) return false;
  
  // Editor needs to be in the allowed list
  if (isEditor(userRole) && userId && centerDescription) {
    const allowedIds = parseAllowedUserIds(centerDescription);
    return allowedIds.includes(userId);
  }
  
  return false;
}
