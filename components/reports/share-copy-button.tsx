"use client";

import { useState } from "react";
import { COPY_LINK, COPY_LINK_DONE, SHARE } from "@/lib/domain/microcopy";

interface ShareCopyButtonProps {
  path: string;
  text: string;
  label?: string;
  className?: string;
}

/**
 * DEC-06: Web Share API with a clipboard fallback. Builds the absolute URL on
 * the client so the server never needs to know the origin.
 */
export function ShareCopyButton({
  path,
  text,
  label = SHARE,
  className,
}: ShareCopyButtonProps) {
  const [status, setStatus] = useState<string>("");

  async function share() {
    const url = new URL(path, window.location.origin).toString();

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Pulso Formosa", text, url });
        setStatus("Compartido");
        return;
      } catch {
        // User cancelled or share failed: fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus(COPY_LINK_DONE);
    } catch {
      setStatus(COPY_LINK);
    }
  }

  return (
    <span className={className}>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-medium transition-ui hover:bg-muted"
      >
        {label}
      </button>
      <span role="status" aria-live="polite" className="ml-2 text-xs text-text-secondary">
        {status}
      </span>
    </span>
  );
}
