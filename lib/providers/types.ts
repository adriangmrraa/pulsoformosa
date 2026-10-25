import type { ReportListPage, ReportQuery } from "@/lib/domain/types";
import type { PublicReport } from "@/lib/domain/report";

export type ProviderSourceKind = "fixture" | "live";

/**
 * Exact seam C2/C4 swap for live providers. Components never know whether
 * data came from fixtures or a live source.
 */
export interface ReportsProvider {
  readonly sourceKind: ProviderSourceKind;
  listReports(q: ReportQuery): Promise<ReportListPage>;
  getReportById(id: string): Promise<PublicReport | null>;
}
