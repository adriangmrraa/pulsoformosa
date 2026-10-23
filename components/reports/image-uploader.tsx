"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PHOTO_LIMIT,
  PHOTO_REJECTED_SIZE,
  PHOTO_REJECTED_TYPE,
  PHOTO_SAFETY_NOTICE,
  UPLOADING_PHOTOS,
} from "@/lib/domain/microcopy";

const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/heic", "image/heif"];

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
  onError?: (message?: string) => void;
  uploading?: boolean;
}

export function ImageUploader({
  files,
  onChange,
  error,
  onError,
  uploading = false,
}: ImageUploaderProps) {
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const errorId = "photos-error";
  const displayError = error ?? localError;

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [previews]);

  function reportError(message?: string) {
    setLocalError(message);
    onError?.(message);
  }

  function addFiles(selected: FileList | null) {
    if (!selected) return;

    const incoming = Array.from(selected);
    const rejectedType = incoming.filter(
      (file) =>
        !ALLOWED.includes(file.type) &&
        !/\.(jpe?g|png|hei[cf])$/i.test(file.name),
    );
    const allowed = incoming.filter((file) => !rejectedType.includes(file));
    const rejectedSize = allowed.filter((file) => file.size > MAX_BYTES);
    const withinSize = allowed.filter((file) => file.size <= MAX_BYTES);

    const remaining = Math.max(MAX_FILES - files.length, 0);
    const accepted = withinSize.slice(0, remaining);
    const overflow = withinSize.length > remaining;

    const reasons: string[] = [];
    if (rejectedType.length > 0) reasons.push(PHOTO_REJECTED_TYPE);
    if (rejectedSize.length > 0) reasons.push(PHOTO_REJECTED_SIZE);
    if (overflow) reasons.push(PHOTO_LIMIT);
    reportError(reasons.length > 0 ? reasons.join(" ") : undefined);

    if (accepted.length > 0) {
      onChange([...files, ...accepted].slice(0, MAX_FILES));
    }
  }

  function removeAt(index: number) {
    onChange(files.filter((_, current) => current !== index));
  }

  return (
    <fieldset className="space-y-2" aria-describedby={displayError ? errorId : undefined}>
      <legend className="text-sm font-medium">Fotos (opcional, hasta 3)</legend>

      <input
        id="fotos"
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif"
        multiple
        disabled={uploading}
        onChange={(event) => addFiles(event.target.files)}
        className="block w-full text-[13px] text-text-secondary file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-surface file:px-4 file:text-sm file:font-medium file:text-text"
      />
      <label htmlFor="fotos" className="sr-only">
        Elegir fotos del reporte
      </label>

      <p className="text-[13px] text-text-secondary">
        JPEG, PNG o HEIC · hasta 5 MB por archivo. Las fotos quedan sólo en tu
        dispositivo en esta versión: no se suben.
      </p>

      <p className="rounded-lg bg-surface/70 p-2 text-[13px] text-text-secondary">
        {PHOTO_SAFETY_NOTICE}
      </p>

      {uploading ? (
        <p role="status" className="text-[13px] text-accent-lluvia">
          {UPLOADING_PHOTOS}
        </p>
      ) : null}

      {previews.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <li key={preview.url} className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={`Vista previa de la foto ${index + 1}`}
                className="h-24 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => removeAt(index)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border text-[13px] transition-ui hover:bg-muted"
              >
                Quitar foto {index + 1}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="tabular text-[13px] text-text-secondary">
        {files.length} de {MAX_FILES} fotos seleccionadas
      </p>

      {displayError ? (
        <p id={errorId} role="alert" className="text-[13px] text-alerta-alta">
          {displayError}
        </p>
      ) : null}
    </fieldset>
  );
}
