"use client";

import dynamic from "next/dynamic";
import { MapLegend } from "./map-legend";
import type { MapPin } from "./map-pins";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-text-secondary">
      Cargando mapa…
    </div>
  ),
});

interface IncidentMapProps {
  pins: MapPin[];
  bounds: [[number, number], [number, number]];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Map hero: compact bounded frame (demobondis home-map-frame pattern) so the
 * selected report card stays above the fold. The MapLibre canvas is
 * client-only; the overlay texture lives on .map-hero-frame::after — ancestors
 * animate opacity only (iOS Safari WebGL incident rule,
 * INCIDENTE-MAPA-iOS-SAFARI.md).
 */
export function IncidentMap({
  pins,
  bounds,
  selectedId,
  onSelect,
}: IncidentMapProps) {
  return (
    <section aria-label="Mapa de reportes" className="container-page">
      <div className="map-hero-frame relative overflow-hidden rounded-3xl border border-border/70 bg-surface/35">
        <div className="h-[190px] w-full sm:h-[240px] lg:h-[300px]">
          <MapCanvas
            pins={pins}
            bounds={bounds}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
        <div className="border-t border-border/60 px-3 py-1.5">
          <MapLegend />
        </div>
      </div>
    </section>
  );
}
