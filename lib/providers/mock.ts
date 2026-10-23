import type {
  ClimateContext,
  CommunityStats,
  ReportListPage,
  ReportQuery,
  RiverLevel,
  TimeRange,
  WeatherPreview,
} from "@/lib/domain/types";
import type { PublicReport } from "@/lib/domain/report";
import {
  CLIMATE_FIXTURE,
  RIVER_FIXTURE,
  WEATHER_FIXTURE,
} from "@/tests/fixtures/overview.fixture";
import {
  FIXTURE_REPORT_IDS,
  HIDDEN_REPORT_FIXTURE,
  REPORTS_FIXTURE,
  zoneLabelForId,
} from "@/tests/fixtures/reports.fixture";
import { isPublicEditorialStatus } from "@/lib/domain/taxonomy";
import type { OverviewDataProvider, ReportsProvider } from "./types";

const PERIOD_MS: Record<TimeRange, number> = {
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

function filteredReports(query: ReportQuery): PublicReport[] {
  const zoneLabel = zoneLabelForId(query.zona) ?? query.zona;

  return REPORTS_FIXTURE.filter((report) => {
    if (!isPublicEditorialStatus(report.editorial_status)) {
      return false;
    }
    if (query.category !== "ALL" && report.category !== query.category) {
      return false;
    }
    if (query.subtype && report.subtype !== query.subtype) {
      return false;
    }
    if (zoneLabel && report.approx_zone !== zoneLabel) {
      return false;
    }
    return withinPeriod(report.published_at, query.period);
  });
}

function cursorToOffset(cursor: string | undefined): number {
  if (!cursor) return 0;
  const match = /^cur_(\d+)$/.exec(cursor);
  if (!match) return 0;
  const offset = Number(match[1]);
  return Number.isFinite(offset) && offset >= 0 ? offset : 0;
}

export class MockOverviewDataProvider implements OverviewDataProvider {
  readonly sourceKind = "fixture" as const;

  async getClimateContext(): Promise<ClimateContext> {
    return CLIMATE_FIXTURE;
  }

  async getWeatherPreview(): Promise<WeatherPreview> {
    return WEATHER_FIXTURE;
  }

  async getRiverLevel(): Promise<RiverLevel> {
    return RIVER_FIXTURE;
  }

  async getCommunityStats(query: ReportQuery): Promise<CommunityStats> {
    const reports = filteredReports(query);
    const zones = new Set(
      reports.map((report) => report.approx_zone).filter(Boolean),
    );

    return {
      scope_bbox_or_zone: query.zona ?? "Formosa Capital",
      period: query.period,
      published_reports_count: reports.length,
      distinct_zones_count: zones.size,
      last_public_report_at: reports[0]?.published_at ?? null,
      caveat:
        "Los conteos son reportes públicos del período: no son personas afectadas ni eventos distintos.",
    };
  }
}

export class MockReportsProvider implements ReportsProvider {
  readonly sourceKind = "fixture" as const;

  async listReports(query: ReportQuery): Promise<ReportListPage> {
    const limit = Math.min(Math.max(query.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = cursorToOffset(query.cursor);
    const reports = filteredReports(query);
    const items = reports.slice(offset, offset + limit);
    const nextOffset = offset + items.length;

    return {
      items,
      nextCursor: nextOffset < reports.length ? `cur_${nextOffset}` : null,
      pageSize: items.length,
    };
  }

  async getReportById(id: string): Promise<PublicReport | null> {
    const report =
      REPORTS_FIXTURE.find((item) => item.id === id) ??
      (HIDDEN_REPORT_FIXTURE.id === id ? HIDDEN_REPORT_FIXTURE : undefined);
    if (!report || !isPublicEditorialStatus(report.editorial_status)) {
      return null;
    }
    return report;
  }
}

export const MOCK_REPORT_COUNT = FIXTURE_REPORT_IDS.length;
