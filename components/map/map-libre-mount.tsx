"use client";

/**
 * Seam for C1B-b (DEC-01): C1 renders a labelled placeholder. The real
 * MapLibre view will be swapped in here through next/dynamic with ssr:false;
 * call sites (IncidentMap) never change. No tiles, no invented streets.
 */
export function MapLibreMount() {
  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center">
      <p className="max-w-sm text-sm font-medium text-text">
        Mapa de reportes — próximamente con cartografía provincial
      </p>
      <p className="max-w-sm text-xs text-text-secondary">
        Mientras tanto, la lista accesible tiene todos los reportes del período.
      </p>
      <a
        href="#lista-reportes"
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium transition-ui hover:bg-muted"
      >
        Ver la lista de reportes
      </a>
    </div>
  );
}
