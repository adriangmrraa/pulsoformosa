import type { PublicReport } from "@/lib/domain/report";
import type { Solution } from "@/lib/domain/solution";
import type { EditorialStatus, LocationMethod, ReportCategory } from "@/lib/domain/taxonomy";
import type { ReportListPage, ReportQuery } from "@/lib/domain/types";
import type { SolutionFormInput } from "@/lib/validation/solution-form";

export type StoreBackend = "pg" | "json";

/** A report row as persisted: the public shape plus the ingest bookkeeping. */
export interface StoredReport extends PublicReport {
  submission_id: string | null;
}

export interface NewReportInput {
  /** Client idempotency key — retried submissions dedupe on it. */
  submission_id: string;
  category: ReportCategory;
  subtype: string | null;
  description: string;
  expected_solution: string | null;
  /** Already generalized to the public grid by the route handler. */
  lon: number;
  lat: number;
  approx_zone: string | null;
  location_method: LocationMethod | null;
  editorial_status: EditorialStatus;
}

export type ModerationAction = "approve" | "reject";

export interface ModerationEvent {
  id: string;
  solution_id: string;
  action: ModerationAction;
  actor: string;
  reason: string;
  created_at: string;
}

/**
 * Single repository seam for every report/solution read and write. Two real
 * backends implement it: Postgres/Neon (DATABASE_URL set) and an atomic JSON
 * file store (dev + e2e fallback). No in-memory fakes — both survive restarts.
 */
export interface ReportStore {
  readonly backend: StoreBackend;
  listReports(query: ReportQuery): Promise<ReportListPage>;
  getReportById(id: string): Promise<PublicReport | null>;
  /**
   * Idempotent create: an existing row with the same submission_id returns
   * `{ created: false }` with the original report.
   */
  createReport(
    input: NewReportInput,
  ): Promise<{ report: PublicReport; created: boolean }>;
  listSolutions(reportIds: string[]): Promise<Solution[]>;
  /** Returns null when the report does not exist or is not public. */
  createSolution(
    reportId: string,
    input: SolutionFormInput,
  ): Promise<Solution | null>;
  /**
   * Flips a solution to approved/rejected and appends a moderation_events
   * audit row in the same write. Returns null for unknown ids.
   */
  moderateSolution(
    solutionId: string,
    action: ModerationAction,
    reason: string,
    actor: string,
  ): Promise<Solution | null>;
  listModerationEvents(solutionId?: string): Promise<ModerationEvent[]>;
}

/** Strips ingest bookkeeping — public reads expose only the public shape. */
export function toPublicReport(report: StoredReport): PublicReport {
  const { submission_id: _submissionId, ...publicReport } = report;
  void _submissionId;
  return publicReport;
}

export class StoreUnavailableError extends Error {
  readonly code = "STORE_UNAVAILABLE";

  constructor(message: string) {
    super(message);
    this.name = "StoreUnavailableError";
  }
}

export function newPublicId(prefix: "rpt" | "sol" | "evt"): string {
  const hex = crypto.randomUUID().replace(/-/g, "");
  return `${prefix}_${hex.slice(0, 10)}`;
}

/** Card summary: first sentence or ~140 chars of the sanitized description. */
export function summarizeDescription(description: string): string {
  const trimmed = description.trim();
  const sentenceEnd = trimmed.search(/[.!?]\s/);
  if (sentenceEnd > 0 && sentenceEnd <= 140) {
    return trimmed.slice(0, sentenceEnd + 1);
  }
  if (trimmed.length <= 140) return trimmed;
  const cut = trimmed.slice(0, 140);
  return `${cut.slice(0, cut.lastIndexOf(" ") + 1) || cut}…`;
}
