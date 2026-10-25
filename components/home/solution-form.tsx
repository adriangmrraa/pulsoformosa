"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Solution } from "@/lib/domain/solution";
import {
  SOLUTION_EVIDENCE_NOTE_MAX,
  SOLUTION_TEXT_MAX,
  SOLUTION_TEXT_MIN,
} from "@/lib/domain/solution";
import {
  DESCRIPTION_WARNING,
  SOLUTION_PENDING_LABEL,
} from "@/lib/domain/microcopy";
import {
  solutionFormSchema,
  type SolutionFormInput,
} from "@/lib/validation/solution-form";

interface SolutionFormProps {
  onSubmit: (input: SolutionFormInput) => Promise<Solution>;
}

/**
 * Anonymous community-solution form (REQ-SOL-05/06). Validates with the same
 * strict schema the API enforces, prevents double submission, and reports
 * transport failures without losing the text.
 */
export function SolutionForm({ onSubmit }: SolutionFormProps) {
  const [text, setText] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const parsed = solutionFormSchema.safeParse({
      text: text.trim(),
      evidence_note: evidenceNote.trim() ? evidenceNote : undefined,
    });
    if (!parsed.success) {
      setError(
        `La solución debe tener entre ${SOLUTION_TEXT_MIN} y ${SOLUTION_TEXT_MAX} caracteres.`,
      );
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
      setText("");
      setEvidenceNote("");
      setSent(true);
    } catch {
      setError(
        "No pudimos enviar tu solución. El texto sigue acá; podés reintentar.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="solucion-text" className="text-sm font-medium">
          Tu solución
        </label>
        <Textarea
          id="solucion-text"
          name="solucion-text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSent(false);
          }}
          rows={3}
          maxLength={SOLUTION_TEXT_MAX}
          aria-describedby="solution-help solution-error"
          aria-invalid={Boolean(error)}
          placeholder="Contá cómo se solucionó o cómo se solucionaría. Sin nombres ni teléfonos."
        />
        <p id="solution-help" className="text-xs text-text-secondary">
          Mínimo {SOLUTION_TEXT_MIN} caracteres. {DESCRIPTION_WARNING} Si se
          aprueba en moderación, el reporte pasa a Resuelto.
        </p>
        <p className="tabular text-xs text-text-secondary">
          {text.length}/{SOLUTION_TEXT_MAX}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="solucion-evidencia" className="text-sm font-medium">
          Evidencia (opcional)
        </label>
        <Textarea
          id="solucion-evidencia"
          name="solucion-evidencia"
          value={evidenceNote}
          onChange={(event) => setEvidenceNote(event.target.value)}
          rows={2}
          maxLength={SOLUTION_EVIDENCE_NOTE_MAX}
          placeholder="Ej.: fecha en que viste el arreglo, referencia del lugar."
        />
      </div>

      {error ? (
        <p id="solution-error" role="alert" className="text-xs text-alerta-alta">
          {error}
        </p>
      ) : null}

      {sent ? (
        <p role="status" className="text-xs text-exito">
          Solución enviada — queda {SOLUTION_PENDING_LABEL}.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="min-h-11 bg-accent-agua px-4 text-sm font-semibold text-background hover:bg-accent-agua/90"
      >
        {submitting ? "Enviando…" : "Enviar solución"}
      </Button>
    </form>
  );
}
