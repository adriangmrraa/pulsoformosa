// All values below are visibly mock fixtures for development. Source URLs use
// the `mock://` scheme so nothing can be mistaken for a real provider.
import type {
  ClimateContext,
  CommunityStats,
  RiverLevel,
  WeatherPreview,
} from "@/lib/domain/types";

export const FIXTURE_CAPTURED_AT = "2026-10-22T10:00:00.000Z";

// Timestamps are generated relative to module load so freshness windows stay
// meaningful; FIXTURE_CAPTURED_AT remains the visible mock marker.
const NOW_MS = Date.now();

function isoHoursAgo(hours: number): string {
  return new Date(NOW_MS - hours * 3_600_000).toISOString();
}

export const CLIMATE_FIXTURE: ClimateContext = {
  phase: "EL_NINO",
  phase_probability_pct: 85,
  probability_target_description:
    "Probabilidad de fase El Niño para el trimestre OND",
  season_label: "OND 2026",
  observed_nino34_c: 1.4,
  observed_at: isoHoursAgo(24 * 10),
  issued_at: isoHoursAgo(24 * 9),
  source_url: "mock://noaa-cpc/enso-diagnostic",
  is_stale: false,
  methodology_url: "mock://noaa-cpc/methodology",
};

export const WEATHER_FIXTURE: WeatherPreview = {
  location: "Formosa Capital",
  model: "modelo-mock",
  period_start: isoHoursAgo(2),
  period_end: isoHoursAgo(-22),
  precip_probability_pct: 60,
  precip_expected_mm: 18.5,
  forecast_window_start: isoHoursAgo(-4),
  forecast_window_end: isoHoursAgo(-10),
  run_at: isoHoursAgo(3),
  fetched_at: isoHoursAgo(1),
  source_url: "mock://weather/forecast",
  uncertainty_text: "Escenario simulado con incertidumbre alta.",
  is_stale: false,
};

export const RIVER_FIXTURE: RiverLevel = {
  station_id: "mock-puerto-formosa",
  station_name: "Puerto Formosa",
  level_m: 3.2,
  trend: "rising",
  measured_at: isoHoursAgo(4),
  alert_reference_m: 5.5,
  datum_explanation:
    "Altura de escala hidrométrica de referencia; no es profundidad sobre la calle.",
  fetched_at: isoHoursAgo(2),
  source_url: "mock://hydrology/river-level",
  is_stale: false,
};

export const COMMUNITY_FIXTURE: CommunityStats = {
  scope_bbox_or_zone: "Formosa Capital",
  period: "24h",
  published_reports_count: 7,
  distinct_zones_count: 5,
  last_public_report_at: isoHoursAgo(1),
  caveat:
    "Los conteos son reportes públicos del período: no son personas afectadas ni eventos distintos.",
};

// Explicit nullable probe used by contract tests: nulls are valid and must stay
// null end-to-end (REQ-DAT-05).
export const CLIMATE_NULL_PROBE: ClimateContext = {
  ...CLIMATE_FIXTURE,
  phase: "UNKNOWN",
  phase_probability_pct: null,
  observed_nino34_c: null,
};

export const WEATHER_NULL_PROBE: WeatherPreview = {
  ...WEATHER_FIXTURE,
  precip_probability_pct: null,
  precip_expected_mm: null,
  forecast_window_start: null,
  forecast_window_end: null,
};

export const RIVER_NULL_PROBE: RiverLevel = {
  ...RIVER_FIXTURE,
  level_m: null,
  alert_reference_m: null,
  trend: "unknown",
};
