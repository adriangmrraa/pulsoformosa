"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LegalInfoSheet } from "@/components/ui/legal-info-sheet";
import type { GeometryMode, LocationMethod, ReportCategory } from "@/lib/domain/taxonomy";
import { GEOMETRY_MODES } from "@/lib/domain/taxonomy";
import {
  CONSENT_TEXT,
  DESCRIPTION_WARNING,
  GEOMETRY_AREA,
  GEOMETRY_PENDING,
  GEOMETRY_POINT,
  GEOMETRY_QUESTION,
  GEOMETRY_STREET,
  LOCATION_MARKED_BY_YOU,
  SUBMISSION_STUB_HINT,
} from "@/lib/domain/microcopy";
import { formatAbsoluteART } from "@/lib/domain/time";
import { reportFormSchema } from "@/lib/validation/report-form";
import { ReportCategoryPicker } from "./report-category-picker";
import { LocationPicker, type PickedLocation } from "./location-picker";
import { ImageUploader } from "./image-uploader";
import {
  SubmissionFeedback,
  type SubmissionState,
} from "./submission-feedback";

const DRAFT_KEY = "reportar-draft-v1";

interface Draft {
  category: ReportCategory | null;
  subtype: string | null;
  description: string;
  location: PickedLocation | null;
  method: LocationMethod | null;
  barrio: string;
}

const EMPTY_DRAFT: Draft = {
  category: null,
  subtype: null,
  description: "",
  location: null,
  method: null,
  barrio: "",
};

function newKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `00000000-0000-4000-8000-${Date.now().toString().padStart(12, "0").slice(-12)}`;
}

