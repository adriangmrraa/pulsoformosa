import Link from "next/link";
import { REPORT_CTA } from "@/lib/domain/microcopy";

interface ReportCTAProps {
  variant?: "header" | "sticky-mobile";
}

export function ReportCTA({ variant = "header" }: ReportCTAProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-ui";
  const styles =
    variant === "sticky-mobile"
      ? `${base} pb-safe fixed inset-x-4 bottom-0 z-40 bg-accent-agua text-foreground shadow-lg md:hidden`
      : `${base} bg-accent-agua text-foreground hover:bg-accent-agua/90`;

  return (
    <Link href="/reportar" className={styles}>
      {REPORT_CTA}
    </Link>
  );
}
