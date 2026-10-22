"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import type { CategorySlug } from "@/lib/domain/taxonomy";
import { CATEGORY_SLUG_LIST, SUBTYPES } from "@/lib/domain/taxonomy";
import { CATEGORY_LABEL_BY_SLUG } from "@/lib/domain/microcopy";

interface FilterChipsProps {
  active: CategorySlug;
  activeSubtype?: string;
}

export function FilterChips({ active, activeSubtype }: FilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groupRef = useRef<HTMLDivElement>(null);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("cursor");
    params.delete("reporte");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function selectCategory(slug: CategorySlug) {
    if (slug !== "agua") {
      updateParam("subtipo", null);
    }
    updateParam("categoria", slug === "todos" ? null : slug);
  }

  function handleArrowKeys(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const buttons = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ??
        [],
    );
    const index = buttons.findIndex((button) => button === document.activeElement);
    if (index === -1) return;
    event.preventDefault();
    const nextIndex =
      (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
      buttons.length;
    buttons[nextIndex]?.focus();
    buttons[nextIndex]?.click();
  }

  return (
    <div className="space-y-3">
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label="Categoría"
        className="flex flex-wrap gap-2"
        onKeyDown={handleArrowKeys}
      >
        {CATEGORY_SLUG_LIST.map((slug) => {
          const checked = slug === active;
          return (
            <button
              key={slug}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => selectCategory(slug)}
              className={[
                "min-h-11 rounded-full border px-4 text-sm font-medium transition-ui",
                checked
                  ? "border-accent-agua bg-accent-agua text-background"
                  : "border-border bg-surface text-text hover:bg-muted",
              ].join(" ")}
            >
              {CATEGORY_LABEL_BY_SLUG[slug]}
            </button>
          );
        })}
      </div>

      {active === "agua" ? (
        <div
          role="radiogroup"
          aria-label="Subtipo de agua"
          className="flex flex-wrap gap-2"
        >
          {SUBTYPES.WATER.map((subtype) => {
            const checked = subtype === activeSubtype;
            return (
              <button
                key={subtype}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => updateParam("subtipo", subtype)}
                className={[
                  "min-h-11 rounded-full border px-3 text-xs font-medium transition-ui",
                  checked
                    ? "border-accent-lluvia bg-accent-lluvia text-background"
                    : "border-border bg-surface text-text-secondary hover:bg-muted",
                ].join(" ")}
              >
                {subtype}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
