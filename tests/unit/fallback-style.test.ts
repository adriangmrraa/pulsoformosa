// @vitest-environment node
import { describe, expect, it } from "vitest";
import { FORMOSA_BBOX } from "@/lib/domain/geo";
import { FALLBACK_MAP_STYLE } from "@/lib/maps/fallback-style";

describe("FALLBACK_MAP_STYLE", () => {
  it("is a self-contained MapLibre style (no network fetches)", () => {
    expect(FALLBACK_MAP_STYLE.version).toBe(8);
    const serialized = JSON.stringify(FALLBACK_MAP_STYLE);
    expect(serialized).not.toMatch(/https?:\/\//);
    // No glyphs/sprite URLs: the fallback draws geometry only.
    expect(FALLBACK_MAP_STYLE).not.toHaveProperty("glyphs");
    expect(FALLBACK_MAP_STYLE).not.toHaveProperty("sprite");
  });

  it("paints a background and the Formosa provincial outline", () => {
    const types = FALLBACK_MAP_STYLE.layers.map((layer) => layer.type);
    expect(types).toContain("background");
    expect(types).toContain("line");
  });

  it("traces the exact FORMOSA_BBOX extent", () => {
    const serialized = JSON.stringify(FALLBACK_MAP_STYLE);
    for (const corner of [
      FORMOSA_BBOX.minLon,
      FORMOSA_BBOX.minLat,
      FORMOSA_BBOX.maxLon,
      FORMOSA_BBOX.maxLat,
    ]) {
      expect(serialized).toContain(String(corner));
    }
  });
});
