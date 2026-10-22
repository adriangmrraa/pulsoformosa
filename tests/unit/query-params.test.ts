// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATEGORY,
  DEFAULT_PERIOD,
  parseOverviewQuery,
  toReportQuery,
} from "@/lib/validation/query-params";

describe("parseOverviewQuery", () => {
  it("defaults an empty query to todos/7d", () => {
    const parsed = parseOverviewQuery({});
    expect(parsed.categoria).toBe(DEFAULT_CATEGORY);
    expect(parsed.periodo).toBe(DEFAULT_PERIOD);
    expect(parsed.reporte).toBeUndefined();
  });

  it("resolves a valid query", () => {
    const parsed = parseOverviewQuery({
      reporte: "rpt_mock_9f3a1b",
      zona: "centro",
      categoria: "calles",
      periodo: "30d",
      cursor: "cur_12",
    });
    expect(parsed).toEqual({
      reporte: "rpt_mock_9f3a1b",
      zona: "centro",
      categoria: "calles",
      periodo: "30d",
      cursor: "cur_12",
    });
  });

  it("falls back to defaults for invalid values without throwing", () => {
    const parsed = parseOverviewQuery({
      categoria: "inventada",
      periodo: "365d",
    });
    expect(parsed.categoria).toBe("todos");
    expect(parsed.periodo).toBe("7d");
  });

  it("drops stale/invalid optional params but keeps valid ones", () => {
    const parsed = parseOverviewQuery({
      reporte: "../etc/passwd",
      zona: "norte",
      categoria: "agua",
    });
    expect(parsed.reporte).toBeUndefined();
    expect(parsed.zona).toBe("norte");
    expect(parsed.categoria).toBe("agua");
  });

  it("never throws on hostile input", () => {
    expect(() => parseOverviewQuery(null)).not.toThrow();
    expect(() => parseOverviewQuery(undefined)).not.toThrow();
    expect(() => parseOverviewQuery("not-an-object")).not.toThrow();
    expect(() => parseOverviewQuery([1, 2, 3])).not.toThrow();
    expect(() => parseOverviewQuery(42)).not.toThrow();
  });

  it("maps the slug to the domain category for provider queries", () => {
    const query = toReportQuery(parseOverviewQuery({ categoria: "servicios" }));
    expect(query.category).toBe("UTILITIES");
    expect(query.period).toBe("7d");
  });
});
