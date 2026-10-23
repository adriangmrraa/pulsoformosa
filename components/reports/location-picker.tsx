"use client";

import { useState } from "react";
import type { LocationMethod } from "@/lib/domain/taxonomy";
import { isInsideFormosaBBox } from "@/lib/domain/geo";
import {
  GPS_DENIED,
  MAP_PENDING_NOTE,
  OUTSIDE_REGION_ERROR,
} from "@/lib/domain/microcopy";

export interface PickedLocation {
  lat: number;
  lon: number;
}

interface LocationPickerProps {
  value: PickedLocation | null;
  method: LocationMethod | null;
  accuracyM?: number;
  onChange: (
    location: PickedLocation,
    method: LocationMethod,
    accuracyM?: number,
  ) => void;
  onBarrioChange?: (barrio: string) => void;
  barrio?: string;
  error?: string;
}

export function LocationPicker({
  value,
  method,
  accuracyM,
  onChange,
  onBarrioChange,
  barrio = "",
  error,
}: LocationPickerProps) {
  const [denied, setDenied] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [latText, setLatText] = useState<string | null>(null);
  const [lonText, setLonText] = useState<string | null>(null);
  const [outside, setOutside] = useState(false);

  const errorId = "location-error";
  // Derived display: a restored draft (value set after mount) shows up without
  // an effect, and manual typing takes precedence once touched.
  const displayLat = latText ?? (value ? String(value.lat) : "");
  const displayLon = lonText ?? (value ? String(value.lon) : "");

  function requestGps() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDenied(true);
      setManualOpen(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setLatText(String(next.lat));
        setLonText(String(next.lon));
        if (!isInsideFormosaBBox(next.lat, next.lon)) {
          setOutside(true);
          return;
        }
        setOutside(false);
        setDenied(false);
        onChange(next, "gps", position.coords.accuracy);
      },
      () => {
        setDenied(true);
        setManualOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function confirmManual() {
    const lat = Number(displayLat.replace(",", "."));
    const lon = Number(displayLon.replace(",", "."));

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setOutside(true);
      return;
    }
    if (!isInsideFormosaBBox(lat, lon)) {
      setOutside(true);
      return;
    }

    setOutside(false);
    onChange({ lat, lon }, "manual_pin");
  }

  return (
    <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-medium">Ubicación</legend>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={requestGps}
          className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium transition-ui hover:bg-muted"
        >
          Usar mi ubicación
        </button>
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium transition-ui hover:bg-muted"
        >
          Marcar en mapa
        </button>
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-left text-sm font-medium transition-ui hover:bg-muted"
        >
          No compartir mi ubicación actual; seleccionar otro lugar
        </button>
      </div>

      {accuracyM ? (
        <p className="text-[13px] text-text-secondary">
          Precisión aproximada del GPS: ±{Math.round(accuracyM)} m
        </p>
      ) : null}

      {denied ? (
        <p role="status" className="text-[13px] text-alerta-moderada">
          {GPS_DENIED}
        </p>
      ) : null}

      {outside ? (
        <p role="alert" className="text-[13px] text-alerta-alta">
          {OUTSIDE_REGION_ERROR}
        </p>
      ) : null}

      {manualOpen ? (
        <div className="space-y-2 rounded-lg border border-border bg-surface/60 p-3">
          <p className="text-[13px] text-text-secondary">{MAP_PENDING_NOTE}</p>

          <div>
            <label htmlFor="barrio" className="text-[13px] font-medium">
              Barrio o referencia
            </label>
            <input
              id="barrio"
              name="barrio"
              type="text"
              value={barrio}
              onChange={(event) => onBarrioChange?.(event.target.value)}
              placeholder="Ej.: Barrio San Martín, cerca de la plaza"
              className="mt-1 min-h-11 w-full rounded-lg border border-border bg-navy px-3 text-[15px]"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label htmlFor="latitud" className="text-[13px] font-medium">
                Latitud
              </label>
              <input
                id="latitud"
                name="latitud"
                inputMode="decimal"
                value={displayLat}
                onChange={(event) => setLatText(event.target.value)}
                placeholder="-26.18"
                className="tabular mt-1 min-h-11 w-full rounded-lg border border-border bg-navy px-3 text-[15px]"
              />
            </div>
            <div>
              <label htmlFor="longitud" className="text-[13px] font-medium">
                Longitud
              </label>
              <input
                id="longitud"
                name="longitud"
                inputMode="decimal"
                value={displayLon}
                onChange={(event) => setLonText(event.target.value)}
                placeholder="-58.18"
                className="tabular mt-1 min-h-11 w-full rounded-lg border border-border bg-navy px-3 text-[15px]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={confirmManual}
            className="inline-flex min-h-11 items-center rounded-lg bg-accent-agua px-4 text-sm font-semibold text-background transition-ui"
          >
            Confirmar ubicación
          </button>
        </div>
      ) : null}

      {value && !outside ? (
        <p className="tabular text-[13px] text-text-secondary">
          Ubicación marcada: {value.lat.toFixed(5)}, {value.lon.toFixed(5)}
          {method === "gps" ? " · GPS" : " · manual"}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-[13px] text-alerta-alta">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
