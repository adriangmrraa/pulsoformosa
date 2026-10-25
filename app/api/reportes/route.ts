import { NextRequest } from "next/server";
import { apiError, logApiError } from "@/lib/api-error";
import { generalizeCoordinate, isInsideFormosaBBox } from "@/lib/domain/geo";
import { getStore } from "@/lib/server/store";
import {
  parseOverviewQuery,
  toReportQuery,
} from "@/lib/validation/query-params";
import { reportFormSchema } from "@/lib/validation/report-form";

export const dynamic = "force-dynamic";

/**
 * GET /api/reportes — public, paginated report feed. Same query grammar the
 * home uses (zona/categoria/subtipo/periodo/cursor); only published reports
 * with generalized geometry are ever returned.
 */
export async function GET(request: NextRequest) {
  try {
    const query = parseOverviewQuery(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const store = await getStore();
    const page = await store.listReports(toReportQuery(query));
    return Response.json(page);
  } catch (error) {
    const body = apiError(
      "INTERNAL_ERROR",
      "No pudimos obtener los reportes.",
      true,
    );
    logApiError("GET /api/reportes", body);
    console.error(error);
    return Response.json(body, { status: 500 });
  }
}

/**
 * POST /api/reportes — anonymous citizen ingest (§6.2). Zod-validated,
 * idempotent via the client idempotency key (dedupe in the store), and the
 * location is generalized to the ~250 m public grid at ingest — the precise
 * coordinate is never persisted. New reports publish as unverified citizen
 * contributions (PUBLISHED_UNVERIFIED).
 */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      apiError("VALIDATION_ERROR", "Cuerpo JSON inválido."),
      { status: 400 },
    );
  }

  const parsed = reportFormSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      apiError(
        "VALIDATION_ERROR",
        "El reporte no cumple el formato esperado.",
      ),
      { status: 400 },
    );
  }

  const input = parsed.data;
  if (!isInsideFormosaBBox(input.location.lat, input.location.lon)) {
    return Response.json(
      apiError(
        "OUTSIDE_REGION",
        "La ubicación elegida está fuera del área de Formosa.",
      ),
      { status: 400 },
    );
  }

  try {
    const generalized = generalizeCoordinate(
      input.location.lat,
      input.location.lon,
    );
    const store = await getStore();
    const { report, created } = await store.createReport({
      submission_id: input.idempotency_key,
      category: input.category,
      subtype: input.subtype ?? null,
      description: input.description,
      expected_solution: input.expected_solution?.trim() || null,
      lon: generalized.lon,
      lat: generalized.lat,
      approx_zone: input.zone_label?.trim() || null,
      location_method: input.location.method,
      editorial_status: "PUBLISHED_UNVERIFIED",
    });

    return Response.json(
      {
        id: report.id,
        public_id: report.id,
        editorial_status: report.editorial_status,
        created,
      },
      { status: created ? 201 : 200 },
    );
  } catch (error) {
    const body = apiError(
      "INTERNAL_ERROR",
      "No pudimos guardar el reporte.",
      true,
    );
    logApiError("POST /api/reportes", body);
    console.error(error);
    return Response.json(body, { status: 500 });
  }
}
