import { NextRequest } from "next/server";
import { apiError, logApiError } from "@/lib/api-error";
import { getStore } from "@/lib/server/store";
import { solutionFormSchema } from "@/lib/validation/solution-form";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/reportes/[id]/soluciones — anonymous community solution (REQ-SOL-05).
 * Always created with status "pending": only a moderation approval can mark
 * it — and therefore its report — as solved.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      apiError("VALIDATION_ERROR", "Cuerpo JSON inválido."),
      { status: 400 },
    );
  }

  const parsed = solutionFormSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      apiError(
        "VALIDATION_ERROR",
        "La solución no cumple el formato esperado.",
      ),
      { status: 400 },
    );
  }

  try {
    const store = await getStore();
    const solution = await store.createSolution(id, parsed.data);
    if (!solution) {
      return Response.json(
        apiError("NOT_FOUND", "El reporte no existe o no es público."),
        { status: 404 },
      );
    }
    return Response.json(solution, { status: 201 });
  } catch (error) {
    const body = apiError(
      "INTERNAL_ERROR",
      "No pudimos guardar la solución.",
      true,
    );
    logApiError("POST /api/reportes/[id]/soluciones", body);
    console.error(error);
    return Response.json(body, { status: 500 });
  }
}
