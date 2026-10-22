// §7 taxonomy — identifiers are stable English enums; labels are es-AR.
export const REPORT_CATEGORIES = [
  "WATER",
  "ROADS",
  "UTILITIES",
  "ENVIRONMENT_OTHER",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const EDITORIAL_STATUSES = [
  "PENDING_REVIEW",
  "PUBLISHED_UNVERIFIED",
  "VERIFIED_EDITORIALLY",
  "HIDDEN",
  "REJECTED",
  "ARCHIVED",
] as const;
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

export const REPORT_SOURCES = ["CITIZEN", "PROVIDER"] as const;
export type ReportSource = (typeof REPORT_SOURCES)[number];

export const GEOMETRY_MODES = [
  "POINT",
  "STREET_SEGMENT",
  "APPROXIMATE_AREA",
] as const;
export type GeometryMode = (typeof GEOMETRY_MODES)[number];

export const LOCATION_METHODS = ["gps", "manual_pin", "manual_search"] as const;
export type LocationMethod = (typeof LOCATION_METHODS)[number];

export const CATEGORY_SLUG_LIST = [
  "todos",
  "agua",
  "calles",
  "servicios",
  "ambiente",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUG_LIST)[number];

export const CATEGORY_SLUGS: Record<CategorySlug, ReportCategory | "ALL"> = {
  todos: "ALL",
  agua: "WATER",
  calles: "ROADS",
  servicios: "UTILITIES",
  ambiente: "ENVIRONMENT_OTHER",
};

export const SLUG_OF_CATEGORY: Record<ReportCategory, CategorySlug> = {
  WATER: "agua",
  ROADS: "calles",
  UTILITIES: "servicios",
  ENVIRONMENT_OTHER: "ambiente",
};

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  WATER: "Agua y anegamientos",
  ROADS: "Calles y rutas",
  UTILITIES: "Servicios",
  ENVIRONMENT_OTHER: "Ambiente y otros",
};

// §6.1.2 subtypes, verbatim.
export const SUBTYPES: Record<ReportCategory, readonly string[]> = {
  WATER: [
    "calle anegada",
    "agua dentro del domicilio",
    "desborde de zanja/canal",
    "ruta con agua",
    "desagüe obstruido",
    "patio/terreno inundado",
    "otro",
  ],
  ROADS: [
    "bache o calzada deteriorada",
    "socavón",
    "camino intransitable reportado",
    "puente/alcantarilla dañada",
    "árbol u obstáculo en calzada",
    "otro",
  ],
  UTILITIES: [
    "alumbrado",
    "residuos",
    "agua potable",
    "suministro eléctrico",
    "drenaje urbano",
    "otro",
  ],
  ENVIRONMENT_OTHER: [
    "residuos acumulados",
    "caída de árbol fuera de calzada",
    "erosión",
    "problema ambiental o infraestructura barrial",
  ],
};

// §20.7 editorial labels shown to the public.
export const EDITORIAL_LABELS: Record<EditorialStatus, string> = {
  PENDING_REVIEW: "En revisión",
  PUBLISHED_UNVERIFIED: "Reportado por un vecino — no verificado",
  VERIFIED_EDITORIALLY: "Corroborado",
  HIDDEN: "No disponible",
  REJECTED: "No disponible",
  ARCHIVED: "Archivado",
};

export function categoryFromSlug(slug: CategorySlug): ReportCategory | "ALL" {
  return CATEGORY_SLUGS[slug];
}
