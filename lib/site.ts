// SITE_NAME is pending the brand/domain decision (DA-01).
export const SITE_NAME = "Pulso Formosa";

export const REGION = {
  city: "Formosa",
  province: "Formosa",
  label: "Formosa · Formosa",
} as const;

export const SITE_TITLE = `${SITE_NAME} — mapa de reportes ciudadanos y clima`;

export const SITE_DESCRIPTION =
  "Clima, río y reportes de vecinos en Formosa. Mirá lo que se está reportando y sumá un reporte sin registrarte.";

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL ??
  process.env.APP_BASE_URL ??
  "http://127.0.0.1:3000";
