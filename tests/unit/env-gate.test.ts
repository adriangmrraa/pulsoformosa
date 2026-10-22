// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MockProviderInProductionError,
  getOverviewProvider,
  getReportsProvider,
} from "@/lib/providers";
import { GET } from "@/app/api/overview/route";

const originalLabel = process.env.PUBLIC_ENVIRONMENT_LABEL;

function restoreEnv() {
  if (originalLabel === undefined) {
    delete process.env.PUBLIC_ENVIRONMENT_LABEL;
  } else {
    process.env.PUBLIC_ENVIRONMENT_LABEL = originalLabel;
  }
}

describe("production gate", () => {
  afterEach(() => {
    restoreEnv();
    vi.unstubAllEnvs();
  });

  it("throws at provider access under PUBLIC_ENVIRONMENT_LABEL=production", () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "production");
    expect(() => getOverviewProvider()).toThrow(MockProviderInProductionError);
    expect(() => getReportsProvider()).toThrow(MockProviderInProductionError);
  });

  it("honours trimmed, case-insensitive labels", () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "  PRODUCTION  ");
    expect(() => getOverviewProvider()).toThrow(MockProviderInProductionError);
  });

  it("serves the mock providers in development", () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
    expect(getOverviewProvider().sourceKind).toBe("fixture");
    expect(getReportsProvider().sourceKind).toBe("fixture");
  });

  it("returns a uniform JSON 404 from /api/overview under production", async () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "production");
    const response = await GET();
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual([
      "code",
      "message",
      "request_id",
      "retryable",
    ]);
    expect(body.code).toBe("NOT_FOUND");
    expect(body.retryable).toBe(false);
    expect(typeof body.request_id).toBe("string");
    expect(body.request_id.length).toBeGreaterThan(10);
  });
});

describe("/api/overview payload", () => {
  beforeEach(() => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
  });

  afterEach(() => {
    restoreEnv();
    vi.unstubAllEnvs();
  });

  it("returns the §17.1 shape with fixture health", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=60");

    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(
      [
        "climate",
        "weather",
        "river",
        "community",
        "published_at",
        "fetched_at",
        "source_health",
      ].sort(),
    );
    expect(body.source_health.climate.status).toBe("fixture");
    expect(body.source_health.weather.status).toBe("fixture");
    expect(body.source_health.river.status).toBe("fixture");
    expect(body.source_health.community.status).toBe("fixture");
    expect(new Date(body.published_at).toString()).not.toBe("Invalid Date");
  });
});

describe("mock report filtering", () => {
  beforeEach(() => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
  });

  afterEach(() => {
    restoreEnv();
    vi.unstubAllEnvs();
  });

  it("filters by category and respects the page size", async () => {
    const page = await getReportsProvider().listReports({
      category: "WATER",
      period: "30d",
    });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((item) => item.category === "WATER")).toBe(true);
    expect(page.pageSize).toBeLessThanOrEqual(12);
  });

  it("returns a cursor when more pages exist", async () => {
    const page = await getReportsProvider().listReports({
      category: "ALL",
      period: "30d",
      limit: 5,
    });
    expect(page.items).toHaveLength(5);
    expect(page.nextCursor).toBe("cur_5");
  });

  it("finds a report by opaque id and returns null otherwise", async () => {
    const provider = getReportsProvider();
    const all = await provider.listReports({ category: "ALL", period: "30d" });
    const first = all.items[0];
    expect(first).toBeDefined();
    if (!first) return;
    const report = await provider.getReportById(first.id);
    expect(report?.id).toBe(first.id);
    expect(await provider.getReportById("rpt_mock_inexistente")).toBeNull();
  });

  it("derives community stats from the filtered fixtures", async () => {
    const stats = await getOverviewProvider().getCommunityStats({
      category: "ALL",
      period: "30d",
    });
    const page = await getReportsProvider().listReports({
      category: "ALL",
      period: "30d",
      limit: 50,
    });
    expect(stats.published_reports_count).toBe(page.items.length);
    expect(stats.distinct_zones_count).toBeGreaterThan(0);
  });
});
