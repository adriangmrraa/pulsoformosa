// §15.11 normalized contracts — field names are verbatim from the product spec.
import type { ReportCategory } from "./taxonomy";
import type { PublicReportCard } from "./report";

export type EnsoPhase = "EL_NINO" | "LA_NINA" | "NEUTRAL" | "UNKNOWN";
export type TimeRange = "24h" | "7d" | "30d";
export type { CategorySlug } from "./taxonomy";

export interface ClimateContext {
  phase: EnsoPhase;
  phase_probability_pct: number | null;
  probability_target_description: string;
  season_label: string;
  observed_nino34_c: number | null;
  observed_at: string;
  issued_at: string;
  source_url: string;
  is_stale: boolean;
  methodology_url: string;
}

export interface WeatherPreview {
  location: string;
  model: string;
  period_start: string;
  period_end: string;
  precip_probability_pct: number | null;
  precip_expected_mm: number | null;
  forecast_window_start: string | null;
  forecast_window_end: string | null;
  run_at: string;
  fetched_at: string;
  source_url: string;
  uncertainty_text: string;
  is_stale: boolean;
}

export interface RiverLevel {
  station_id: string;
  station_name: string;
  level_m: number | null;
  trend: "rising" | "stable" | "falling" | "unknown";
  measured_at: string;
  alert_reference_m: number | null;
  datum_explanation: string;
  fetched_at: string;
  source_url: string;
  is_stale: boolean;
}

export interface CommunityStats {
  scope_bbox_or_zone: string;
  period: TimeRange;
  published_reports_count: number;
  distinct_zones_count: number;
  last_public_report_at: string | null;
  caveat: string;
}

// §17.1 overview payload
export type SourceKey = "climate" | "weather" | "river" | "community";

export interface SourceHealth {
  status: "ok" | "stale" | "unavailable" | "fixture";
  reason?: string;
}

export interface OverviewPayload {
  climate: ClimateContext | null;
  weather: WeatherPreview | null;
  river: RiverLevel | null;
  community: CommunityStats | null;
  published_at: string;
  fetched_at: string;
  source_health: Record<SourceKey, SourceHealth>;
}

export interface ReportQuery {
  zona?: string;
  category: ReportCategory | "ALL";
  subtype?: string;
  period: TimeRange;
  cursor?: string;
  limit?: number;
}

export interface ReportListPage {
  items: PublicReportCard[];
  nextCursor: string | null;
  pageSize: number;
}
