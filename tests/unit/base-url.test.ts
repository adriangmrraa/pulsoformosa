// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppBaseUrl } from "@/lib/site";

const originalBase = process.env.APP_BASE_URL;
const originalLabel = process.env.PUBLIC_ENVIRONMENT_LABEL;

afterEach(() => {
  vi.unstubAllEnvs();
  if (originalBase === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = originalBase;
  if (originalLabel === undefined) delete process.env.PUBLIC_ENVIRONMENT_LABEL;
  else process.env.PUBLIC_ENVIRONMENT_LABEL = originalLabel;
});

describe("getAppBaseUrl", () => {
  it("uses the configured origin and strips paths", () => {
    vi.stubEnv("APP_BASE_URL", "https://pulso.example.test/sub/path");
    expect(getAppBaseUrl()).toBe("https://pulso.example.test");
  });

  it("rejects non-http protocols", () => {
    vi.stubEnv("APP_BASE_URL", "file:///etc/passwd");
    expect(() => getAppBaseUrl()).toThrow(/http/);
  });

  it("rejects malformed URLs", () => {
    vi.stubEnv("APP_BASE_URL", "not a url");
    expect(() => getAppBaseUrl()).toThrow(/absolute/);
  });

  it("requires APP_BASE_URL in production", () => {
    delete process.env.APP_BASE_URL;
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "production");
    expect(() => getAppBaseUrl()).toThrow(/required/);
  });

  it("falls back to loopback only in development", () => {
    delete process.env.APP_BASE_URL;
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
    expect(getAppBaseUrl()).toBe("http://127.0.0.1:3000");
  });
});
