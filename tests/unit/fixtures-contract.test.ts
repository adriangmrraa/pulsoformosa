// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  CLIMATE_FIXTURE,
  CLIMATE_NULL_PROBE,
  COMMUNITY_FIXTURE,
  FIXTURE_CAPTURED_AT,
  RIVER_FIXTURE,
  RIVER_NULL_PROBE,
  WEATHER_FIXTURE,
  WEATHER_NULL_PROBE,
} from "@/tests/fixtures/overview.fixture";
import { SOURCES_FIXTURE } from "@/tests/fixtures/sources.fixture";
import {
  FIXTURE_REPORT_IDS,
  REPORTS_FIXTURE,
} from "@/tests/fixtures/reports.fixture";
import { isInsideFormosaBBox } from "@/lib/domain/geo";

describe("overview fixtures", () => {
  it("satisfy the §15.11 shape with every field present", () => {
    expect(Object.keys(CLIMATE_FIXTURE).sort()).toEqual(
      [
        "phase",
        "phase_probability_pct",
        "probability_target_description",
        "season_label",
        "observed_nino34_c",
        "observed_at",
        "issued_at",
        "source_url",
        "is_stale",
        "methodology_url",
      ].sort(),
    );
    expect(WEATHER_FIXTURE.location).toBe("Formosa Capital");
    expect(RIVER_FIXTURE.station_name).toBe("Puerto Formosa");
    expect(COMMUNITY_FIXTURE.published_reports_count).toBeGreaterThanOrEqual(0);
  });

  it("uses mock:// source URLs and captured_at markers", () => {
    expect(CLIMATE_FIXTURE.source_url.startsWith("mock://")).toBe(true);
    expect(WEATHER_FIXTURE.source_url.startsWith("mock://")).toBe(true);
    expect(RIVER_FIXTURE.source_url.startsWith("mock://")).toBe(true);
    expect(FIXTURE_CAPTURED_AT).toMatch(/Z$/);
    for (const source of SOURCES_FIXTURE) {
      expect(source.url.startsWith("mock://")).toBe(true);
      expect(source.captured_at).toBe(FIXTURE_CAPTURED_AT);
    }
  });

  it("preserves nulls instead of coercing them to zero", () => {
    expect(CLIMATE_NULL_PROBE.phase_probability_pct).toBeNull();
    expect(CLIMATE_NULL_PROBE.observed_nino34_c).toBeNull();
    expect(WEATHER_NULL_PROBE.precip_expected_mm).toBeNull();
    expect(WEATHER_NULL_PROBE.precip_probability_pct).toBeNull();
    expect(WEATHER_NULL_PROBE.forecast_window_start).toBeNull();
    expect(RIVER_NULL_PROBE.level_m).toBeNull();
    expect(RIVER_NULL_PROBE.alert_reference_m).toBeNull();
    expect(RIVER_NULL_PROBE.trend).toBe("unknown");
  });
});

describe("report fixtures", () => {
  it("carry the §11.2 card fields", () => {
    for (const report of REPORTS_FIXTURE) {
      expect(report.id).toBeTruthy();
      expect(report.created_at).toBeTruthy();
      expect(report.published_at).toBeTruthy();
      expect(report.updated_at).toBeTruthy();
      expect(report.category).toBeTruthy();
      expect(report.summary.length).toBeGreaterThan(10);
      expect(Array.isArray(report.photos)).toBe(true);
      expect(report.editorial_status).toBeTruthy();
      expect(report.description.length).toBeGreaterThan(report.summary.length - 1);
    }
  });

  it("uses opaque non-sequential ids", () => {
    expect(new Set(FIXTURE_REPORT_IDS).size).toBe(FIXTURE_REPORT_IDS.length);
    for (const id of FIXTURE_REPORT_IDS) {
      expect(id).toMatch(/^rpt_mock_[a-z0-9]{6}$/);
    }
  });

  it("ships POINT geometry inside Formosa and no photos", () => {
    for (const report of REPORTS_FIXTURE) {
      expect(report.geometry.type).toBe("Point");
      const [lon, lat] = report.geometry.coordinates;
      expect(isInsideFormosaBBox(lat, lon)).toBe(true);
      expect(report.photos).toEqual([]);
    }
  });

  it("includes at least one editorially verified case", () => {
    const verified = REPORTS_FIXTURE.filter(
      (report) => report.editorial_status === "VERIFIED_EDITORIALLY",
    );
    expect(verified.length).toBeGreaterThanOrEqual(1);
  });
});
