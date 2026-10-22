import { NextResponse } from "next/server";
import type { SourceHealth, SourceKey, OverviewPayload } from "@/lib/domain/types";
import { apiError, logApiError } from "@/lib/api-error";
import { isProductionEnvironment } from "@/lib/env";
import { getOverviewProvider } from "@/lib/providers";
import { DEFAULT_CATEGORY, DEFAULT_PERIOD } from "@/lib/validation/query-params";
import { CATEGORY_SLUGS } from "@/lib/domain/taxonomy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCE_KEYS: SourceKey[] = ["climate", "weather", "river", "community"];

function fixtureHealth(): Record<SourceKey, SourceHealth> {
  return SOURCE_KEYS.reduce(
    (acc, key) => {
      acc[key] = { status: "fixture" };
      return acc;
    },
    {} as Record<SourceKey, SourceHealth>,
  );
}

export async function GET() {
  // DEC-02: JSON 404 with the uniform §17.9 body — not a redirect, not the
  // HTML not-found page. A redirect would reveal that the route exists.
  if (isProductionEnvironment()) {
    const body = apiError(
      "NOT_FOUND",
      "Este recurso no está disponible en este entorno.",
      false,
    );
    logApiError("/api/overview", body);
    return NextResponse.json(body, { status: 404 });
  }

  const provider = getOverviewProvider();
  const query = {
    category: CATEGORY_SLUGS[DEFAULT_CATEGORY],
    period: DEFAULT_PERIOD,
  } as const;

  const [climate, weather, river, community] = await Promise.all([
    provider.getClimateContext(),
    provider.getWeatherPreview(),
    provider.getRiverLevel(),
    provider.getCommunityStats(query),
  ]);

  const now = new Date().toISOString();
  const payload: OverviewPayload = {
    climate,
    weather,
    river,
    community,
    published_at: now,
    fetched_at: now,
    source_health: fixtureHealth(),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
    },
  });
}
