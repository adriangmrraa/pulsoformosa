import { expect, test } from "@playwright/test";

test("GET /api/overview returns the fixture-backed §17.1 payload", async ({
  request,
}) => {
  const response = await request.get("/api/overview");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("s-maxage=60");

  const body = await response.json();
  expect(Object.keys(body).sort()).toEqual(
    [
      "climate",
      "weather",
      "river",
      "community",
      "published_at",
      "fetched_at",
      "source_health",
    ].sort(),
  );

  for (const key of ["climate", "weather", "river", "community"] as const) {
    expect(body.source_health[key].status).toBe("fixture");
  }

  expect(body.climate.phase).toBe("EL_NINO");
  expect(body.weather.precip_expected_mm).toBe(18.5);
  expect(body.river.station_name).toBe("Puerto Formosa");
  expect(body.community.published_reports_count).toBeGreaterThan(0);

  const serialized = JSON.stringify(body);
  expect(serialized).not.toMatch(/_private/);
  expect(serialized).not.toMatch(/lat_private|lng_private|gps_exif/i);
  expect(serialized).not.toContain("token");
});
