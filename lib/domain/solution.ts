export type SolutionStatus = "pending" | "approved" | "rejected";

export interface Solution {
  id: string;
  report_id: string;
  text: string;
  evidence_note: string | null;
  evidence_url: string | null;
  author_label: string | null;
  author_anonymous: true;
  created_at: string;
  status: SolutionStatus;
}

export const SOLUTION_TEXT_MIN = 10;
export const SOLUTION_TEXT_MAX = 500;
export const SOLUTION_EVIDENCE_NOTE_MAX = 280;
export const SOLUTION_EVIDENCE_URL_MAX = 300;
export const SOLUTION_AUTHOR_LABEL_MAX = 60;

export type DerivedReportStatus = "open" | "solved";

/**
 * A report is "solved" when at least one of its solutions is approved.
 * Pending or rejected contributions never flip the state (REQ-SOL-04).
 */
export function deriveReportStatus(
  report: { id: string },
  solutions: Solution[],
): DerivedReportStatus {
  return solutions.some(
    (item) => item.report_id === report.id && item.status === "approved",
  )
    ? "solved"
    : "open";
}
