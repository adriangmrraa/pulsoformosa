"use client";

import { useEffect, useMemo } from "react";
import { PHOTO_SAFETY_NOTICE } from "@/lib/domain/microcopy";

const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/heic", "image/heif"];

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function ImageUploader({ files, onChange, error }: ImageUploaderProps) {
  const errorId = "photos-error";

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

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const incoming = Array.from(selected).filter(
      (file) => ALLOWED.includes(file.type) || /\.(jpe?g|png|hei[cf])$/i.test(file.name),
    );
    const withinSize = incoming.filter((file) => file.size <= MAX_BYTES);
    onChange([...files, ...withinSize].slice(0, MAX_FILES));
  }

  function removeAt(index: number) {
    onChange(files.filter((_, current) => current !== index));
  }

  return (
    <fieldset className="space-y-2" aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-medium">Fotos (opcional, hasta 3)</legend>

      <input
        id="fotos"
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif"
        multiple
        onChange={(event) => addFiles(event.target.files)}
        className="block w-full text-xs text-text-secondary file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-surface file:px-4 file:text-sm file:font-medium file:text-text"
      />
      <label htmlFor="fotos" className="sr-only">
        Elegir fotos del reporte
      </label>

      <p className="text-xs text-text-secondary">
        JPEG, PNG o HEIC · hasta 5 MB por archivo. Las fotos quedan sólo en tu
        dispositivo en esta versión: no se suben.
      </p>

      <p className="rounded-lg bg-surface/70 p-2 text-xs text-text-secondary">
        {PHOTO_SAFETY_NOTICE}
      </p>

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
                onClick={() => removeAt(index)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border text-xs transition-ui hover:bg-muted"
              >
                Quitar foto {index + 1}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="tabular text-xs text-text-secondary">
        {files.length} de {MAX_FILES} fotos seleccionadas
      </p>

      {error ? (
        <p id={errorId} className="text-xs text-alerta-alta">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
