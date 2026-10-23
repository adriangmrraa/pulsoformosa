interface PartialNoticeProps {
  missing: string[];
}

/** §9.6 Partial: say what is missing instead of silently rendering a success. */
export function PartialNotice({ missing }: PartialNoticeProps) {
  const detail = missing.length > 0 ? ` Faltan: ${missing.join(", ")}.` : "";
  return (
    <p
      role="status"
      className="mt-2 rounded border border-alerta-moderada/40 bg-alerta-moderada/10 px-2 py-1 text-[13px] text-alerta-moderada"
    >
      Información parcial.{detail}
    </p>
  );
}
