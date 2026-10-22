// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  formatAbsoluteART,
  formatRelativeAge,
  formatTimeART,
} from "@/lib/domain/time";

describe("ART time formatting", () => {
  it("converts a UTC ISO timestamp to ART", () => {
    expect(formatAbsoluteART("2026-10-20T21:00:00.000Z")).toBe(
      "20/10/2026 18:00 ART",
    );
    expect(formatTimeART("2026-10-20T21:00:00.000Z")).toBe("18:00 ART");
  });

  it("handles the midnight-crossing case (§25)", () => {
    expect(formatAbsoluteART("2026-10-21T02:30:00.000Z")).toBe(
      "20/10/2026 23:30 ART",
    );
    expect(formatAbsoluteART("2026-10-21T03:00:00.000Z")).toBe(
      "21/10/2026 00:00 ART",
    );
  });

  it("returns Sin dato for invalid timestamps", () => {
    expect(formatAbsoluteART("not-a-date")).toBe("Sin dato");
  });

  it("formats relative age", () => {
    const now = new Date("2026-10-22T12:00:00.000Z");
    expect(formatRelativeAge("2026-10-22T11:59:30.000Z", now)).toBe(
      "hace un momento",
    );
    expect(formatRelativeAge("2026-10-22T11:30:00.000Z", now)).toBe("hace 30 min");
    expect(formatRelativeAge("2026-10-22T09:00:00.000Z", now)).toBe("hace 3 h");
    expect(formatRelativeAge("2026-10-21T09:00:00.000Z", now)).toBe("hace 1 día");
    expect(formatRelativeAge("2026-10-19T09:00:00.000Z", now)).toBe("hace 3 días");
  });

  it("never returns a negative age for a future timestamp", () => {
    const now = new Date("2026-10-22T12:00:00.000Z");
    expect(formatRelativeAge("2026-10-22T13:00:00.000Z", now)).toBe(
      "hace un momento",
    );
  });
});
