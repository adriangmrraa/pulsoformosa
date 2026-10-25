import type { DerivedReportStatus } from "@/lib/domain/solution";
import { STATUS_OPEN, STATUS_SOLVED } from "@/lib/domain/microcopy";

export interface MapPin {
  id: string;
  lon: number;
  lat: number;
  status: DerivedReportStatus;
  /** Full accessible label, e.g. "Reporte rpt_mock_9f3a1b — Abierto". */
  label: string;
}

export function pinLabel(
  reportId: string,
  status: DerivedReportStatus,
): string {
  return `Reporte ${reportId} — ${status === "solved" ? STATUS_SOLVED : STATUS_OPEN}`;
}
