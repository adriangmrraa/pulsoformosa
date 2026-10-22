// Timestamps are stored ISO-8601 UTC; every display goes through ART.
export const ART_TIMEZONE = "America/Argentina/Buenos_Aires";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatAbsoluteART(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin dato";

  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: ART_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("day")}/${value("month")}/${value("year")} ${value("hour")}:${value("minute")} ART`;
}

export function formatTimeART(iso: string): string {
  const absolute = formatAbsoluteART(iso);
  if (absolute === "Sin dato") return absolute;
  const [, time] = absolute.split(" ");
  return time ? `${time} ART` : absolute;
}

export function formatRelativeAge(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "Sin dato";

  const diff = now.getTime() - then.getTime();
  if (diff < MINUTE) return "hace un momento";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `hace ${minutes} min`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `hace ${hours} h`;
  }

  const days = Math.floor(diff / DAY);
  if (days === 1) return "hace 1 día";
  if (days < 30) return `hace ${days} días`;

  const months = Math.floor(days / 30);
  return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
}

export const DAY_MS = DAY;
export const HOUR_MS = HOUR;
