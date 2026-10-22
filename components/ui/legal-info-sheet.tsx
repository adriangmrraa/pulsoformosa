import type { ReactNode } from "react";

export type LegalInfoId =
  | "about"
  | "sources"
  | "privacy"
  | "report-error"
  | "emergency";

interface LegalInfoSheetProps {
  id: LegalInfoId;
  title: string;
  children: ReactNode;
}

/**
 * DEC-08: <details> disclosure instead of a dialog — zero-JS, progressive
 * enhancement, and it stays inside the current route (REQ-IA-08).
 */
export function LegalInfoSheet({ id, title, children }: LegalInfoSheetProps) {
  return (
    <details
      data-legal-id={id}
      className="group border-b border-border/50 py-2 last:border-b-0"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-text transition-ui hover:text-accent-agua">
        {title}
        <span aria-hidden="true" className="text-text-secondary">
          +
        </span>
      </summary>
      <div className="pt-2 pb-3 text-sm leading-relaxed text-text-secondary">
        {children}
      </div>
    </details>
  );
}
