/**
 * date.ts — Timezone-safe local date utilities
 */

/**
 * Formats a Date object as a local YYYY-MM-DD string,
 * avoiding the UTC date-shifting bug caused by .toISOString().
 */
export function formatLocalYYYYMMDD(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
}

/**
 * Formats a Date object as a local ISO-like string including time,
 * for use in timestamps and unique IDs.
 */
export function formatLocalISO(d: Date = new Date()): string {
  const ymd = formatLocalYYYYMMDD(d);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${ymd}T${h}:${min}:${s}.${ms}`;
}
