import { LegalInfoSheet } from "./legal-info-sheet";
import {
  EMERGENCY_DISCLAIMER,
  REPORT_DISCLAIMER,
} from "@/lib/domain/microcopy";

function PendingOwner() {
  return (
    <span className="mt-1 inline-block rounded border border-border px-1.5 py-0.5 text-[13px] text-text-secondary">
      pending-owner · DA-08/DA-09
    </span>
  );
}

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border/60 bg-surface/40">
      <div className="container-page py-8">
        <p className="max-w-prose text-sm text-text-secondary">
          {REPORT_DISCLAIMER}
        </p>
        <p className="mt-2 max-w-prose text-sm text-text-secondary">
          {EMERGENCY_DISCLAIMER}
        </p>

        <div className="mt-6 grid gap-x-8 gap-y-1 md:grid-cols-2">
          <LegalInfoSheet id="about" title="Qué son estos datos">
            <p>
              Esta home muestra reportes enviados por vecinos sobre un mapa de
              la ciudad. Los reportes ciudadanos no están verificados
              automáticamente.
            </p>
            <PendingOwner />
          </LegalInfoSheet>
          <LegalInfoSheet id="sources" title="Fuentes">
            <p>
              En esta iteración todas las fuentes son simuladas y están
              marcadas como dato de prueba. Cuando se conecten los organismos,
              vas a poder consultar la fuente primaria desde cada tarjeta.
            </p>
            <PendingOwner />
          </LegalInfoSheet>
          <LegalInfoSheet id="privacy" title="Privacidad">
            <p>
              No pedimos cuenta ni datos personales para reportar. Tu ubicación
              exacta no se publica: sólo se muestra una zona aproximada.
            </p>
            <PendingOwner />
          </LegalInfoSheet>
          <LegalInfoSheet id="report-error" title="Reportar un error">
            <p>
              Si encontrás un dato incorrecto o un reporte que no debería estar
              visible, escribinos. El canal de contacto está pendiente de
              definición.
            </p>
            <PendingOwner />
          </LegalInfoSheet>
          <LegalInfoSheet id="emergency" title="No es un canal de emergencias">
            <p>{EMERGENCY_DISCLAIMER}</p>
            <p className="mt-2">
              Ante una emergencia, llamá a los servicios de emergencia
              correspondientes.
            </p>
          </LegalInfoSheet>
        </div>

        <p className="mt-6 text-xs text-text-secondary">
          Datos de desarrollo — no usar para decisiones operativas.
        </p>
      </div>
    </footer>
  );
}
