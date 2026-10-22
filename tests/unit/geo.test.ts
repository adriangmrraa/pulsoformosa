// @vitest-environment node
import { describe, expect, it } from "vitest";
import { FORMOSA_BBOX, isInsideFormosaBBox } from "@/lib/domain/geo";

describe("isInsideFormosaBBox", () => {
  it("accepts Formosa Capital", () => {
    expect(isInsideFormosaBBox(-26.18, -58.18)).toBe(true);
  });

  it("accepts a point inside the documented bbox", () => {
    expect(isInsideFormosaBBox(-24.9, -60.0)).toBe(true);
  });

  it("rejects a point far outside (Buenos Aires)", () => {
    expect(isInsideFormosaBBox(-34.6, -58.4)).toBe(false);
  });

  it("rejects non-finite coordinates", () => {
    expect(isInsideFormosaBBox(Number.NaN, -58.18)).toBe(false);
    expect(isInsideFormosaBBox(-26.18, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("applies the tolerance band just outside the border", () => {
    const justBelow = FORMOSA_BBOX.minLat - 0.05; // ~5.5 km south
    expect(isInsideFormosaBBox(justBelow, -58.18, 0)).toBe(false);
    expect(isInsideFormosaBBox(justBelow, -58.18, 15_000)).toBe(true);

    const farBelow = FORMOSA_BBOX.minLat - 1; // ~111 km south
    expect(isInsideFormosaBBox(farBelow, -58.18, 15_000)).toBe(false);
  });
});
