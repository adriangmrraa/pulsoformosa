import { MAP_LEGEND } from "@/lib/domain/microcopy";
import type { ReportCategory } from "@/lib/domain/taxonomy";
import { CATEGORY_LABELS } from "@/lib/domain/taxonomy";

interface MapLegendProps {
  items?: { category: ReportCategory; label: string }[];
}

const DEFAULT_ITEMS: { category: ReportCategory; label: string }[] = (
  ["WATER", "ROADS", "UTILITIES", "ENVIRONMENT_OTHER"] as ReportCategory[]
).map((category) => ({ category, label: CATEGORY_LABELS[category] }));

const DOT_CLASS: Record<ReportCategory, string> = {
  WATER: "bg-accent-agua",
  ROADS: "bg-accent-lluvia",
  UTILITIES: "bg-alerta-moderada",
  ENVIRONMENT_OTHER: "bg-exito",
};

export function MapLegend({ items = DEFAULT_ITEMS }: MapLegendProps) {
  return (
    <div role="group" aria-label="Leyenda del mapa" className="text-xs text-text-secondary">
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item) => (
          <li key={item.category} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`inline-block size-2.5 rounded-full ${DOT_CLASS[item.category]}`}
            />
            {item.label}
          </li>
        ))}
      </ul>
      <p className="mt-1 font-medium">{MAP_LEGEND}</p>
    </div>
  );
}
