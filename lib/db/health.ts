import { getSql } from "./index";

/**
 * Minimal connectivity probe. Proves the Neon seam is wired without requiring
 * a schema (which lands in C2). Never throws: a down database is reported, not
 * surfaced as an unhandled rejection.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const rows = (await getSql()`select 1 as ok`) as Array<{ ok?: number }>;
    return Array.isArray(rows) && rows.length > 0 && rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