export function ReportForm() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [geometryMode, setGeometryMode] = useState<GeometryMode>("POINT");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const [publicId, setPublicId] = useState<string | undefined>(undefined);
  const [reportTime, setReportTime] = useState<string | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    // sessionStorage is an external store; read it after mount so SSR and the
    // first client render agree.
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Draft>;
          setDraft((current) => ({ ...current, ...parsed }));
        }
      } catch {
        // A corrupt draft is not worth blocking the form.
      }
      restoredRef.current = true;
      setReportTime(new Date().toISOString());
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!restoredRef.current) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage can be unavailable in private modes; the form still works.
    }
  }, [draft]);

  function update(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};

    if (!draft.category) {
      next.category = "Elegí un tipo de problema.";
    }
    if (draft.description.trim().length < 15) {
      next.description = "La descripción debe tener al menos 15 caracteres.";
    } else if (draft.description.length > 800) {
      next.description = "La descripción no puede superar los 800 caracteres.";
    }
    if (!draft.location) {
      next.location = "Marcá una ubicación o usá tu ubicación actual.";
    }
    if (!consent) {
      next.consent = "Necesitamos tu consentimiento para publicar el reporte.";
    }

    if (Object.keys(next).length === 0 && draft.category && draft.location) {
      const candidate = {
        category: draft.category,
        subtype: draft.subtype ?? undefined,
        description: draft.description,
        location: {
          lat: draft.location.lat,
          lon: draft.location.lon,
          method: draft.method ?? "manual_pin",
        },
        geometry_mode: geometryMode,
        consent: true as const,
        idempotency_key: newKey(),
      };
      const parsed = reportFormSchema.safeParse(candidate);
      if (!parsed.success) {
        next.form = "Revisá los datos marcados antes de enviar.";
      }
    }

    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submission === "submitting") return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmission("submitting");
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Fake submit: nothing persists and the fixture list never gains the report.
    setPublicId(`pub_mock_${newKey().slice(0, 8)}`);
    setSubmission("received");
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <ReportCategoryPicker
        value={draft.category}
        subtype={draft.subtype}
        onChange={(category) => update({ category, subtype: null })}
        onSubtypeChange={(subtype) => update({ subtype })}
        error={errors.category}
      />

      <div className="space-y-2">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={draft.description}
          onChange={(event) => update({ description: event.target.value })}
          aria-describedby="description-help description-error"
          aria-invalid={Boolean(errors.description)}
          maxLength={800}
          rows={5}
          placeholder="Contá qué pasa, dónde y desde cuándo. Sin nombres ni teléfonos de otras personas."
        />
        <p id="description-help" className="text-xs text-text-secondary">
          Mínimo 15 y máximo 800 caracteres. {DESCRIPTION_WARNING}
        </p>
        <p className="tabular text-xs text-text-secondary">
          {draft.description.length}/800
        </p>
        {errors.description ? (
          <p id="description-error" className="text-xs text-alerta-alta">
            {errors.description}
          </p>
        ) : null}
      </div>

      <LocationPicker
        value={draft.location}
        method={draft.method}
        barrio={draft.barrio}
        onBarrioChange={(barrio) => update({ barrio })}
        onChange={(location, method) => update({ location, method })}
        error={errors.location}
      />

      <ImageUploader files={files} onChange={setFiles} />

      <details className="rounded-lg border border-border bg-surface/60 p-3">
        <summary className="min-h-11 cursor-pointer text-sm font-medium">
          {GEOMETRY_QUESTION}
        </summary>
        <fieldset className="mt-3 space-y-2" disabled={false}>
          <legend className="sr-only">{GEOMETRY_QUESTION}</legend>
          {GEOMETRY_MODES.map((mode) => {
            const disabled = mode !== "POINT";
            const label =
              mode === "POINT"
                ? GEOMETRY_POINT
                : mode === "STREET_SEGMENT"
                  ? GEOMETRY_STREET
                  : GEOMETRY_AREA;
            return (
              <div key={mode} className="flex items-start gap-2">
                <input
                  id={`geometry-${mode}`}
                  type="radio"
                  name="geometry_mode"
                  value={mode}
                  checked={geometryMode === mode}
                  disabled={disabled}
                  onChange={() => setGeometryMode(mode)}
                  className="mt-1 size-4"
                />
                <label htmlFor={`geometry-${mode}`} className="text-sm">
                  {label}
                  {disabled ? (
                    <span className="ml-2 text-xs text-text-secondary">
                      ({GEOMETRY_PENDING})
                    </span>
                  ) : null}
                </label>
              </div>
            );
          })}
        </fieldset>
      </details>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(Boolean(checked))}
            aria-describedby="consent-error"
            aria-invalid={Boolean(errors.consent)}
          />
          <Label htmlFor="consent" className="text-sm leading-relaxed font-normal">
            {CONSENT_TEXT}
          </Label>
        </div>
        {errors.consent ? (
          <p id="consent-error" className="text-xs text-alerta-alta">
            {errors.consent}
          </p>
        ) : null}
        <LegalInfoSheet id="privacy" title="Privacidad y datos del reporte">
          <p>
            No pedimos nombre, DNI, email ni teléfono. La ubicación exacta no se
            publica; se muestra una zona aproximada.
          </p>
        </LegalInfoSheet>
      </div>

      <div
        aria-label="Protección anti-bots"
        className="rounded-lg border border-dashed border-border bg-surface/40 p-3 text-xs text-text-secondary"
      >
        {SUBMISSION_STUB_HINT}
      </div>

      {draft.location ? (
        <section
          aria-labelledby="preview-title"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 id="preview-title" className="text-sm font-semibold">
            Vista previa del reporte
          </h2>
          <dl className="mt-2 space-y-1 text-xs text-text-secondary">
            <div>
              <dt className="inline font-medium">{LOCATION_MARKED_BY_YOU}: </dt>
              <dd className="tabular inline">
                {draft.location.lat.toFixed(5)}, {draft.location.lon.toFixed(5)}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Barrio o referencia: </dt>
              <dd className="inline">{draft.barrio || "sin indicar"}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Hora del reporte: </dt>
              <dd className="inline">
                {reportTime ? formatAbsoluteART(reportTime) : "se registra al enviar"}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Fotos: </dt>
              <dd className="inline">
                {files.length === 0 ? "sin fotos" : `${files.length} foto(s)`}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      {errors.form ? (
        <p role="alert" className="text-sm text-alerta-alta">
          {errors.form}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submission === "submitting"}
        className="min-h-11 w-full bg-accent-agua px-4 text-sm font-semibold text-foreground hover:bg-accent-agua/90"
      >
        {submission === "submitting" ? "Enviando…" : "Enviar reporte"}
      </Button>

      <SubmissionFeedback state={submission} publicId={publicId} />
    </form>
  );
}
