// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getStore,
  JsonReportStore,
  resetStoreForTests,
  StoreUnavailableError,
} from "@/lib/server/store";

const originalLabel = process.env.PUBLIC_ENVIRONMENT_LABEL;
const originalUrl = process.env.DATABASE_URL;

let dataDir: string;

function restoreEnv() {
  if (originalLabel === undefined) {
    delete process.env.PUBLIC_ENVIRONMENT_LABEL;
  } else {
    process.env.PUBLIC_ENVIRONMENT_LABEL = originalLabel;
  }
  if (originalUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalUrl;
  }
}

beforeEach(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), "pulso-env-gate-"));
  vi.stubEnv("PULSO_DATA_DIR", dataDir);
  vi.stubEnv("PULSO_SEED_DEMO", "1");
  delete process.env.DATABASE_URL;
  vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
  resetStoreForTests();
});

afterEach(() => {
  resetStoreForTests();
  restoreEnv();
  vi.unstubAllEnvs();
  rmSync(dataDir, { recursive: true, force: true });
});

describe("production gate", () => {
  it("refuses the JSON store under PUBLIC_ENVIRONMENT_LABEL=production", async () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "production");
    await expect(getStore()).rejects.toThrow(StoreUnavailableError);
    expect(() => new JsonReportStore(dataDir)).toThrow(
      StoreUnavailableError,
    );
  });

  it("honours trimmed, case-insensitive labels", async () => {
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "  PRODUCTION  ");
    await expect(getStore()).rejects.toThrow(StoreUnavailableError);
  });

  it("serves the json backend in development without DATABASE_URL", async () => {
    const store = await getStore();
    expect(store.backend).toBe("json");
  });
});

describe("json store report filtering (seeded demo data)", () => {
  it("filters by category and respects the page size", async () => {
    const page = await getStore().then((store) =>
      store.listReports({ category: "WATER", period: "30d" }),
    );
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((item) => item.category === "WATER")).toBe(true);
    expect(page.pageSize).toBeLessThanOrEqual(12);
  });

  it("returns a cursor when more pages exist", async () => {
    const page = await getStore().then((store) =>
      store.listReports({ category: "ALL", period: "30d", limit: 5 }),
    );
    expect(page.items).toHaveLength(5);
    expect(page.nextCursor).toBe("cur_5");
  });

  it("finds a report by opaque id and returns null otherwise", async () => {
    const store = await getStore();
    const all = await store.listReports({ category: "ALL", period: "30d" });
    const first = all.items[0];
    expect(first).toBeDefined();
    if (!first) return;
    const report = await store.getReportById(first.id);
    expect(report?.id).toBe(first.id);
    expect(await store.getReportById("rpt_mock_inexistente")).toBeNull();
  });
});

describe("public-only report reads", () => {
  it("returns null for a hidden report", async () => {
    const store = await getStore();
    expect(await store.getReportById("rpt_mock_h1dd3n")).toBeNull();
  });

  it("never lists non-public editorial statuses", async () => {
    const page = await getStore().then((store) =>
      store.listReports({ category: "ALL", period: "30d", limit: 50 }),
    );
    expect(page.items.some((item) => item.id === "rpt_mock_h1dd3n")).toBe(false);
  });
});
