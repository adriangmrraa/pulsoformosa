import type { ReportListPage, ReportQuery } from "@/lib/domain/types";
import type { PublicReport } from "@/lib/domain/report";
import type { Solution } from "@/lib/domain/solution";

export type ProviderSourceKind = "fixture" | "live";

/**
 * Exact seam C2/C4 swap for live providers. Components never know whether
 * data came from fixtures or a live source.
 */
export interface ReportsProvider {
  readonly sourceKind: ProviderSourceKind;
  listReports(q: ReportQuery): Promise<ReportListPage>;
  getReportById(id: string): Promise<PublicReport | null>;
  /** Batch read for the panel: returns solutions (any status) for the ids. */
  listSolutions(reportIds: string[]): Promise<Solution[]>;
}
