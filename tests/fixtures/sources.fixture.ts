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
    key: "citizen-reports",
    label: "Reportes de vecinos (mock)",
    url: "mock://reports/citizen",
    methodology_url: "mock://reports/methodology",
    captured_at: FIXTURE_CAPTURED_AT,
  },
];
