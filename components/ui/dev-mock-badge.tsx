import { FlaskConical } from "lucide-react";
import { MOCK_BADGE } from "@/lib/domain/microcopy";

interface DevMockBadgeProps {
  label?: string;
  className?: string;
}

/**
 * Visible marker for every fixture-fed surface (REQ-MCK-05). Icon + text, never
 * color alone. Not optional per consumer.
 */
export function DevMockBadge({ label = MOCK_BADGE, className }: DevMockBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-alerta-moderada/50 bg-alerta-moderada/10 px-2.5 py-1 text-xs font-medium text-alerta-moderada",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <FlaskConical aria-hidden="true" className="size-[18px]" />
      <span>{label}</span>
    </span>
  );
}
