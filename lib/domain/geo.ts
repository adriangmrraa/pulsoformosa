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
