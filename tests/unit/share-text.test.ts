// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildReportShareText } from "@/lib/domain/report";

describe("buildReportShareText", () => {
  it("formats the §11.4 exportable summary", () => {
    const text = buildReportShareText({
      when: "2026-10-20T21:00:00.000Z",
      visibleReports: 27,
      zones: 11,
      periodLabel: "24 h",
      url: "https://example.test/?categoria=agua&periodo=24h",
    });

    expect(text).toBe(
      "Formosa · 20/10/2026 18:00 ART · 27 reportes visibles en 24 h · 11 zonas con reportes · datos aportados por usuarios no verificados · https://example.test/?categoria=agua&periodo=24h",
    );
  });

  it("never mentions victims or affected people", () => {
    const text = buildReportShareText({
      when: "2026-10-20T21:00:00.000Z",
      visibleReports: 1,
      zones: 1,
      periodLabel: "7 días",
      url: "https://example.test/",
    });
    expect(text).not.toMatch(/víctimas|personas afectadas|viviendas/i);
  });
});
