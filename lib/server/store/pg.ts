import { desc, eq, inArray } from "drizzle-orm";
import { getDb, getSql } from "@/lib/db";
import {
  moderationEvents,
  reports,
  solutions,
  type ModerationEventRow,
  type ReportRow,
  type SolutionRow,
} from "@/lib/db/schema";
import { isPublicEditorialStatus } from "@/lib/domain/taxonomy";
import type { PublicReport } from "@/lib/domain/report";
import type { Solution } from "@/lib/domain/solution";
import type { ReportListPage, ReportQuery } from "@/lib/domain/types";
import type { SolutionFormInput } from "@/lib/validation/solution-form";
import { zoneLabelForId } from "./seed";
import { filterStoredReports, paginateReports } from "./query";
import {
  newPublicId,
  summarizeDescription,
  toPublicReport,
  type ModerationAction,
  type ModerationEvent,
  type NewReportInput,
  type ReportStore,
  type StoredReport,
} from "./types";

const INIT_TIMEOUT_MS = 5_000;

// Idempotent DDL matching lib/db/schema.ts — keeps a fresh DATABASE_URL
// usable even when `db:migrate` has not run yet (drizzle/ holds the canonical
// generated migration for managed environments). Executed one statement per
// call: the neon-http driver rejects multi-command prepared statements.
const ENSURE_SCHEMA_SQL = [
  `
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  submission_id TEXT UNIQUE,
  category TEXT NOT NULL,
  subtype TEXT,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  expected_solution TEXT,
  lon DOUBLE PRECISION NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  approx_zone TEXT,
  editorial_status TEXT NOT NULL,
  location_method TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`,
  `
CREATE TABLE IF NOT EXISTS solutions (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  evidence_note TEXT,
  evidence_url TEXT,
  author_label TEXT,
  author_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`,
  `
CREATE TABLE IF NOT EXISTS moderation_events (
  id TEXT PRIMARY KEY,
  solution_id TEXT NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`,
];

