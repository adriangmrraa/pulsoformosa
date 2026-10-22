import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClimateContextCard } from "@/components/climate/climate-context-card";
import { WeatherPreview } from "@/components/climate/weather-preview";
import { RiverLevelCard } from "@/components/climate/river-level-card";
import { CommunitySnapshot } from "@/components/home/community-snapshot";
import {
  CLIMATE_FIXTURE,
  CLIMATE_NULL_PROBE,
  COMMUNITY_FIXTURE,
  RIVER_FIXTURE,
  RIVER_NULL_PROBE,
  WEATHER_FIXTURE,
  WEATHER_NULL_PROBE,
} from "@/tests/fixtures/overview.fixture";
import {
  FORECAST_DISCLAIMER,
  LOADING_DATA,
  QUICK_SUMMARY_TITLE,
  RIVER_DATUM_DISCLAIMER,
} from "@/lib/domain/microcopy";

describe("data-bearing component states", () => {
  it("renders a loading message instead of an infinite spinner", () => {
    render(<ClimateContextCard state={{ status: "loading" }} fixture />);
    expect(screen.getByText(LOADING_DATA)).toBeInTheDocument();
  });

  it("renders an accessible error state", () => {
    render(
      <ClimateContextCard
        state={{ status: "error", message: "No pudimos actualizar esta medición." }}
        fixture
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No pudimos actualizar esta medición.",
    );
  });

  it("never renders 0% when the probability is null", () => {
    render(
      <ClimateContextCard
        state={{ status: "success", data: CLIMATE_NULL_PROBE }}
        fixture
      />,
    );
    expect(screen.getAllByText("Sin dato").length).toBeGreaterThan(0);
    expect(screen.queryByText("0%")).toBeNull();
    expect(
      screen.getByText(
        "Probabilidad de fase El Niño: no representa probabilidad de inundación en tu barrio.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the stale notice for stale climate data", () => {
    render(
      <ClimateContextCard
        state={{
          status: "stale",
          data: CLIMATE_FIXTURE,
          since: CLIMATE_FIXTURE.observed_at,
        }}
        fixture
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "sin actualización reciente",
    );
  });

  it("renders the forecast disclaimer and Sin dato reciente for null precipitation", () => {
    render(
      <WeatherPreview
        state={{ status: "success", data: WEATHER_NULL_PROBE }}
        fixture
      />,
    );
    expect(screen.getByText(FORECAST_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getAllByText("Sin dato reciente").length).toBeGreaterThan(0);
  });

  it("renders the forecast card with data", () => {
    render(
      <WeatherPreview state={{ status: "success", data: WEATHER_FIXTURE }} fixture />,
    );
    expect(screen.getByText("Próximas lluvias")).toBeInTheDocument();
    expect(screen.getByText("18.5 mm")).toBeInTheDocument();
  });

  it("never renders 0 m or Normal when the river level is null", () => {
    render(
      <RiverLevelCard
        state={{ status: "success", data: RIVER_NULL_PROBE }}
        fixture
      />,
    );
    expect(screen.getByText("Sin dato reciente")).toBeInTheDocument();
    expect(screen.queryByText(/0(\.0+)? m/)).toBeNull();
    expect(screen.queryByText("Normal")).toBeNull();
    expect(screen.getByText(RIVER_DATUM_DISCLAIMER)).toBeInTheDocument();
  });

  it("renders the river level with its datum line", () => {
    render(
      <RiverLevelCard state={{ status: "success", data: RIVER_FIXTURE }} fixture />,
    );
    expect(screen.getByText("3.2 m")).toBeInTheDocument();
    expect(screen.getByText(RIVER_DATUM_DISCLAIMER)).toBeInTheDocument();
  });

  it("renders the community microsummary", () => {
    render(
      <CommunitySnapshot
        state={{ status: "success", data: COMMUNITY_FIXTURE }}
        fixture
        predominantCategoryLabel="Agua y anegamientos"
        generatedAt="2026-10-22T10:00:00.000Z"
      />,
    );
    expect(screen.getByText(QUICK_SUMMARY_TITLE)).toBeInTheDocument();
    expect(screen.getByText(/Categoría predominante:/)).toHaveTextContent(
      "Agua y anegamientos",
    );
  });

  it("renders an explicit empty state", () => {
    render(<CommunitySnapshot state={{ status: "empty" }} fixture />);
    expect(
      screen.getByText("Sin reportes públicos en el período."),
    ).toBeInTheDocument();
  });
});
