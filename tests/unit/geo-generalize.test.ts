import { describe, expect, it } from "vitest";
import {
  GENERALIZATION_STEP_DEG,
  generalizeCoordinate,
} from "@/lib/domain/geo";

describe("generalizeCoordinate", () => {
  it("snaps both axes onto the ~250 m grid", () => {
    const generalized = generalizeCoordinate(-26.1849, -58.1731);
    for (const value of [generalized.lat, generalized.lon]) {
      const cells = value / GENERALIZATION_STEP_DEG;
      expect(Math.abs(cells - Math.round(cells))).toBeLessThan(1e-9);
    }
  });

  it("moves the point at most ~140 m per axis", () => {
    const generalized = generalizeCoordinate(-26.1849, -58.1731);
    expect(Math.abs(generalized.lat - -26.1849)).toBeLessThanOrEqual(
      GENERALIZATION_STEP_DEG / 2 + 1e-9,
    );
    expect(Math.abs(generalized.lon - -58.1731)).toBeLessThanOrEqual(
      GENERALIZATION_STEP_DEG / 2 + 1e-9,
    );
  });

  it("is stable: generalizing twice returns the same cell", () => {
    const once = generalizeCoordinate(-26.1855, -58.1722);
    expect(generalizeCoordinate(once.lat, once.lon)).toEqual(once);
  });

  it("collapses nearby points into the same cell", () => {
    const a = generalizeCoordinate(-26.1849, -58.1731);
    const b = generalizeCoordinate(-26.18551, -58.17349);
    expect(a).toEqual(b);
  });

  it("is deterministic across calls (no jitter disclosure)", () => {
    expect(generalizeCoordinate(-26.1849, -58.1731)).toEqual(
      generalizeCoordinate(-26.1849, -58.1731),
    );
  });
});
