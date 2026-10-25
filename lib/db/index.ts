import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return url;
}

let _sql: ReturnType<typeof neon> | null = null;

// Lazy singleton: the module can be imported (and built) without a live
// DATABASE_URL. The connection is created on first query.
export function getSql() {
  if (!_sql) {
    _sql = neon(databaseUrl());
  }
  return _sql;
}

function createDb() {
  return drizzle(getSql(), { schema });
}

type Db = ReturnType<typeof createDb>;

let _db: Db | null = null;

export function getDb(): Db {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Convenience proxy so callers can `import { db } from "@/lib/db"` and use it
// as a plain object. Property access is deferred until a query actually runs.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    return getDb()[prop as keyof Db];
  },
});
