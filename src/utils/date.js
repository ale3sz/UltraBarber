/**
 * Formats a given Date object or date timestamp into a local 'YYYY-MM-DD' string
 * without converting to UTC, avoiding day-shifts for timezones like Argentina (UTC-3).
 */
export function formatLocalDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
