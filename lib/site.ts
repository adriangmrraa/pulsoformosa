// SITE_NAME is pending the brand/domain decision (DA-01).
import { isProductionEnvironment } from "./env";

export const SITE_NAME = "Pulso Formosa";

export const REGION = {
  city: "Formosa",
  province: "Formosa",
  label: "Formosa · Formosa",
} as const;

export const SITE_TITLE = `${SITE_NAME} — mapa de reportes ciudadanos`;

export const SITE_DESCRIPTION =
  "Reportes de vecinos sobre el mapa de Formosa. Mirá lo que se está reportando, sumá una solución o un reporte sin registrarte.";

/**
 * Canonical origin for metadata. Derived only from operator configuration —
 * never from request headers (SSRF guard). Required outside development;
 * localhost fallback is development-only.
 */
export function getAppBaseUrl(): string {
  const raw = (process.env.APP_BASE_URL ?? "").trim();

  if (raw) {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new Error("APP_BASE_URL must be an absolute http(s) URL");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("APP_BASE_URL must use http or https");
    }
    return url.origin;
  }

  if (isProductionEnvironment()) {
    throw new Error(
      "APP_BASE_URL is required when PUBLIC_ENVIRONMENT_LABEL=production",
    );
  }

  return "http://127.0.0.1:3000";
}
