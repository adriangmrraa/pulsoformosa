// §15.11 normalized contracts — field names are verbatim from the product spec.
import type { ReportCategory } from "./taxonomy";
import type { PublicReport } from "./report";

export type TimeRange = "24h" | "7d" | "30d";
export type { CategorySlug } from "./taxonomy";

export interface ReportQuery {
  zona?: string;
  category: ReportCategory | "ALL";
  subtype?: string;
  period: TimeRange;
  cursor?: string;
  limit?: number;
}

export interface ReportListPage {
  items: PublicReport[];
  nextCursor: string | null;
  pageSize: number;
  /** Total matching rows across every page — feeds the public count line. */
  total: number;
}
