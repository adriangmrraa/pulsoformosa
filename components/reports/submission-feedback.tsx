"use client";

import Link from "next/link";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import {
  CONFIRMATION_BACK,
  CONFIRMATION_DISCLAIMER,
  CONFIRMATION_STATUS,
  CONFIRMATION_TITLE,
} from "@/lib/domain/microcopy";

export type SubmissionState = "idle" | "submitting" | "received" | "error";

interface SubmissionFeedbackProps {
  state: SubmissionState;
  publicId?: string;
}

export function SubmissionFeedback({ state, publicId }: SubmissionFeedbackProps) {
  if (state === "idle") return null;

  return (
    <div aria-live="polite" className="space-y-3">
      {state === "submitting" ? (
        <p role="status" className="text-sm text-text-secondary">
          Enviando tu reporte…
        </p>
      ) : null}

      {state === "error" ? (
        <p role="alert" className="text-sm text-alerta-alta">
          No pudimos enviar el reporte. El borrador sigue en esta pestaña;
          podés reintentar.
        </p>
      ) : null}

      {state === "received" ? (
        <section
          aria-labelledby="confirmacion-title"
          className="rounded-xl border border-exito/40 bg-exito/10 p-5"
        >
          <h2 id="confirmacion-title" className="text-xl font-semibold">
            {CONFIRMATION_TITLE}
          </h2>
          <p className="mt-2 text-sm">
            Identificador público:{" "}
            <span className="tabular font-medium">{publicId}</span>
          </p>
          <div className="mt-2">
            <DevMockBadge label="Identificador simulado — mock de desarrollo" />
          </div>
          <p className="mt-3 text-sm">
            Situación: <strong>{CONFIRMATION_STATUS}</strong>
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            {CONFIRMATION_DISCLAIMER}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent-agua px-4 text-sm font-semibold text-background transition-ui"
          >
            {CONFIRMATION_BACK}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
