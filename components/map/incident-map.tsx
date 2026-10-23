import type { PublicReportPoint } from "@/lib/domain/report";
import { MapLegend } from "./map-legend";
import { MapLibreMount } from "./map-libre-mount";

interface IncidentMapProps {
  reports: PublicReportPoint[];
  center: [number, number];
  bounds?: { minLon: number; minLat: number; maxLon: number; maxLat: number };
}

export function IncidentMap({ reports, center }: IncidentMapProps) {
  return (
    <section
      aria-labelledby="mapa-title"
      className="relative overflow-hidden border-y border-border/70 bg-card/35 py-5 sm:py-6"
    >
      <div className="px-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-accent-agua uppercase">territorio</p>
            <h2 id="mapa-title" className="mt-1 text-2xl font-semibold tracking-tight">
              Mapa de reportes
            </h2>
          </div>
          <p className="text-xs text-text-secondary">
            {reports.length} reportes visibles en esta vista · centro{" "}
            {center[1]}, {center[0]}
          </p>
        </div>
      </div>

      <div className="mt-5 h-[340px] border-y border-border/60 bg-surface/35 md:h-[480px]">
        <MapLibreMount />
      </div>

      <div className="mt-4 px-4 sm:px-6">
        <MapLegend />
      </div>
    </section>
  );
}
