import type { Metadata } from "next";
import { ReportForm } from "@/components/reports/report-form";
import { REPORT_FORM_TITLE } from "@/lib/domain/microcopy";
import { SITE_NAME } from "@/lib/site";
import { HydrationMarker } from "@/components/ui/hydration-marker";

export const metadata: Metadata = {
  title: `Reportar un problema — ${SITE_NAME}`,
  description:
    "Enviá un reporte anónimo sobre agua, calles, servicios o ambiente en Formosa. Sin registro y sin datos personales.",
};

export default function ReportarPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <HydrationMarker />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {REPORT_FORM_TITLE}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Contanos qué pasa. Tu reporte queda en revisión antes de publicarse y
          se muestra con una ubicación aproximada. No es un canal de
          emergencias.
        </p>
      </div>

      <div className="mt-6 max-w-2xl">
        <ReportForm />
      </div>
    </div>
  );
}
