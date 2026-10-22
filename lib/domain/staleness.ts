import { DAY_MS, HOUR_MS } from "./time";

// §15.9 initial freshness windows. These are operational configuration values
// to verify against each provider's real cadence — not scientific constants.
export const FRESHNESS_WINDOWS_MS = {
  enso: 45 * DAY_MS,
  forecast: 6 * HOUR_MS,
  river: 12 * HOUR_MS,
  reports: 24 * HOUR_MS,
} as const;

export type FreshnessKind = keyof typeof FRESHNESS_WINDOWS_MS;

export function isStale(
  iso: string,
  windowMs: number,
  now: Date = new Date(),
): boolean {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return true;
  return now.getTime() - then.getTime() > windowMs;
}

export function isStaleFor(
  iso: string,
  kind: FreshnessKind,
  now: Date = new Date(),
): boolean {
  return isStale(iso, FRESHNESS_WINDOWS_MS[kind], now);
}
