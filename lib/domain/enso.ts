import type { EnsoPhase } from "./types";
import { ENSO_DISCLAIMER } from "./microcopy";

export { ENSO_DISCLAIMER };

export const ENSO_PHASE_LABELS: Record<EnsoPhase, string> = {
  EL_NINO: "El Niño activo",
  NEUTRAL: "Neutral",
  LA_NINA: "La Niña",
  UNKNOWN: "Sin información actual",
};

export const ENSO_PHASES: readonly EnsoPhase[] = [
  "EL_NINO",
  "NEUTRAL",
  "LA_NINA",
  "UNKNOWN",
];

const FORBIDDEN_ENSO_CLAIMS: readonly RegExp[] = [
  /100\s*%\s*de\s*El\s*Ni[ñn]o\s*en\s*Formosa/i,
  /El\s*Ni[ñn]o\s+(?:va\s+a\s+|llega\s+a\s+)?inundar/i,
  /inundaci[oó]n\s+inminente/i,
  /llega\s+el\s*Ni[ñn]o\s+a\s+tu\s+casa/i,
];

/**
 * §12.3 guard: ENSO is a seasonal ocean-atmosphere context, never a local
 * flood probability. Returns true when copy crosses that line.
 */
export function hasForbiddenEnsoClaim(text: string): boolean {
  return FORBIDDEN_ENSO_CLAIMS.some((pattern) => pattern.test(text));
}
