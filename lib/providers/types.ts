import type {
  ClimateContext,
  CommunityStats,
  ReportListPage,
  ReportQuery,
  RiverLevel,
  WeatherPreview,
} from "@/lib/domain/types";
import type { PublicReport } from "@/lib/domain/report";

export type ProviderSourceKind = "fixture" | "live";

/**
 * Exact seam C4 swaps for live providers and C2/C5 extend. Components never
 * know whether data came from fixtures or a live source.
 */
export interface OverviewDataProvider {
  readonly sourceKind: ProviderSourceKind;
  getClimateContext(): Promise<ClimateContext>;
  getWeatherPreview(): Promise<WeatherPreview>;
  getRiverLevel(): Promise<RiverLevel>;
  getCommunityStats(q: ReportQuery): Promise<CommunityStats>;
}

export interface ReportsProvider {
  readonly sourceKind: ProviderSourceKind;
  listReports(q: ReportQuery): Promise<ReportListPage>;
  getReportById(id: string): Promise<PublicReport | null>;
}
