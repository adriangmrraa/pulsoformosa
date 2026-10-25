import { JsonReportStore } from "./json";
import { PgReportStore } from "./pg";
import type { ReportStore } from "./types";

export { JsonReportStore } from "./json";
export { StoreUnavailableError } from "./types";
export type {
  ModerationAction,
  ModerationEvent,
  NewReportInput,
  ReportStore,
  StoreBackend,
  StoredReport,
} from "./types";

let cached: Promise<ReportStore> | null = null;

async function initStore(): Promise<ReportStore> {
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const store = new PgReportStore();
      await store.init();
      return store;
    } catch (error) {
      // Neon unreachable (offline dev, bad URL): the JSON file store is the
      // documented fallback — still real persistence, no in-memory fake.
      console.warn(
        JSON.stringify({
          event: "pg_store_unavailable_json_fallback",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
  const store = new JsonReportStore();
  // Trigger the load/seed now so a misconfigured data dir fails at boot.
  await store.listReports({ category: "ALL", period: "30d", limit: 1 });
  return store;
}

/**
 * Single store for every runtime consumer (page + route handlers). Backend
 * selection: DATABASE_URL set → Postgres; otherwise the JSON file store.
 * PUBLIC_ENVIRONMENT_LABEL=production without a working DATABASE_URL refuses
 * to serve (the JSON dev store throws the same way the mock provider did).
 */
export async function getStore(): Promise<ReportStore> {
  if (!cached) {
    cached = initStore();
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

/** Test seam: drops the memoized store so PULSO_DATA_DIR changes take effect. */
export function resetStoreForTests(): void {
  cached = null;
}
