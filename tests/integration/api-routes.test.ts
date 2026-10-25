// @vitest-environment node
/**
 * Real persistence contract tests (design-amendment obs #5628).
 *
 * Every request below goes through the production route handlers and lands in
 * a real JsonReportStore on disk (fresh mkdtemp per suite). No fetch mocks,
 * no in-memory fakes, no stubbed repositories.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getReportesRoute, POST as postReportRoute } from "@/app/api/reportes/route";
import { POST as postSolutionRoute } from "@/app/api/reportes/[id]/soluciones/route";
import { POST as moderateRoute } from "@/app/api/soluciones/[id]/moderate/route";
import { deriveReportStatus, type Solution } from "@/lib/domain/solution";
import { GENERALIZATION_STEP_DEG } from "@/lib/domain/geo";
import { getStore, resetStoreForTests } from "@/lib/server/store";
import type { ReportListPage } from "@/lib/domain/types";

const MODERATOR = "test-moderator-token";
const ORIGINAL_ENV = { ...process.env };

let dataDir: string;

function jsonRequest(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function validReportPayload(overrides: Record<string, unknown> = {}) {
  return {
    category: "WATER",
    description: "Agua acumulada sobre la calle desde anoche.",
    expected_solution: "Que destapen el desagüe de la esquina.",
    location: { lat: -26.1849, lon: -58.1731, method: "manual_pin" },
    zone_label: "Centro",
    geometry_mode: "POINT",
    consent: true,
    idempotency_key: crypto.randomUUID(),
    ...overrides,
  };
}

beforeEach(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), "pulso-api-test-"));
  vi.stubEnv("PULSO_DATA_DIR", dataDir);
  vi.stubEnv("PULSO_SEED_DEMO", "1");
  vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
  vi.stubEnv("MODERATOR_TOKEN", MODERATOR);
  delete process.env.DATABASE_URL;
  resetStoreForTests();
});

afterEach(() => {
  resetStoreForTests();
  vi.unstubAllEnvs();
  process.env = { ...ORIGINAL_ENV };
  rmSync(dataDir, { recursive: true, force: true });
});

describe("GET /api/reportes", () => {
  it("returns a paginated page of public reports only", async () => {
    const response = await getReportesRoute(
      new NextRequest("http://localhost/api/reportes?periodo=30d"),
    );
    expect(response.status).toBe(200);
    const page = (await response.json()) as ReportListPage;
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.total).toBeGreaterThanOrEqual(page.items.length);
    expect(
      page.items.some((item) => item.id === "rpt_mock_h1dd3n"),
    ).toBe(false);
    for (const item of page.items) {
      expect(["PUBLISHED_UNVERIFIED", "VERIFIED_EDITORIALLY"]).toContain(
        item.editorial_status,
      );
    }
  });

  it("applies the category filter", async () => {
    const response = await getReportesRoute(
      new NextRequest(
        "http://localhost/api/reportes?categoria=calles&periodo=30d",
      ),
    );
    const page = (await response.json()) as ReportListPage;
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((item) => item.category === "ROADS")).toBe(true);
  });
});

describe("POST /api/reportes", () => {
  it("persists a report and returns 201 with the public id", async () => {
    const response = await postReportRoute(
      jsonRequest("http://localhost/api/reportes", validReportPayload()),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.public_id).toMatch(/^rpt_[0-9a-f]{10}$/);
    expect(body.created).toBe(true);
    expect(body.editorial_status).toBe("PUBLISHED_UNVERIFIED");
  });

  it("generalizes the coordinate at ingest — the exact point never persists", async () => {
    const input = validReportPayload();
    const response = await postReportRoute(
      jsonRequest("http://localhost/api/reportes", input),
    );
    const { public_id } = await response.json();

    const store = await getStore();
    const stored = await store.getReportById(public_id);
    expect(stored).not.toBeNull();
    const [lon, lat] = stored!.geometry.coordinates;

    // Snapped to the ~250 m grid and different from the precise input.
    expect(lat).not.toBe(-26.1849);
    expect(lon).not.toBe(-58.1731);
    expect(Math.abs(lat / GENERALIZATION_STEP_DEG - Math.round(lat / GENERALIZATION_STEP_DEG))).toBeLessThan(1e-9);
    expect(Math.abs(lon / GENERALIZATION_STEP_DEG - Math.round(lon / GENERALIZATION_STEP_DEG))).toBeLessThan(1e-9);

    // The raw input never reaches disk either.
    const raw = readFileSync(path.join(dataDir, "store.json"), "utf8");
    expect(raw).not.toContain("-26.1849");
    expect(raw).not.toContain("-58.1731");
  });

  it("dedupes retries on the idempotency key", async () => {
    const payload = validReportPayload();
    const first = await postReportRoute(
      jsonRequest("http://localhost/api/reportes", payload),
    );
    const second = await postReportRoute(
      jsonRequest("http://localhost/api/reportes", payload),
    );
    const a = await first.json();
    const b = await second.json();
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(b.public_id).toBe(a.public_id);
    expect(b.created).toBe(false);
  });

  it("rejects reports outside the Formosa extent", async () => {
    const response = await postReportRoute(
      jsonRequest(
        "http://localhost/api/reportes",
        validReportPayload({
          location: { lat: -34.6, lon: -58.4, method: "manual_pin" },
        }),
      ),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("OUTSIDE_REGION");
  });

  it("rejects malformed payloads with 400", async () => {
    const response = await postReportRoute(
      jsonRequest("http://localhost/api/reportes", {
        category: "WATER",
        description: "short",
      }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/reportes/[id]/soluciones", () => {
  it("creates a pending solution on a public report", async () => {
    const reportId = "rpt_mock_9f3a1b";
    const response = await postSolutionRoute(
      jsonRequest(`http://localhost/api/reportes/${reportId}/soluciones`, {
        text: "Destapar el desagüe pluvial y repavimentar la esquina.",
      }),
      { params: Promise.resolve({ id: reportId }) },
    );
    expect(response.status).toBe(201);
    const solution = (await response.json()) as Solution;
    expect(solution.status).toBe("pending");
    expect(solution.author_anonymous).toBe(true);
    expect(solution.report_id).toBe(reportId);
  });

  it("returns 404 for hidden or unknown reports", async () => {
    for (const id of ["rpt_mock_h1dd3n", "rpt_mock_inexistente"]) {
      const response = await postSolutionRoute(
        jsonRequest(`http://localhost/api/reportes/${id}/soluciones`, {
          text: "Una solución cualquiera para probar el 404.",
        }),
        { params: Promise.resolve({ id }) },
      );
      expect(response.status).toBe(404);
    }
  });

  it("rejects out-of-schema payloads", async () => {
    const response = await postSolutionRoute(
      jsonRequest(
        "http://localhost/api/reportes/rpt_mock_9f3a1b/soluciones",
        { text: "corta" },
      ),
      { params: Promise.resolve({ id: "rpt_mock_9f3a1b" }) },
    );
    expect(response.status).toBe(400);
  });
});

describe("POST /api/soluciones/[id]/moderate", () => {
  async function seedSolution(): Promise<Solution> {
    const response = await postSolutionRoute(
      jsonRequest(
        "http://localhost/api/reportes/rpt_mock_9f3a1b/soluciones",
        { text: "Reponer las tapas del registro y señalizar el sector." },
      ),
      { params: Promise.resolve({ id: "rpt_mock_9f3a1b" }) },
    );
    return (await response.json()) as Solution;
  }

  function moderateRequest(solutionId: string, token?: string) {
    return moderateRoute(
      jsonRequest(
        `http://localhost/api/soluciones/${solutionId}/moderate`,
        { action: "approve", reason: "Verificado por la cuadrilla." },
        token ? { "x-moderator-token": token } : {},
      ),
      { params: Promise.resolve({ id: solutionId }) },
    );
  }

  it("rejects calls without a token or with a wrong token", async () => {
    const solution = await seedSolution();
    expect((await moderateRequest(solution.id)).status).toBe(401);
    expect((await moderateRequest(solution.id, "wrong")).status).toBe(401);

    const store = await getStore();
    const stored = (await store.listSolutions([solution.report_id])).find(
      (item) => item.id === solution.id,
    );
    expect(stored?.status).toBe("pending");
  });

  it("approves with the token, flips the derived status and audits it", async () => {
    const solution = await seedSolution();
    const response = await moderateRequest(solution.id, MODERATOR);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.solution.status).toBe("approved");
    expect(body.events).toHaveLength(1);
    expect(body.events[0]).toMatchObject({
      solution_id: solution.id,
      action: "approve",
      actor: "moderator",
      reason: "Verificado por la cuadrilla.",
    });

    // Approved → the report derives solved.
    const store = await getStore();
    const solutions = await store.listSolutions([solution.report_id]);
    expect(
      deriveReportStatus({ id: solution.report_id }, solutions),
    ).toBe("solved");
  });

  it("rejects with the token and keeps the event trail append-only", async () => {
    const solution = await seedSolution();
    const approve = await moderateRequest(solution.id, MODERATOR);
    expect(approve.status).toBe(200);

    const reject = await moderateRoute(
      jsonRequest(
        `http://localhost/api/soluciones/${solution.id}/moderate`,
        { action: "reject", reason: "Contenido inapropiado." },
        { "x-moderator-token": MODERATOR },
      ),
      { params: Promise.resolve({ id: solution.id }) },
    );
    expect(reject.status).toBe(200);
    const body = await reject.json();
    expect(body.solution.status).toBe("rejected");
    // Both decisions are preserved — the audit trail never deletes.
    expect(body.events).toHaveLength(2);
    expect(body.events.map((event: { action: string }) => event.action)).toEqual([
      "approve",
      "reject",
    ]);
  });

  it("returns 404 for an unknown solution", async () => {
    const response = await moderateRequest("sol_nope", MODERATOR);
    expect(response.status).toBe(404);
  });
});

describe("persistence across reloads", () => {
  it("survives a store reset — data is read back from disk, not memory", async () => {
    const created = await postReportRoute(
      jsonRequest("http://localhost/api/reportes", validReportPayload()),
    );
    const { public_id } = await created.json();

    const storeFile = path.join(dataDir, "store.json");
    expect(existsSync(storeFile)).toBe(true);

    // Simulate a process restart: drop the memoized store entirely.
    resetStoreForTests();
    const reloaded = await (await getStore()).getReportById(public_id);
    expect(reloaded?.id).toBe(public_id);
    expect(reloaded?.description).toBe(
      "Agua acumulada sobre la calle desde anoche.",
    );
    expect(reloaded?.expected_solution).toBe(
      "Que destapen el desagüe de la esquina.",
    );
  });

  it("leaves no partial file after concurrent creates", async () => {
    await Promise.all(
      [0, 1, 2].map((index) =>
        postReportRoute(
          jsonRequest(
            "http://localhost/api/reportes",
            validReportPayload({
              description: `Reporte concurrente número ${index} para la prueba.`,
            }),
          ),
        ),
      ),
    );
    const raw = readFileSync(path.join(dataDir, "store.json"), "utf8");
    const parsed = JSON.parse(raw);
    expect(
      parsed.reports.filter((report: { submission_id: string | null }) =>
        report.submission_id !== null,
      ),
    ).toHaveLength(3);
  });
});
