// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  SOLUTION_AUTHOR_LABEL_MAX,
  SOLUTION_EVIDENCE_NOTE_MAX,
  SOLUTION_EVIDENCE_URL_MAX,
  SOLUTION_TEXT_MAX,
  SOLUTION_TEXT_MIN,
  deriveReportStatus,
  type Solution,
} from "@/lib/domain/solution";

function solution(partial: Partial<Solution> & { report_id: string }): Solution {
  return {
    id: partial.id ?? "sol_mock_000001",
    report_id: partial.report_id,
    text: partial.text ?? "Se rellenó el bache con material de mejoramiento.",
    evidence_note: partial.evidence_note ?? null,
    evidence_url: partial.evidence_url ?? null,
    author_label: partial.author_label ?? null,
    author_anonymous: true,
    created_at: partial.created_at ?? "2026-10-22T10:00:00.000Z",
    status: partial.status ?? "pending",
  };
}

describe("deriveReportStatus", () => {
  it("returns solved when at least one solution is approved", () => {
    const solutions = [
      solution({ report_id: "rpt_mock_9f3a1b", status: "approved" }),
    ];
    expect(deriveReportStatus({ id: "rpt_mock_9f3a1b" }, solutions)).toBe(
      "solved",
    );
  });

  it("returns open when every solution is only pending", () => {
    const solutions = [
      solution({ report_id: "rpt_mock_9f3a1b", status: "pending" }),
      solution({ report_id: "rpt_mock_9f3a1b", status: "pending" }),
    ];
    expect(deriveReportStatus({ id: "rpt_mock_9f3a1b" }, solutions)).toBe(
      "open",
    );
  });

  it("returns open when there are no solutions at all", () => {
    expect(deriveReportStatus({ id: "rpt_mock_9f3a1b" }, [])).toBe("open");
  });

  it("returns open when the only solutions are rejected", () => {
    const solutions = [
      solution({ report_id: "rpt_mock_9f3a1b", status: "rejected" }),
    ];
    expect(deriveReportStatus({ id: "rpt_mock_9f3a1b" }, solutions)).toBe(
      "open",
    );
  });

  it("does not leak an approved solution across reports", () => {
    const solutions = [
      solution({ report_id: "rpt_mock_e4f6a2", status: "approved" }),
    ];
    expect(deriveReportStatus({ id: "rpt_mock_9f3a1b" }, solutions)).toBe(
      "open",
    );
  });

  it("solves with mixed pending + approved on the same report", () => {
    const solutions = [
      solution({ report_id: "rpt_mock_9f3a1b", status: "pending" }),
      solution({ report_id: "rpt_mock_9f3a1b", status: "rejected" }),
      solution({ report_id: "rpt_mock_9f3a1b", status: "approved" }),
    ];
    expect(deriveReportStatus({ id: "rpt_mock_9f3a1b" }, solutions)).toBe(
      "solved",
    );
  });
});

describe("solution bounds", () => {
  it("exports the agreed field bounds", () => {
    expect(SOLUTION_TEXT_MIN).toBe(10);
    expect(SOLUTION_TEXT_MAX).toBe(500);
    expect(SOLUTION_EVIDENCE_NOTE_MAX).toBe(280);
    expect(SOLUTION_EVIDENCE_URL_MAX).toBe(300);
    expect(SOLUTION_AUTHOR_LABEL_MAX).toBe(60);
  });
});
