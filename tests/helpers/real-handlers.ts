/**
 * Real route-handler invocations for tests (design-amendment obs #5628).
 *
 * NO MOCKS: these helpers call the production Next.js route handlers
 * in-process — the same validation, store and persistence the live server
 * exercises. Point `PULSO_DATA_DIR` at a temp dir and call
 * `resetStoreForTests()` in your setup so each suite owns a real JSON store.
 */
import { NextRequest } from "next/server";
import type { Solution } from "@/lib/domain/solution";
import type { SolutionFormInput } from "@/lib/validation/solution-form";
import type { ReportFormInput } from "@/lib/validation/report-form";
import { POST as postSolutionRoute } from "@/app/api/reportes/[id]/soluciones/route";
import { POST as postReportRoute } from "@/app/api/reportes/route";

export async function submitSolutionViaRoute(
  reportId: string,
  input: SolutionFormInput,
): Promise<Solution> {
  const request = new NextRequest(
    `http://localhost/api/reportes/${reportId}/soluciones`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const response = await postSolutionRoute(request, {
    params: Promise.resolve({ id: reportId }),
  });
  if (!response.ok) {
    throw new Error(`solution submit failed: ${response.status}`);
  }
  return (await response.json()) as Solution;
}

export async function submitReportViaRoute(
  payload: ReportFormInput,
): Promise<{ publicId: string }> {
  const request = new NextRequest("http://localhost/api/reportes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const response = await postReportRoute(request);
  if (!response.ok) {
    throw new Error(`report submit failed: ${response.status}`);
  }
  const data = (await response.json()) as { public_id: string };
  return { publicId: data.public_id };
}
