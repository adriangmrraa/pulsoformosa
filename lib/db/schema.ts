// Drizzle schema for the real persistence seam (design-amendment obs #5628).
// Mirrors lib/server/store: public reports hold ONLY generalized geometry —
// private coordinates are snapped at ingest and never stored.
import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { PhotoRef, SourceRef } from "@/lib/domain/report";

export const reports = pgTable(
  "reports",
  {
    id: text("id").primaryKey(),
    // Client-supplied idempotency key: retried submissions dedupe on it.
    submissionId: text("submission_id").unique(),
    category: text("category").notNull(),
    subtype: text("subtype"),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    expectedSolution: text("expected_solution"),
    lon: doublePrecision("lon").notNull(),
    lat: doublePrecision("lat").notNull(),
    approxZone: text("approx_zone"),
    editorialStatus: text("editorial_status").notNull(),
    locationMethod: text("location_method"),
    photos: jsonb("photos").$type<PhotoRef[]>().notNull().default([]),
    sources: jsonb("sources").$type<SourceRef[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("reports_public_feed_idx")
      .on(table.publishedAt)
      .where(
        sql`editorial_status IN ('PUBLISHED_UNVERIFIED','VERIFIED_EDITORIALLY')`,
      ),
  ],
);

export const solutions = pgTable("solutions", {
  id: text("id").primaryKey(),
  reportId: text("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  evidenceNote: text("evidence_note"),
  evidenceUrl: text("evidence_url"),
  authorLabel: text("author_label"),
  authorAnonymous: boolean("author_anonymous").notNull().default(true),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Append-only moderation audit (spec §2.4/§16.1): a status change is never
// written without action + actor + reason.
export const moderationEvents = pgTable("moderation_events", {
  id: text("id").primaryKey(),
  solutionId: text("solution_id")
    .notNull()
    .references(() => solutions.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ReportRow = typeof reports.$inferSelect;
export type NewReportRow = typeof reports.$inferInsert;
export type SolutionRow = typeof solutions.$inferSelect;
export type ModerationEventRow = typeof moderationEvents.$inferSelect;
