import { z } from "zod";
import {
  GEOMETRY_MODES,
  LOCATION_METHODS,
  REPORT_CATEGORIES,
} from "@/lib/domain/taxonomy";

// §6.1 a–f client contract. Strict objects reject unknown props (§19.3).
export const reportFormSchema = z.strictObject({
  category: z.enum(REPORT_CATEGORIES),
  subtype: z.string().max(80).optional(),
  description: z.string().min(15).max(800),
  expected_solution: z.string().max(280).optional(),
  location: z.strictObject({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    method: z.enum(LOCATION_METHODS),
    accuracyM: z.number().positive().optional(),
  }),
  /** Optional barrio/reference label, stored as the public approx_zone. */
  zone_label: z.string().max(64).optional(),
  geometry_mode: z.enum(GEOMETRY_MODES).default("POINT"),
  consent: z.literal(true),
  idempotency_key: z.uuid(),
  turnstile_token: z.string().optional(),
});

export type ReportFormInput = z.infer<typeof reportFormSchema>;
