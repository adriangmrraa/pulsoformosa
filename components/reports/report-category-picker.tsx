"use client";

import { Droplets, Leaf, Route, Wrench } from "lucide-react";
import type { ReportCategory } from "@/lib/domain/taxonomy";
import { CATEGORY_LABELS, REPORT_CATEGORIES, SUBTYPES } from "@/lib/domain/taxonomy";

const ICONS: Record<ReportCategory, typeof Droplets> = {
  WATER: Droplets,
  ROADS: Route,
  UTILITIES: Wrench,
  ENVIRONMENT_OTHER: Leaf,
};

interface ReportCategoryPickerProps {
  value: ReportCategory | null;
  subtype: string | null;
  onChange: (category: ReportCategory) => void;
  onSubtypeChange: (subtype: string | null) => void;
  error?: string;
}

export function ReportCategoryPicker({
  value,
  subtype,
  onChange,
  onSubtypeChange,
  error,
}: ReportCategoryPickerProps) {
  const errorId = "category-error";

  return (
    <fieldset
      className="space-y-3"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="text-sm font-medium">Tipo de problema</legend>

      <div role="radiogroup" aria-label="Tipo de problema" className="grid gap-2 sm:grid-cols-2">
        {REPORT_CATEGORIES.map((category) => {
          const Icon = ICONS[category];
          const checked = category === value;
          return (
            <button
              key={category}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(category)}
              className={[
                "flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left transition-ui",
                checked
                  ? "border-accent-agua bg-accent-agua/10"
                  : "border-border bg-surface hover:bg-muted",
              ].join(" ")}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0 text-accent-agua" />
              <span className="text-sm font-medium">{CATEGORY_LABELS[category]}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-alerta-alta">
          {error}
        </p>
      ) : null}

      {value ? (
        <div role="radiogroup" aria-label="Subtipo" className="flex flex-wrap gap-2">
          {SUBTYPES[value].map((option) => {
            const checked = option === subtype;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onSubtypeChange(option)}
                className={[
                  "min-h-11 rounded-full border px-3 text-xs transition-ui",
                  checked
                    ? "border-accent-lluvia bg-accent-lluvia text-foreground"
                    : "border-border bg-surface text-text-secondary hover:bg-muted",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </fieldset>
  );
}
