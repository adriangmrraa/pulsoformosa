"use client";

import { useEffect } from "react";

/**
 * Marks the document once React has hydrated. E2E waits on this instead of
 * racing client-side interactivity (WebKit can hydrate dynamic pages late).
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return null;
}
