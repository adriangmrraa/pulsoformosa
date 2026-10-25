import { z } from "zod";
import {
  SOLUTION_AUTHOR_LABEL_MAX,
  SOLUTION_EVIDENCE_NOTE_MAX,
  SOLUTION_EVIDENCE_URL_MAX,
  SOLUTION_TEXT_MAX,
  SOLUTION_TEXT_MIN,
} from "@/lib/domain/solution";

/**
 * Community solution proposal. strictObject keeps personal data out —
 * author identity is anonymous by contract (author_anonymous: true).
 */
export const solutionFormSchema = z.strictObject({
  text: z.string().min(SOLUTION_TEXT_MIN).max(SOLUTION_TEXT_MAX),
  evidence_note: z.string().max(SOLUTION_EVIDENCE_NOTE_MAX).optional(),
  evidence_url: z.url().max(SOLUTION_EVIDENCE_URL_MAX).optional(),
  author_label: z.string().max(SOLUTION_AUTHOR_LABEL_MAX).optional(),
});

export type SolutionFormInput = z.infer<typeof solutionFormSchema>;
