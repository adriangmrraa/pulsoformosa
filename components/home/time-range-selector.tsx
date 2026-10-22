"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TimeRange } from "@/lib/domain/types";
import { PERIOD_LABELS } from "@/lib/domain/microcopy";

const RANGES: TimeRange[] = ["24h", "7d", "30d"];

interface TimeRangeSelectorProps {
  value: TimeRange;
}

export function TimeRangeSelector({ value }: TimeRangeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(range: TimeRange) {
    const params = new URLSearchParams(searchParams.toString());
    if (range === "7d") {
      params.delete("periodo");
    } else {
      params.set("periodo", range);
    }
    params.delete("cursor");
    params.delete("reporte");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div role="radiogroup" aria-label="Período" className="flex flex-wrap gap-2">
      {RANGES.map((range) => {
        const checked = range === value;
        return (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => select(range)}
            className={[
              "min-h-11 rounded-full border px-3.5 text-sm transition-ui",
              checked
                ? "border-accent-lluvia bg-accent-lluvia text-background"
                : "border-border bg-surface text-text-secondary hover:bg-muted",
            ].join(" ")}
          >
            {PERIOD_LABELS[range]}
          </button>
        );
      })}
    </div>
  );
}
