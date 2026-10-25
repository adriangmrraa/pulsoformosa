// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MockProviderInProductionError,
  getReportsProvider,
} from "@/lib/providers";

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
    expect(() => getReportsProvider()).toThrow(MockProviderInProductionError);
  });

  it("honours trimmed, case-insensitive labels", () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "  PRODUCTION  ");
    expect(() => getReportsProvider()).toThrow(MockProviderInProductionError);
  });

  it("serves the mock providers in development", () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
    expect(getReportsProvider().sourceKind).toBe("fixture");
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
});

describe("public-only report reads", () => {
  beforeEach(() => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
  });

  afterEach(() => {
    restoreEnv();
    vi.unstubAllEnvs();
  });

  it("returns null for a hidden report", async () => {
    const provider = getReportsProvider();
    const hidden = await provider.getReportById("rpt_mock_h1dd3n");
    expect(hidden).toBeNull();
  });

  it("never lists non-public editorial statuses", async () => {
    const page = await getReportsProvider().listReports({
      category: "ALL",
      period: "30d",
      limit: 50,
    });
    expect(page.items.some((item) => item.id === "rpt_mock_h1dd3n")).toBe(false);
  });
});
