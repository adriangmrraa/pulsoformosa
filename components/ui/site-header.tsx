import Link from "next/link";
import { RegionLabel } from "./region-label";
import { ReportCTA } from "@/components/home/report-cta";
import { REGION } from "@/lib/site";

interface SiteHeaderProps {
  title: string;
  region: string;
}

export function SiteHeader({ title, region }: SiteHeaderProps) {
  return (
    <header className="border-b border-border/60 bg-surface/80 backdrop-blur">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-col">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-text transition-ui hover:text-accent-agua"
          >
            {title}
          </Link>
          <RegionLabel city={REGION.city} province={REGION.province} />
        </div>
        <nav aria-label="Navegación principal" className="flex items-center gap-3">
          <span className="sr-only">{region}</span>
          <ReportCTA />
        </nav>
      </div>
    </header>
  );
}
