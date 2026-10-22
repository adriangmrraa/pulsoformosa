import { STALE_NOTICE } from "@/lib/domain/microcopy";

interface DataStaleNoticeProps {
  since?: string;
  label?: string;
}

export function DataStaleNotice({ label = STALE_NOTICE }: DataStaleNoticeProps) {
  return (
    <p
      role="status"
      className="mt-2 inline-flex items-center gap-1.5 rounded border border-alerta-moderada/50 bg-alerta-moderada/10 px-2 py-1 text-xs text-alerta-moderada"
    >
      {label}
    </p>
  );
}
