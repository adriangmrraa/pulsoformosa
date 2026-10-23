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
      ? `${base} fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 w-auto bg-accent-agua text-background shadow-lg shadow-navy/50 md:hidden`
      : `${base} bg-accent-agua text-background hover:bg-accent-agua/90`;

  return (
    <Link href="/reportar" className={styles}>
      {REPORT_CTA}
    </Link>
  );
}
