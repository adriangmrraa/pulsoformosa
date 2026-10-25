import { isPublicEditorialStatus } from "@/lib/domain/taxonomy";
import type {
  ReportListPage,
  ReportQuery,
  TimeRange,
} from "@/lib/domain/types";
import { toPublicReport, type StoredReport } from "./types";

export const PERIOD_MS: Record<TimeRange, number> = {
  "24h": 24 * 3_600_000,
  "7d": 7 * 24 * 3_600_000,
  "30d": 30 * 24 * 3_600_000,
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

function withinPeriod(publishedAt: string, period: TimeRange): boolean {
  const time = new Date(publishedAt).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= PERIOD_MS[period];
}

function cursorToOffset(cursor: string | undefined): number {
  if (!cursor) return 0;
  const match = /^cur_(\d+)$/.exec(cursor);
  if (!match) return 0;
  const offset = Number(match[1]);
  return Number.isFinite(offset) && offset >= 0 ? offset : 0;
}

/**
 * Shared visibility/filter/pagination semantics for every backend — identical
 * to the retired fixture provider contract. `zona` matches either a zone id
 * or the stored approx_zone label.
 */
export function filterStoredReports(
  reports: StoredReport[],
  query: ReportQuery,
  zoneLabelForId: (id: string | undefined) => string | undefined,
): StoredReport[] {
  const zoneLabel = zoneLabelForId(query.zona) ?? query.zona;

  return reports.filter((report) => {
    if (!isPublicEditorialStatus(report.editorial_status)) return false;
    if (query.category !== "ALL" && report.category !== query.category) {
      return false;
    }
    if (query.subtype && report.subtype !== query.subtype) return false;
    if (zoneLabel && report.approx_zone !== zoneLabel) return false;
    return withinPeriod(report.published_at, query.period);
  });
}

export function paginateReports(
  filtered: StoredReport[],
  query: ReportQuery,
): ReportListPage {
  const limit = Math.min(Math.max(query.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = cursorToOffset(query.cursor);
  const ordered = [...filtered].sort(
    (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at),
  );
  const items = ordered.slice(offset, offset + limit).map(toPublicReport);
  const nextOffset = offset + items.length;

  return {
    items,
    nextCursor: nextOffset < ordered.length ? `cur_${nextOffset}` : null,
    pageSize: items.length,
    total: ordered.length,
  };
}