function toStoredReport(row: ReportRow): StoredReport {
  return {
    id: row.id,
    submission_id: row.submissionId,
    category: row.category as StoredReport["category"],
    subtype: row.subtype,
    summary: row.summary,
    description: row.description,
    expected_solution: row.expectedSolution,
    geometry: { type: "Point", coordinates: [row.lon, row.lat] },
    approx_zone: row.approxZone,
    editorial_status: row.editorialStatus as StoredReport["editorial_status"],
    location_method: row.locationMethod as StoredReport["location_method"],
    photos: row.photos ?? [],
    sources: row.sources ?? [],
    created_at: row.createdAt.toISOString(),
    published_at: (row.publishedAt ?? row.createdAt).toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

function toSolution(row: SolutionRow): Solution {
  return {
    id: row.id,
    report_id: row.reportId,
    text: row.text,
    evidence_note: row.evidenceNote,
    evidence_url: row.evidenceUrl,
    author_label: row.authorLabel,
    author_anonymous: true,
    created_at: row.createdAt.toISOString(),
    status: row.status as Solution["status"],
  };
}

function toEvent(row: ModerationEventRow): ModerationEvent {
  return {
    id: row.id,
    solution_id: row.solutionId,
    action: row.action as ModerationAction,
    actor: row.actor,
    reason: row.reason,
    created_at: row.createdAt.toISOString(),
  };
}

/**
 * Real Postgres backend (Neon via @neondatabase/serverless + drizzle-orm).
 * init() probes connectivity and idempotently ensures the schema so the
 * selector in ./index.ts can fall back to the JSON store when unreachable.
 */
export class PgReportStore implements ReportStore {
  readonly backend = "pg" as const;

  async init(): Promise<void> {
    const sql = getSql();
    const probe = sql`select 1 as ok`;
    await Promise.race([
      probe,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("pg probe timed out")),
          INIT_TIMEOUT_MS,
        ),
      ),
    ]);
    for (const statement of ENSURE_SCHEMA_SQL) {
      await sql.query(statement, []);
    }
  }

  async listReports(query: ReportQuery): Promise<ReportListPage> {
    const rows = await getDb()
      .select()
      .from(reports)
      .orderBy(desc(reports.publishedAt));
    const stored = rows.map(toStoredReport);
    return paginateReports(
      filterStoredReports(stored, query, zoneLabelForId),
      query,
    );
  }

  async getReportById(id: string): Promise<PublicReport | null> {
    const rows = await getDb()
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    const report = toStoredReport(row);
    if (!isPublicEditorialStatus(report.editorial_status)) return null;
    return toPublicReport(report);
  }

  async createReport(
    input: NewReportInput,
  ): Promise<{ report: PublicReport; created: boolean }> {
    const db = getDb();
    const existing = await db
      .select()
      .from(reports)
      .where(eq(reports.submissionId, input.submission_id))
      .limit(1);
    if (existing[0]) {
      return {
        report: toPublicReport(toStoredReport(existing[0])),
        created: false,
      };
    }

    const now = new Date();
    const id = newPublicId("rpt");
    const values = {
      id,
      submissionId: input.submission_id,
      category: input.category,
      subtype: input.subtype,
      summary: summarizeDescription(input.description),
      description: input.description,
      expectedSolution: input.expected_solution,
      lon: input.lon,
      lat: input.lat,
      approxZone: input.approx_zone,
      editorialStatus: input.editorial_status,
      locationMethod: input.location_method,
      photos: [],
      sources: [],
      createdAt: now,
      publishedAt: now,
      updatedAt: now,
    };
    try {
      await db.insert(reports).values(values);
    } catch {
      // Concurrent duplicate submission: the UNIQUE constraint on
      // submission_id fires — the original row wins.
      const raced = await db
        .select()
        .from(reports)
        .where(eq(reports.submissionId, input.submission_id))
        .limit(1);
      if (raced[0]) {
        return {
          report: toPublicReport(toStoredReport(raced[0])),
          created: false,
        };
      }
      throw new Error("report insert failed");
    }

    const report = await this.getReportById(id);
    if (!report) throw new Error("report insert failed");
    return { report, created: true };
  }

  async listSolutions(reportIds: string[]): Promise<Solution[]> {
    if (reportIds.length === 0) return [];
    const rows = await getDb()
      .select()
      .from(solutions)
      .where(inArray(solutions.reportId, reportIds));
    return rows.map(toSolution);
  }

  async createSolution(
    reportId: string,
    input: SolutionFormInput,
  ): Promise<Solution | null> {
    const report = await this.getReportById(reportId);
    if (!report) return null;

    const row = {
      id: newPublicId("sol"),
      reportId,
      text: input.text,
      evidenceNote: input.evidence_note ?? null,
      evidenceUrl: input.evidence_url ?? null,
      authorLabel: input.author_label ?? null,
      authorAnonymous: true,
      status: "pending",
      createdAt: new Date(),
    };
    await getDb().insert(solutions).values(row);
    return toSolution(row as SolutionRow);
  }

  async moderateSolution(
    solutionId: string,
    action: ModerationAction,
    reason: string,
    actor: string,
  ): Promise<Solution | null> {
    const db = getDb();
    const status = action === "approve" ? "approved" : "rejected";
    const eventRow = {
      id: newPublicId("evt"),
      solutionId,
      action,
      actor,
      reason,
      createdAt: new Date(),
    };

    // Single HTTP batch: status flip + append-only audit row land together.
    const [updated] = await db.batch([
      db
        .update(solutions)
        .set({ status })
        .where(eq(solutions.id, solutionId))
        .returning(),
      db.insert(moderationEvents).values(eventRow).returning(),
    ]);

    const row = updated[0];
    if (!row) return null;
    return toSolution(row);
  }

  async listModerationEvents(solutionId?: string): Promise<ModerationEvent[]> {
    const db = getDb();
    const rows = solutionId
      ? await db
          .select()
          .from(moderationEvents)
          .where(eq(moderationEvents.solutionId, solutionId))
      : await db.select().from(moderationEvents);
    return rows.map(toEvent);
  }
}
