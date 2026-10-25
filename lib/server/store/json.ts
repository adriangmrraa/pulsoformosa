import {
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { isPublicEditorialStatus } from "@/lib/domain/taxonomy";
import type { PublicReport } from "@/lib/domain/report";
import type { Solution } from "@/lib/domain/solution";
import type { ReportListPage, ReportQuery } from "@/lib/domain/types";
import type { SolutionFormInput } from "@/lib/validation/solution-form";
import { isProductionEnvironment } from "@/lib/env";
import { buildSeedData, zoneLabelForId } from "./seed";
import { filterStoredReports, paginateReports } from "./query";
import {
  newPublicId,
  summarizeDescription,
  StoreUnavailableError,
  toPublicReport,
  type ModerationAction,
  type ModerationEvent,
  type NewReportInput,
  type ReportStore,
  type StoredReport,
} from "./types";

interface StoreFile {
  version: 1;
  reports: StoredReport[];
  solutions: Solution[];
  moderation_events: ModerationEvent[];
}

/** Fresh object per call — never share mutable arrays between stores. */
function emptyStoreFile(): StoreFile {
  return { version: 1, reports: [], solutions: [], moderation_events: [] };
}

export function defaultDataDir(): string {
  return process.env.PULSO_DATA_DIR?.trim() || path.join(process.cwd(), "data");
}

/**
 * Dependency-free persistent store backed by a single JSON document. Writes
 * are serialized through an internal queue and flushed atomically (tmp file +
 * rename), so the file always contains complete data and survives restarts.
 * Used for local development and the deterministic e2e backend; refuses to
 * serve when PUBLIC_ENVIRONMENT_LABEL=production (a real DB must back prod).
 */
export class JsonReportStore implements ReportStore {
  readonly backend = "json" as const;
  private readonly filePath: string;
  private data: StoreFile | null = null;
  private mtimeMs = 0;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(dir?: string) {
    if (isProductionEnvironment()) {
      throw new StoreUnavailableError(
        "The JSON file store refuses to serve with PUBLIC_ENVIRONMENT_LABEL=production.",
      );
    }
    this.filePath = path.join(dir ?? defaultDataDir(), "store.json");
  }

  private load(): StoreFile {
    // The file is the source of truth: page renders and route handlers can be
    // instantiated in separate module realms (the e2e persistence suite caught
    // writes via POST /api/reportes never reaching a later page render), so a
    // changed mtime forces a re-read instead of serving stale memory.
    const stat = statSync(this.filePath, { throwIfNoEntry: false });
    if (this.data) {
      if (!stat || stat.mtimeMs === this.mtimeMs) return this.data;
      try {
        const fresh = JSON.parse(readFileSync(this.filePath, "utf8")) as StoreFile;
        if (fresh.version === 1) {
          this.data = fresh;
          this.mtimeMs = stat.mtimeMs;
        }
      } catch {
        // A torn write leaves this.data intact; the next load retries.
      }
      return this.data;
    }

    let parsed: StoreFile | null = null;
    try {
      parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as StoreFile;
    } catch {
      parsed = null;
    }

    if (parsed && parsed.version === 1) {
      this.data = parsed;
      this.mtimeMs = stat?.mtimeMs ?? 0;
      return parsed;
    }

    // First boot: seed the demo dataset unless disabled, then persist it —
    // from here on it behaves like any other real stored row.
    const seeded =
      process.env.PULSO_SEED_DEMO?.trim() === "0"
        ? emptyStoreFile()
        : { version: 1 as const, ...buildSeedData() };
    this.data = seeded;
    this.persist();
    return seeded;
  }

  private persist(): void {
    const data = this.data;
    if (!data) return;
    mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp-${process.pid}`;
    writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    renameSync(tmp, this.filePath);
    this.mtimeMs = statSync(this.filePath).mtimeMs;
  }

  /** Serializes read-modify-write cycles so concurrent handlers never race. */
  private async enqueue<T>(work: () => T | Promise<T>): Promise<T> {
    const run = this.queue.then(work);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async listReports(query: ReportQuery): Promise<ReportListPage> {
    const data = this.load();
    return paginateReports(
      filterStoredReports(data.reports, query, zoneLabelForId),
      query,
    );
  }

  async getReportById(id: string): Promise<PublicReport | null> {
    const data = this.load();
    const report = data.reports.find((item) => item.id === id);
    if (!report || !isPublicEditorialStatus(report.editorial_status)) {
      return null;
    }
    return toPublicReport(report);
  }

  async createReport(
    input: NewReportInput,
  ): Promise<{ report: PublicReport; created: boolean }> {
    return this.enqueue(() => {
      const data = this.load();
      const existing = data.reports.find(
        (item) => item.submission_id === input.submission_id,
      );
      if (existing) {
        return { report: toPublicReport(existing), created: false };
      }

      const now = new Date().toISOString();
      const report: StoredReport = {
        id: newPublicId("rpt"),
        submission_id: input.submission_id,
        category: input.category,
        subtype: input.subtype,
        summary: summarizeDescription(input.description),
        description: input.description,
        expected_solution: input.expected_solution,
        geometry: {
          type: "Point",
          coordinates: [input.lon, input.lat],
        },
        approx_zone: input.approx_zone,
        editorial_status: input.editorial_status,
        location_method: input.location_method,
        photos: [],
        sources: [],
        created_at: now,
        published_at: now,
        updated_at: now,
      };
      data.reports.push(report);
      this.persist();
      return { report: toPublicReport(report), created: true };
    });
  }

  async listSolutions(reportIds: string[]): Promise<Solution[]> {
    const data = this.load();
    const wanted = new Set(reportIds);
    return data.solutions.filter((item) => wanted.has(item.report_id));
  }

  async createSolution(
    reportId: string,
    input: SolutionFormInput,
  ): Promise<Solution | null> {
    return this.enqueue(() => {
      const data = this.load();
      const report = data.reports.find((item) => item.id === reportId);
      if (!report || !isPublicEditorialStatus(report.editorial_status)) {
        return null;
      }
      const solution: Solution = {
        id: newPublicId("sol"),
        report_id: reportId,
        text: input.text,
        evidence_note: input.evidence_note ?? null,
        evidence_url: input.evidence_url ?? null,
        author_label: input.author_label ?? null,
        author_anonymous: true,
        created_at: new Date().toISOString(),
        status: "pending",
      };
      data.solutions.push(solution);
      this.persist();
      return solution;
    });
  }

  async moderateSolution(
    solutionId: string,
    action: ModerationAction,
    reason: string,
    actor: string,
  ): Promise<Solution | null> {
    return this.enqueue(() => {
      const data = this.load();
      const solution = data.solutions.find((item) => item.id === solutionId);
      if (!solution) return null;

      solution.status = action === "approve" ? "approved" : "rejected";
      data.moderation_events.push({
        id: newPublicId("evt"),
        solution_id: solutionId,
        action,
        actor,
        reason,
        created_at: new Date().toISOString(),
      });
      this.persist();
      return solution;
    });
  }

  async listModerationEvents(solutionId?: string): Promise<ModerationEvent[]> {
    const data = this.load();
    return data.moderation_events.filter(
      (event) => !solutionId || event.solution_id === solutionId,
    );
  }
}
