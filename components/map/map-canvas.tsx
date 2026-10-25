"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FALLBACK_MAP_STYLE } from "@/lib/maps/fallback-style";
import type { MapPin } from "./map-pins";

export type { MapPin } from "./map-pins";
export { pinLabel } from "./map-pins";

interface MapCanvasProps {
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** [[minLon, minLat], [maxLon, maxLat]] for the initial fitBounds. */
  bounds: [[number, number], [number, number]];
}

const FIT_PADDING = { top: 56, bottom: 56, left: 56, right: 56 };

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * DOM-marker MapLibre canvas (loaded via next/dynamic ssr:false by
 * IncidentMap). Pin elements are real <button> nodes — keyboard-focusable,
 * ≥44px, aria-labelled by derived status. When WebGL is unavailable we render
 * the same contract as a plain list so tests and unsupported devices keep
 * full functionality.
 */
export default function MapCanvas(props: MapCanvasProps) {
  // Client-only component: probing WebGL in the state initializer is safe —
  // nothing here ever runs on the server.
  const [webgl] = useState(webglAvailable);
  const [failed, setFailed] = useState(false);

  if (!webgl || failed) {
    return (
      <FallbackPinList
        pins={props.pins}
        selectedId={props.selectedId}
        onSelect={props.onSelect}
      />
    );
  }

  return <RealMap {...props} onFailure={() => setFailed(true)} />;
}

function RealMap({
  pins,
  selectedId,
  onSelect,
  bounds,
  onFailure,
}: MapCanvasProps & { onFailure: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, maplibregl.Marker>());
  const elementsRef = useRef(new Map<string, HTMLButtonElement>());
  const onSelectRef = useRef(onSelect);
  const boundsRef = useRef(bounds);

  useEffect(() => {
    onSelectRef.current = onSelect;
    boundsRef.current = bounds;
  });

  // Mount once. Any failure to create the WebGL context surfaces through
  // onFailure and the home falls back to the pin list — never an empty hero.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const markers = markersRef.current;
    const elements = elementsRef.current;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container,
        style:
          process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
          (FALLBACK_MAP_STYLE as maplibregl.StyleSpecification),
        attributionControl: { compact: true },
      });
    } catch {
      onFailure();
      return;
    }

    mapRef.current = map;
    map.on("load", () => {
      map.fitBounds(boundsRef.current, {
        padding: FIT_PADDING,
        maxZoom: 14,
        duration: 0,
      });
    });
    map.on("error", () => {
      // A missing remote style degrades to the embedded fallback rather
      // than leaving a blank canvas.
      if (!map.getSource("formosa-bounds")) {
        try {
          map.setStyle(FALLBACK_MAP_STYLE as maplibregl.StyleSpecification);
        } catch {
          // leave it: markers still render on the styled canvas
        }
      }
    });

    return () => {
      for (const marker of markers.values()) marker.remove();
      markers.clear();
      elements.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; refs keep latest props
  }, []);

  // Keep DOM markers in sync with the pin set and derived statuses.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const pin of pins) {
      let marker = markersRef.current.get(pin.id);
      if (!marker) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = "report-pin";
        element.dataset.reportPin = pin.id;
        element.addEventListener("click", () => onSelectRef.current(pin.id));
        marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat([pin.lon, pin.lat])
          .addTo(map);
        markersRef.current.set(pin.id, marker);
        elementsRef.current.set(pin.id, element);
      }
      const element = elementsRef.current.get(pin.id)!;
      element.classList.toggle("report-pin--solved", pin.status === "solved");
      element.classList.toggle("report-pin--open", pin.status !== "solved");
      element.setAttribute("aria-label", pin.label);
    }

    for (const [id, marker] of markersRef.current) {
      if (!pins.some((pin) => pin.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
        elementsRef.current.delete(id);
      }
    }
  }, [pins]);

  // Selection focus: recenter without layout jumps; jump when reduced motion.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const pin = pins.find((item) => item.id === selectedId);
    if (!pin) return;

    for (const [id, element] of elementsRef.current) {
      element.classList.toggle("report-pin--selected", id === selectedId);
      element.setAttribute(
        "aria-pressed",
        id === selectedId ? "true" : "false",
      );
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduce) {
      map.jumpTo({ center: [pin.lon, pin.lat] });
    } else {
      map.easeTo({ center: [pin.lon, pin.lat], duration: 400 });
    }
  }, [selectedId, pins]);

  return (
    <div ref={containerRef} className="h-full w-full" data-maplibre-canvas />
  );
}

/**
 * Same selection contract as the DOM markers (data-report-pin + aria-label),
 * served when WebGL is unavailable — e.g. old devices or headless test runs.
 */
function FallbackPinList({
  pins,
  selectedId,
  onSelect,
}: Pick<MapCanvasProps, "pins" | "selectedId" | "onSelect">) {
  return (
    <ul
      aria-label="Reportes del mapa"
      className="grid max-h-full content-start gap-1.5 overflow-y-auto p-3"
    >
      {pins.map((pin) => (
        <li key={pin.id}>
          <button
            type="button"
            data-report-pin={pin.id}
            aria-label={pin.label}
            aria-pressed={pin.id === selectedId}
            onClick={() => onSelect(pin.id)}
            className="report-pin-row"
          >
            <span
              aria-hidden="true"
              className={
                pin.status === "solved"
                  ? "report-pin-dot report-pin-dot--solved"
                  : "report-pin-dot report-pin-dot--open"
              }
            />
            <span className="truncate">{pin.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
