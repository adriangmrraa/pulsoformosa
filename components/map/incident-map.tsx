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
 * Map hero: bounded to the published reports, ~52dvh so the detail panel is
 * visible without scrolling. The MapLibre canvas is client-only; the overlay
 * texture lives on .map-hero-frame::after — ancestors animate opacity only
 * (iOS Safari WebGL incident rule, INCIDENTE-MAPA-iOS-SAFARI.md).
 */
export function IncidentMap({
  pins,
  bounds,
  selectedId,
  onSelect,
}: IncidentMapProps) {
  return (
    <section
      aria-label="Mapa de reportes"
      className="map-hero-frame relative border-y border-border/70 bg-surface/35"
    >
      <div className="h-[52dvh] min-h-[320px] w-full">
        <MapCanvas
          pins={pins}
          bounds={bounds}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
      <div className="border-t border-border/60 px-4 py-2.5 sm:px-6">
        <MapLegend />
      </div>
    </section>
  );
}
