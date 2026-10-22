import { formatAbsoluteART } from "@/lib/domain/time";

interface UpdatedAtProps {
  timestamp: string;
  stale?: boolean;
}

export function UpdatedAt({ timestamp, stale = false }: UpdatedAtProps) {
  return (
    <p className="tabular text-xs text-text-secondary">
      Actualizado: {formatAbsoluteART(timestamp)}
      {stale ? " · sin actualización reciente" : ""}
    </p>
  );
}
