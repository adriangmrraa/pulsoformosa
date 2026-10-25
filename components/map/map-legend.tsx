import { MAP_LEGEND, STATUS_OPEN, STATUS_SOLVED } from "@/lib/domain/microcopy";

/** §8.6.1-derived legend: open/solved pin colors + the unverified disclaimer. */
export function MapLegend() {
  return (
    <div
      role="group"
      aria-label="Leyenda del mapa"
      className="text-xs text-text-secondary"
    >
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full bg-alerta-alta"
          />
          {STATUS_OPEN}
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full bg-accent-green"
          />
          {STATUS_SOLVED}
        </li>
      </ul>
      <p className="mt-1 font-medium">{MAP_LEGEND}</p>
    </div>
  );
}
