/**
 * Approximate provincial extent of Formosa, Argentina.
 *
 * Source: OpenStreetMap relation 153554 (Provincia de Formosa) boundary extent,
 * cross-checked against the IGN provincial polygon at C1B-b. This is a
 * conservative UX hint (superset with tolerance), NOT authoritative geometry:
 * server-side polygon validation lands in C2.
 */
export const FORMOSA_BBOX = {
  minLon: -62.7,
  minLat: -26.42,
  maxLon: -57.6,
  maxLat: -21.7,
} as const;

const METERS_PER_DEGREE_LAT = 111_320;

export function isInsideFormosaBBox(
  lat: number,
  lon: number,
  toleranceM = 15_000,
): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;

  const latTolerance = toleranceM / METERS_PER_DEGREE_LAT;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const lonTolerance =
    Math.abs(cosLat) < 1e-6 ? 360 : toleranceM / (METERS_PER_DEGREE_LAT * Math.abs(cosLat));

  return (
    lat >= FORMOSA_BBOX.minLat - latTolerance &&
    lat <= FORMOSA_BBOX.maxLat + latTolerance &&
    lon >= FORMOSA_BBOX.minLon - lonTolerance &&
    lon <= FORMOSA_BBOX.maxLon + lonTolerance
  );
}

export type BBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

/**
 * Public geo-generalization step (~250 m). Applied at ingest so the private
 * coordinate is never persisted — only the generalized one reaches storage
 * and clients (spec §16.4: deterministic displacement inside a geo cell).
 */
export const GENERALIZATION_STEP_DEG = 0.0023;

function snapToGrid(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Deterministically snaps a coordinate to the ~250 m public grid. Same input
 * always yields the same output, so a point never jitter-discloses more than
 * the grid cell it falls in.
 */
export function generalizeCoordinate(
  lat: number,
  lon: number,
): { lat: number; lon: number } {
  return {
    lat: Number(snapToGrid(lat, GENERALIZATION_STEP_DEG).toFixed(6)),
    lon: Number(snapToGrid(lon, GENERALIZATION_STEP_DEG).toFixed(6)),
  };
}
