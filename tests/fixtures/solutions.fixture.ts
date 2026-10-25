// Mock community solutions. Every contribution is anonymous by contract;
// statuses exercise the derivation: approved -> solved, pending/rejected -> open.
import type { Solution } from "@/lib/domain/solution";

const NOW_MS = Date.now();

function hoursAgo(hours: number): string {
  return new Date(NOW_MS - hours * 3_600_000).toISOString();
}

export const SOLUTIONS_FIXTURE: readonly Solution[] = [
  {
    // Approved: rpt_mock_e4f6a2 (bache, verificado) renders as "Resuelto".
    id: "sol_mock_a1f2c3",
    report_id: "rpt_mock_e4f6a2",
    text: "La cuadrilla rellenó el bache y compactó el tramo; ya se circula normal.",
    evidence_note: "Trabajo observado en la semana (verificación simulada).",
    evidence_url: "mock://evidence/bache-reparado",
    author_label: "Vecina del barrio",
    author_anonymous: true,
    created_at: hoursAgo(2),
    status: "approved",
  },
  {
    // Pending on the most recent report: it stays "Abierto".
    id: "sol_mock_b2d4e6",
    report_id: "rpt_mock_9f3a1b",
    text: "Colocar una bomba de achicado mientras dure la lluvia y limpiar el desagüe.",
    evidence_note: null,
    evidence_url: null,
    author_label: null,
    author_anonymous: true,
    created_at: hoursAgo(1),
    status: "pending",
  },
  {
    // Pending on an older report: feeds the "N soluciones" card badge.
    id: "sol_mock_d4e6a8",
    report_id: "rpt_mock_f1d8b3",
    text: "Destapar la rejilla con una limpieza mecánica programada del caño.",
    evidence_note: "Ya pasó una cuadrilla pero volvió a taparse.",
    evidence_url: null,
    author_label: "Vecino",
    author_anonymous: true,
    created_at: hoursAgo(20),
    status: "pending",
  },
  {
    // Rejected: must never render publicly (PNL-04).
    id: "sol_mock_r3j3ct",
    report_id: "rpt_mock_c7d2e4",
    text: "Reclamar al seguro por los daños del ingreso de agua en la vivienda.",
    evidence_note: null,
    evidence_url: null,
    author_label: null,
    author_anonymous: true,
    created_at: hoursAgo(1.5),
    status: "rejected",
  },
];
