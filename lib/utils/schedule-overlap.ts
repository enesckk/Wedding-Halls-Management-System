import type { Schedule } from "@/lib/types";

/**
 * Parse "HH:mm" or "HH:mm:ss" to minutes since midnight.
 */
function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Check if [startA, endA] overlaps [startB, endB] (exclusive end).
 * Overlap: startA < endB && endA > startB.
 */
function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && endA > startB;
}

/**
 * UI-level safety net: detect if a proposed time range overlaps any existing
 * schedule (same hall, same date). Exclude one schedule by id (e.g. the one
 * being updated). Backend remains final authority.
 */
export function hasOverlap(
  schedules: Schedule[],
  excludeId: string | null,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start >= end) return true;

  for (const s of schedules) {
    if (s.date !== date) continue;
    if (excludeId && s.id === excludeId) continue;
    const sStart = toMinutes(s.startTime);
    const sEnd = toMinutes(s.endTime);
    if (rangesOverlap(start, end, sStart, sEnd)) return true;
  }
  return false;
}
