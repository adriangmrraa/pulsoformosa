// @vitest-environment node
import { describe, expect, it } from "vitest";
import { SOURCES_FIXTURE } from "@/tests/fixtures/sources.fixture";
import {
  FIXTURE_REPORT_IDS,
  REPORTS_FIXTURE,
} from "@/tests/fixtures/reports.fixture";
import { SOLUTIONS_FIXTURE } from "@/tests/fixtures/solutions.fixture";
import { deriveReportStatus } from "@/lib/domain/solution";
import { isInsideFormosaBBox } from "@/lib/domain/geo";

describe("source fixtures", () => {
  it("uses mock:// source URLs and captured_at markers", () => {
    for (const source of SOURCES_FIXTURE) {
      expect(source.url.startsWith("mock://")).toBe(true);
      expect(source.methodology_url.startsWith("mock://")).toBe(true);
      expect(source.captured_at).toMatch(/Z$/);
    }
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

  it("keeps the report with the latest created_at first", () => {
    const timestamps = REPORTS_FIXTURE.map((report) =>
      new Date(report.created_at).getTime(),
    );
    const latest = Math.max(...timestamps);
    expect(new Date(REPORTS_FIXTURE[0].created_at).getTime()).toBe(latest);
  });

  it("carries expected_solution on at least one report and null elsewhere", () => {
    const withExpected = REPORTS_FIXTURE.filter(
      (report) => report.expected_solution !== null,
    );
    const without = REPORTS_FIXTURE.filter(
      (report) => report.expected_solution === null,
    );
    expect(withExpected.length).toBeGreaterThanOrEqual(1);
    expect(without.length).toBeGreaterThanOrEqual(1);
    for (const report of withExpected) {
      expect(report.expected_solution!.length).toBeLessThanOrEqual(280);
    }
  });
});

describe("solution fixtures", () => {
  it("only reference published fixture reports", () => {
    const ids = new Set(FIXTURE_REPORT_IDS);
    for (const item of SOLUTIONS_FIXTURE) {
      expect(ids.has(item.report_id)).toBe(true);
    }
  });

  it("includes at least one approved and one pending solution", () => {
    expect(
      SOLUTIONS_FIXTURE.some((item) => item.status === "approved"),
    ).toBe(true);
    expect(
      SOLUTIONS_FIXTURE.some((item) => item.status === "pending"),
    ).toBe(true);
  });

  it("marks every contribution anonymous with bounded fields", () => {
    for (const item of SOLUTIONS_FIXTURE) {
      expect(item.author_anonymous).toBe(true);
      expect(item.text.length).toBeGreaterThanOrEqual(10);
      expect(item.text.length).toBeLessThanOrEqual(500);
      if (item.evidence_note) {
        expect(item.evidence_note.length).toBeLessThanOrEqual(280);
      }
      if (item.author_label) {
        expect(item.author_label.length).toBeLessThanOrEqual(60);
      }
    }
  });

  it("yields at least one solved and one open report via derivation", () => {
    const statuses = new Set(
      REPORTS_FIXTURE.map((report) =>
        deriveReportStatus(report, [...SOLUTIONS_FIXTURE]),
      ),
    );
    expect(statuses.has("solved")).toBe(true);
    expect(statuses.has("open")).toBe(true);
  });
});
