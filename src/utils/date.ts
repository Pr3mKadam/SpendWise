/**
 * date.ts — Timezone-safe local date utilities
 */

/**
 * Formats a Date object as a local YYYY-MM-DD string,
 * avoiding the UTC date-shifting bug caused by .toISOString().
 */
export function formatLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
}
