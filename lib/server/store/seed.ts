import type { Solution } from "@/lib/domain/solution";
import {
  FIXTURE_ZONES,
  HIDDEN_REPORT_FIXTURE,
  REPORTS_FIXTURE,
} from "@/tests/fixtures/reports.fixture";
import { SOLUTIONS_FIXTURE } from "@/tests/fixtures/solutions.fixture";
import type { ModerationEvent, StoredReport } from "./types";

export { FIXTURE_ZONES };

export function zoneLabelForId(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return FIXTURE_ZONES.find((zone) => zone.id === id)?.label;
}

export interface SeedData {
  reports: StoredReport[];
  solutions: Solution[];
  moderation_events: ModerationEvent[];
}

/**
 * Initial content for a brand-new JSON store (PULSO_SEED_DEMO != "0"): the
 * demo report/solution set becomes real persisted rows — written once to
 * store.json and mutated like any other record afterwards. Disabled via
 * PULSO_SEED_DEMO=0 so tests can start from an empty store.
 */
export function buildSeedData(): SeedData {
  return {
    // The hidden fixture ships too: reads must keep filtering it out, which
    // the public-only coverage proves on every run.
    reports: [...REPORTS_FIXTURE, HIDDEN_REPORT_FIXTURE].map((report) => ({
      ...report,
      submission_id: null,
    })),
    solutions: SOLUTIONS_FIXTURE.map((solution) => ({ ...solution })),
    moderation_events: [],
  };
}
