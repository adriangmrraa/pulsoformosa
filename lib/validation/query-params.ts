import { z } from "zod";
import {
  CATEGORY_SLUG_LIST,
  CATEGORY_SLUGS,
  type CategorySlug,
} from "@/lib/domain/taxonomy";
import type { ReportQuery, TimeRange } from "@/lib/domain/types";

// §4 query grammar. Strict per §19.3, but `parseOverviewQuery` is forgiving:
// invalid or stale values fall back to defaults without throwing (§25).
export const overviewQuerySchema = z.strictObject({
  reporte: z
    .string()
    .regex(/^[a-z0-9_-]+$/i)
    .max(64)
    .optional(),
  zona: z.string().max(64).optional(),
  categoria: z.enum(CATEGORY_SLUG_LIST).optional(),
  subtipo: z.string().max(80).optional(),
  periodo: z.enum(["24h", "7d", "30d"]).optional(),
  cursor: z.string().max(128).optional(),
});

export const DEFAULT_PERIOD: TimeRange = "7d";
export const DEFAULT_CATEGORY: CategorySlug = "todos";

export interface OverviewQuery {
  reporte?: string;
  zona?: string;
  categoria: CategorySlug;
  subtipo?: string;
  periodo: TimeRange;
  cursor?: string;
}

const reporteSchema = z
  .string()
  .regex(/^[a-z0-9_-]+$/i)
  .max(64);
const zonaSchema = z.string().max(64);
const categoriaSchema = z.enum(CATEGORY_SLUG_LIST);
const subtipoSchema = z.string().max(80);
const periodoSchema = z.enum(["24h", "7d", "30d"]);
const cursorSchema = z.string().max(128);

function asRecord(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function pick<T>(schema: z.ZodType<T>, value: unknown): T | undefined {
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function parseOverviewQuery(raw: unknown): OverviewQuery {
  const record = asRecord(raw);

  const parsed: OverviewQuery = {
    categoria: pick(categoriaSchema, record.categoria) ?? DEFAULT_CATEGORY,
    periodo: pick(periodoSchema, record.periodo) ?? DEFAULT_PERIOD,
  };

  const reporte = pick(reporteSchema, record.reporte);
  if (reporte) parsed.reporte = reporte;

  const zona = pick(zonaSchema, record.zona);
  if (zona) parsed.zona = zona;

  const subtipo = pick(subtipoSchema, record.subtipo);
  if (subtipo) parsed.subtipo = subtipo;

  const cursor = pick(cursorSchema, record.cursor);
  if (cursor) parsed.cursor = cursor;

  return parsed;
}

export function toReportQuery(query: OverviewQuery): ReportQuery {
  return {
    category: CATEGORY_SLUGS[query.categoria],
    zona: query.zona,
    subtype: query.subtipo,
    period: query.periodo,
    cursor: query.cursor,
  };
}
