// §11.2 public report contracts — the seed C2/C4 type against.
import type { EditorialStatus, LocationMethod, ReportCategory } from "./taxonomy";
import { formatAbsoluteART } from "./time";

export { EDITORIAL_LABELS } from "./taxonomy";

export interface PhotoRef {
  thumb_url: string;
  alt: string;
}

export interface SourceRef {
  label: string;
  url: string;
}

export interface PublicReportPoint {
  id: string;
  category: ReportCategory;
  geometry: { type: "Point"; coordinates: [number, number] }; // [lon, lat] EPSG:4326
  approx_zone: string | null;
  published_at: string;
  editorial_status: EditorialStatus;
}

export interface PublicReportCard extends PublicReportPoint {
  created_at: string;
  subtype: string | null;
  summary: string; // sanitized
  photos: PhotoRef[];
  updated_at: string;
  sources: SourceRef[];
}

export interface PublicReport extends PublicReportCard {
  description: string; // full sanitized body
  location_method: LocationMethod | null;
}

export interface ShareTextInput {
  when: string;
  visibleReports: number;
  zones: number;
  periodLabel: string;
  url: string;
}

/** §11.4 exportable summary format. Callers supply real counts only. */
export function buildReportShareText({
  when,
  visibleReports,
  zones,
  periodLabel,
  url,
}: ShareTextInput): string {
  return [
    "Formosa",
    formatAbsoluteART(when),
    `${visibleReports} reportes visibles en ${periodLabel}`,
    `${zones} zonas con reportes`,
    "datos aportados por usuarios no verificados",
    url,
  ].join(" · ");
}
