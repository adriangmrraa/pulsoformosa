"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PublicReport } from "@/lib/domain/report";
import {
  CATEGORY_LABELS,
  EDITORIAL_LABELS,
} from "@/lib/domain/taxonomy";
import {
  NO_PHOTO,
  REPORT_PENDING_LINE,
} from "@/lib/domain/microcopy";
import { formatAbsoluteART } from "@/lib/domain/time";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SourceLink } from "./source-link";
import { ShareCopyButton } from "./share-copy-button";

interface IncidentDetailSheetProps {
  report: PublicReport | null;
  open: boolean;
  onClose?: () => void;
}

export function IncidentDetailSheet({
  report,
  open,
  onClose,
}: IncidentDetailSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function sharePath(): string {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose?.();
          const params = new URLSearchParams(searchParams.toString());
          params.delete("reporte");
          const query = params.toString();
          router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
          });
        }
      }}
    >
      {report ? (
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {CATEGORY_LABELS[report.category]} ·{" "}
              {report.approx_zone ?? "Barrio sin identificar"}
            </DialogTitle>
            <DialogDescription>
              {EDITORIAL_LABELS[report.editorial_status]}
            </DialogDescription>
            <DevMockBadge />
          </DialogHeader>

          {report.editorial_status === "PENDING_REVIEW" ? (
            <p className="rounded-lg bg-surface p-2 text-xs text-text-secondary">
              {REPORT_PENDING_LINE}
            </p>
          ) : null}

          {report.editorial_status === "HIDDEN" ||
          report.editorial_status === "REJECTED" ? (
            <p className="rounded-lg bg-surface p-2 text-sm">
              Este reporte no está disponible públicamente.
            </p>
          ) : null}

          <p className="text-sm text-text">{report.description}</p>

          <dl className="grid grid-cols-1 gap-1 text-xs text-text-secondary sm:grid-cols-2">
            <div>
              <dt className="inline">Enviado: </dt>
              <dd className="inline">{formatAbsoluteART(report.created_at)}</dd>
            </div>
            <div>
              <dt className="inline">Publicado: </dt>
              <dd className="inline">{formatAbsoluteART(report.published_at)}</dd>
            </div>
            <div>
              <dt className="inline">Última modificación: </dt>
              <dd className="inline">{formatAbsoluteART(report.updated_at)}</dd>
            </div>
            <div>
              <dt className="inline">Precisión: </dt>
              <dd className="inline">Punto aproximado · {report.location_method ?? "sin método"}</dd>
            </div>
            <div>
              <dt className="inline">Subtipo: </dt>
              <dd className="inline">{report.subtype ?? "sin subtipo"}</dd>
            </div>
            <div>
              <dt className="inline">Zona: </dt>
              <dd className="inline">{report.approx_zone ?? "sin identificar"}</dd>
            </div>
          </dl>

          <div className="rounded-lg border border-dashed border-border bg-surface/50 p-3 text-xs text-text-secondary">
            {report.photos.length === 0
              ? NO_PHOTO
              : `${report.photos.length} foto(s) saneada(s)`}
          </div>

          {report.sources.length > 0 ? (
            <div className="space-y-1">
              {report.sources.map((source) => (
                <SourceLink key={source.url} href={source.url} label={source.label} />
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
            <ShareCopyButton
              path={sharePath()}
              text={`${report.summary} · Formosa`}
              label="Copiar enlace de este reporte"
            />
            <ShareCopyButton
              path={sharePath()}
              text={`${report.summary} · Formosa`}
              label="Compartir"
            />
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reporte no disponible</DialogTitle>
            <DialogDescription>
              El enlace puede estar incompleto o el reporte ya no está visible.
              Podés seguir usando la lista y los filtros.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      )}
    </Dialog>
  );
}
