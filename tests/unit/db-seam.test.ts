// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalUrl = process.env.DATABASE_URL;

describe("db seam", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalUrl;
    }
  });

  it("can be imported without opening a connection", async () => {
    const mod = await import("@/lib/db");
    expect(typeof mod.getDb).toBe("function");
    expect(typeof mod.db).toBe("object");
  });

  it("throws lazily when DATABASE_URL is absent", async () => {
    const { getDb } = await import("@/lib/db");
    expect(() => getDb()).toThrow(/DATABASE_URL/);
  });

  it("reports unhealthy when the connection is not configured", async () => {
    const { checkDatabaseHealth } = await import("@/lib/db/health");
    await expect(checkDatabaseHealth()).resolves.toBe(false);
  });
});
