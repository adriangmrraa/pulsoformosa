import type { StyleSpecification } from "maplibre-gl";
import { FORMOSA_BBOX } from "@/lib/domain/geo";

const { minLon, minLat, maxLon, maxLat } = FORMOSA_BBOX;

/**
 * Offline, self-contained basemap used when NEXT_PUBLIC_MAP_STYLE_URL is not
 * configured (and always in E2E). No remote sources, glyphs or sprites — the
 * canvas never leaves the network, so the suite stays deterministic.
 */
export const FALLBACK_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "pulso-formosa-fallback",
  sources: {
    "formosa-bounds": {
      type: "geojson",
      data: {
        type: "Feature",
        properties: { name: "Provincia de Formosa" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [minLon, minLat],
              [maxLon, minLat],
              [maxLon, maxLat],
              [minLon, maxLat],
              [minLon, minLat],
            ],
          ],
        },
      },
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#0b1520" },
    },
    {
      id: "formosa-outline",
      type: "line",
      source: "formosa-bounds",
      paint: {
        "line-color": "#45c6cc",
        "line-width": 1.5,
        "line-opacity": 0.55,
      },
    },
  ],
};
