// ~14 fixture reports, POINT geometry only. IDs are opaque and non-sequential.
// Timestamps are generated relative to module load so the 24h/7d/30d filters
// stay meaningful in any run; nothing here claims to be a real incident.
import type { PublicReport } from "@/lib/domain/report";
import type { EditorialStatus, ReportCategory } from "@/lib/domain/taxonomy";

export const FIXTURE_CAPTURED_AT = "2026-10-22T10:00:00.000Z";

const NOW_MS = Date.now();

function hoursAgo(hours: number): string {
  return new Date(NOW_MS - hours * 3_600_000).toISOString();
}

export const FIXTURE_ZONES = [
  { id: "centro", label: "Centro" },
  { id: "san-martin", label: "Barrio San Martín" },
  { id: "zona-norte", label: "Zona Norte" },
  { id: "la-nueva-formosa", label: "Barrio La Nueva Formosa" },
  { id: "zona-sur", label: "Zona Sur" },
  { id: "italia", label: "Barrio Italia" },
] as const;

export const FIXTURE_ZONE_IDS = FIXTURE_ZONES.map((zone) => zone.id);

export function zoneLabelForId(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return FIXTURE_ZONES.find((zone) => zone.id === id)?.label;
}

interface Seed {
  id: string;
  category: ReportCategory;
  subtype: string;
  summary: string;
  zone: string;
  hours: number;
  lon: number;
  lat: number;
  status?: EditorialStatus;
  expectedSolution?: string;
}

const SEEDS: readonly Seed[] = [
  {
    id: "rpt_mock_9f3a1b",
    category: "WATER",
    subtype: "calle anegada",
    summary: "Agua acumulada sobre la calzada frente a la plaza del barrio.",
    zone: "Centro",
    hours: 1,
    lon: -58.179,
    lat: -26.181,
  },
  {
    id: "rpt_mock_c7d2e4",
    category: "WATER",
    subtype: "agua dentro del domicilio",
    summary: "Ingresó agua en una vivienda baja durante la lluvia de anoche.",
    zone: "Barrio San Martín",
    hours: 2,
    lon: -58.188,
    lat: -26.176,
  },
  {
    id: "rpt_mock_1a8b5c",
    category: "WATER",
    subtype: "desborde de zanja/canal",
    summary: "La zanja del lateral desborda y arrastra residuos a la vereda.",
    zone: "Zona Norte",
    hours: 3,
    lon: -58.171,
    lat: -26.163,
  },
  {
    id: "rpt_mock_e4f6a2",
    category: "ROADS",
    subtype: "bache o calzada deteriorada",
    summary: "Bache profundo en la mano derecha, dificulta circular en bicicleta.",
    zone: "Centro",
    hours: 5,
    lon: -58.183,
    lat: -26.183,
    status: "VERIFIED_EDITORIALLY",
    expectedSolution: "Rellenar y compactar el bache con material de mejoramiento.",
  },
  {
    id: "rpt_mock_7b9d31",
    category: "ROADS",
    subtype: "socavón",
    summary: "Socavón junto al cordón después de las últimas lluvias.",
    zone: "Barrio La Nueva Formosa",
    hours: 8,
    lon: -58.196,
    lat: -26.17,
  },
  {
    id: "rpt_mock_2c5e80",
    category: "UTILITIES",
    subtype: "alumbrado",
    summary: "Tres luminarias apagadas en la cuadra desde hace varios días.",
    zone: "Zona Sur",
    hours: 12,
    lon: -58.19,
    lat: -26.193,
  },
  {
    id: "rpt_mock_d8a1f4",
    category: "WATER",
    subtype: "ruta con agua",
    summary: "Agua sobre la banquina de la ruta de acceso al barrio.",
    zone: "Zona Norte",
    hours: 20,
    lon: -58.165,
    lat: -26.157,
  },
  {
    id: "rpt_mock_6e3b7c",
    category: "ROADS",
    subtype: "árbol u obstáculo en calzada",
    summary: "Rama caída ocupa media calzada y obliga a frenar.",
    zone: "Centro",
    hours: 30,
    lon: -58.181,
    lat: -26.185,
  },
  {
    id: "rpt_mock_b5f0a9",
    category: "UTILITIES",
    subtype: "residuos",
    summary: "Residuos sin recolectar en la esquina, con bolsas abiertas.",
    zone: "Barrio Italia",
    hours: 50,
    lon: -58.205,
    lat: -26.19,
  },
  {
    id: "rpt_mock_4a7c2e",
    category: "ENVIRONMENT_OTHER",
    subtype: "residuos acumulados",
    summary: "Montículo de restos de poda y escombros en un terreno baldío.",
    zone: "Zona Sur",
    hours: 80,
    lon: -58.199,
    lat: -26.2,
  },
  {
    id: "rpt_mock_f1d8b3",
    category: "WATER",
    subtype: "desagüe obstruido",
    summary: "Rejilla tapada: el agua no drena y se junta en la esquina.",
    zone: "Centro",
    hours: 120,
    lon: -58.177,
    lat: -26.178,
  },
  {
    id: "rpt_mock_8c2e6a",
    category: "ROADS",
    subtype: "puente/alcantarilla dañada",
    summary: "Baranda del puente peatonal suelta; pide revisión.",
    zone: "Zona Norte",
    hours: 180,
    lon: -58.169,
    lat: -26.151,
  },
  {
    id: "rpt_mock_3d9f5b",
    category: "UTILITIES",
    subtype: "drenaje urbano",
    summary: "Boca de tormenta sin tapa sobre la vereda.",
    zone: "Barrio San Martín",
    hours: 300,
    lon: -58.186,
    lat: -26.174,
  },
  {
    id: "rpt_mock_a6b4d7",
    category: "ENVIRONMENT_OTHER",
    subtype: "erosión",
    summary: "Erosión visible en el borde del camino de tierra.",
    zone: "Zona Sur",
    hours: 800,
    lon: -58.202,
    lat: -26.205,
  },
];

export const REPORTS_FIXTURE: readonly PublicReport[] = SEEDS.map((seed) => {
  const publishedAt = hoursAgo(seed.hours);
  return {
    id: seed.id,
    category: seed.category,
    geometry: { type: "Point", coordinates: [seed.lon, seed.lat] },
    approx_zone: seed.zone,
    published_at: publishedAt,
    created_at: publishedAt,
    subtype: seed.subtype,
    summary: seed.summary,
    photos: [],
    updated_at: publishedAt,
    sources:
      seed.status === "VERIFIED_EDITORIALLY"
        ? [
            {
              label: "Verificación editorial simulada (mock)",
              url: "mock://editorial/verification",
            },
          ]
        : [],
    editorial_status: seed.status ?? "PUBLISHED_UNVERIFIED",
    description: `${seed.summary} Dato de prueba generado para desarrollo; no corresponde a un hecho real.`,
    expected_solution: seed.expectedSolution ?? null,
    location_method: "manual_pin",
  } satisfies PublicReport;
});

export const HIDDEN_REPORT_FIXTURE: PublicReport = {
  ...REPORTS_FIXTURE[0],
  id: "rpt_mock_h1dd3n",
  summary: "Contenido retirado que no debe exponerse.",
  description:
    "Contenido retirado que no debe exponerse. Dato de prueba generado para desarrollo; no corresponde a un hecho real.",
  editorial_status: "HIDDEN",
};

export const FIXTURE_REPORT_IDS = REPORTS_FIXTURE.map((report) => report.id);
