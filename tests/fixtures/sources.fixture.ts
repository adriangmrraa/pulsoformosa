export interface MockSource {
  key: string;
  label: string;
  url: string;
  methodology_url: string;
  captured_at: string;
}

export const FIXTURE_CAPTURED_AT = "2026-10-22T10:00:00.000Z";

export const SOURCES_FIXTURE: readonly MockSource[] = [
  {
    key: "noaa-cpc",
    label: "NOAA CPC (mock)",
    url: "mock://noaa-cpc/enso-diagnostic",
    methodology_url: "mock://noaa-cpc/methodology",
    captured_at: FIXTURE_CAPTURED_AT,
  },
  {
    key: "weather",
    label: "Pronóstico simulado (mock)",
    url: "mock://weather/forecast",
    methodology_url: "mock://weather/methodology",
    captured_at: FIXTURE_CAPTURED_AT,
  },
  {
    key: "hydrology",
    label: "Hidrología simulada (mock)",
    url: "mock://hydrology/river-level",
    methodology_url: "mock://hydrology/methodology",
    captured_at: FIXTURE_CAPTURED_AT,
  },
  {
    key: "citizen-reports",
    label: "Reportes de vecinos (mock)",
    url: "mock://reports/citizen",
    methodology_url: "mock://reports/methodology",
    captured_at: FIXTURE_CAPTURED_AT,
  },
];
