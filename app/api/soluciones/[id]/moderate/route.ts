import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, logApiError } from "@/lib/api-error";
import { getStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const moderateSchema = z.strictObject({
  action: z.enum(["approve", "reject"]),
  reason: z.string().min(1).max(500),
});

/**
 * POST /api/soluciones/[id]/moderate — private moderation seam (no public
 * moderation UI per spec). Requires the x-moderator-token header to match
 * MODERATOR_TOKEN; every decision appends a moderation_events audit row
 * (action + actor + reason) in the same write as the status flip.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const expected = process.env.MODERATOR_TOKEN?.trim();
  const provided = request.headers.get("x-moderator-token")?.trim();
  if (!expected || !provided || provided !== expected) {
    return Response.json(
      apiError("UNAUTHORIZED", "Moderación no autorizada."),
      { status: 401 },
    );
  }

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

  const parsed = moderateSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      apiError("VALIDATION_ERROR", "Acción o motivo inválidos."),
      { status: 400 },
    );
  }

  try {
    const store = await getStore();
    const solution = await store.moderateSolution(
      id,
      parsed.data.action,
      parsed.data.reason,
      "moderator",
    );
    if (!solution) {
      return Response.json(
        apiError("NOT_FOUND", "La solución no existe."),
        { status: 404 },
      );
    }
    const events = await store.listModerationEvents(id);
    return Response.json({ solution, events });
  } catch (error) {
    const body = apiError(
      "INTERNAL_ERROR",
      "No pudimos registrar la moderación.",
      true,
    );
    logApiError("POST /api/soluciones/[id]/moderate", body);
    console.error(error);
    return Response.json(body, { status: 500 });
  }
}
