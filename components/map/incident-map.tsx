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
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="mapa-title" className="text-lg font-semibold">
          Mapa de reportes
        </h2>
        <p className="text-xs text-text-secondary">
          {reports.length} reportes visibles en esta vista · centro{" "}
          {center[1]}, {center[0]}
        </p>
      </div>

      <div className="mt-3 h-[340px] md:h-[480px]">
        <MapLibreMount />
      </div>

      <div className="mt-3">
        <MapLegend />
      </div>
    </section>
  );
}
