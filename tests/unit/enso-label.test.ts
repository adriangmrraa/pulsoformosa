// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  ENSO_DISCLAIMER,
  ENSO_PHASE_LABELS,
  ENSO_PHASES,
  hasForbiddenEnsoClaim,
} from "@/lib/domain/enso";

describe("ENSO copy", () => {
  it("labels all four phases verbatim", () => {
    expect(ENSO_PHASE_LABELS.EL_NINO).toBe("El Niño activo");
    expect(ENSO_PHASE_LABELS.NEUTRAL).toBe("Neutral");
    expect(ENSO_PHASE_LABELS.LA_NINA).toBe("La Niña");
    expect(ENSO_PHASE_LABELS.UNKNOWN).toBe("Sin información actual");
    expect(ENSO_PHASES).toHaveLength(4);
  });

  it("carries the mandatory disclaimer verbatim", () => {
    expect(ENSO_DISCLAIMER).toBe(
      "Probabilidad de fase El Niño: no representa probabilidad de inundación en tu barrio.",
    );
  });

  it("does not ship forbidden local-flood phrasing", () => {
    expect(hasForbiddenEnsoClaim(ENSO_DISCLAIMER)).toBe(false);
    for (const label of Object.values(ENSO_PHASE_LABELS)) {
      expect(hasForbiddenEnsoClaim(label)).toBe(false);
    }
  });

  it("flags the claims §12.3 forbids", () => {
    expect(hasForbiddenEnsoClaim("100% de El Niño en Formosa")).toBe(true);
    expect(hasForbiddenEnsoClaim("El Niño va a inundar tu barrio")).toBe(true);
    expect(hasForbiddenEnsoClaim("inundación inminente")).toBe(true);
    expect(hasForbiddenEnsoClaim("llega el Niño a tu casa")).toBe(true);
  });
});
