import Link from "next/link";
import { EMPTY_REPORTS, REPORT_CTA } from "@/lib/domain/microcopy";

export function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
      <p className="text-sm text-text-secondary">{EMPTY_REPORTS}</p>
      <Link
        href="/reportar"
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent-agua px-4 text-sm font-semibold text-background transition-ui"
      >
        {REPORT_CTA}
      </Link>
    </div>
  );
}
