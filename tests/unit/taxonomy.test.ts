// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  EDITORIAL_LABELS,
  EDITORIAL_STATUSES,
  GEOMETRY_MODES,
  REPORT_CATEGORIES,
  REPORT_SOURCES,
  SLUG_OF_CATEGORY,
  SUBTYPES,
  categoryFromSlug,
} from "@/lib/domain/taxonomy";

describe("taxonomy", () => {
  it("keeps the four stable categories in spec order", () => {
    expect(REPORT_CATEGORIES).toEqual([
      "WATER",
      "ROADS",
      "UTILITIES",
      "ENVIRONMENT_OTHER",
    ]);
  });

  it("keeps the six editorial states", () => {
    expect(EDITORIAL_STATUSES).toEqual([
      "PENDING_REVIEW",
      "PUBLISHED_UNVERIFIED",
      "VERIFIED_EDITORIALLY",
      "HIDDEN",
      "REJECTED",
      "ARCHIVED",
    ]);
  });

  it("keeps the three geometry modes and two report sources", () => {
    expect(GEOMETRY_MODES).toEqual([
      "POINT",
      "STREET_SEGMENT",
      "APPROXIMATE_AREA",
    ]);
    expect(REPORT_SOURCES).toEqual(["CITIZEN", "PROVIDER"]);
  });

  it("maps every category to a label and a non-empty subtype list", () => {
    for (const category of REPORT_CATEGORIES) {
      expect(CATEGORY_LABELS[category].length).toBeGreaterThan(0);
      expect(SUBTYPES[category].length).toBeGreaterThan(0);
    }
    expect(SUBTYPES.WATER.at(-1)).toBe("otro");
    expect(SUBTYPES.ROADS.at(-1)).toBe("otro");
    expect(SUBTYPES.UTILITIES.at(-1)).toBe("otro");
    expect(SUBTYPES.ENVIRONMENT_OTHER).toHaveLength(4);
    expect(SUBTYPES.ENVIRONMENT_OTHER.at(-1)).toBe(
      "problema ambiental o infraestructura barrial",
    );
  });

  it("roundtrips slug to category and back", () => {
    for (const category of REPORT_CATEGORIES) {
      const slug = SLUG_OF_CATEGORY[category];
      expect(CATEGORY_SLUGS[slug]).toBe(category);
      expect(categoryFromSlug(slug)).toBe(category);
    }
    expect(categoryFromSlug("todos")).toBe("ALL");
  });

  it("labels the default editorial status verbatim", () => {
    expect(EDITORIAL_LABELS.PUBLISHED_UNVERIFIED).toBe(
      "Reportado por un vecino — no verificado",
    );
    expect(EDITORIAL_LABELS.VERIFIED_EDITORIALLY).toBe("Corroborado");
    expect(EDITORIAL_LABELS.HIDDEN).toBe("No disponible");
  });
});
