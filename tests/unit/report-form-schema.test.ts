// @vitest-environment node
import { describe, expect, it } from "vitest";
import { reportFormSchema } from "@/lib/validation/report-form";

const validInput = {
  category: "WATER" as const,
  description: "Hay agua acumulada sobre la calle desde anoche.",
  location: { lat: -26.18, lon: -58.18, method: "manual_pin" as const },
  consent: true as const,
  idempotency_key: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
};

describe("reportFormSchema", () => {
  it("accepts a minimal valid report and defaults geometry to POINT", () => {
    const parsed = reportFormSchema.parse(validInput);
    expect(parsed.geometry_mode).toBe("POINT");
    expect(parsed.location.method).toBe("manual_pin");
  });

  it("requires the consent checkbox to be literally true", () => {
    expect(reportFormSchema.safeParse({ ...validInput, consent: false }).success).toBe(
      false,
    );
    expect(
      reportFormSchema.safeParse({ ...validInput, consent: undefined }).success,
    ).toBe(false);
  });

  it("enforces the 15–800 character description bounds", () => {
    expect(
      reportFormSchema.safeParse({ ...validInput, description: "corto" }).success,
    ).toBe(false);
    expect(
      reportFormSchema.safeParse({
        ...validInput,
        description: "a".repeat(801),
      }).success,
    ).toBe(false);
    expect(
      reportFormSchema.safeParse({
        ...validInput,
        description: "a".repeat(15),
      }).success,
    ).toBe(true);
  });

  it("requires a UUID idempotency key", () => {
    expect(
      reportFormSchema.safeParse({ ...validInput, idempotency_key: "abc" }).success,
    ).toBe(false);
  });

  it("rejects unknown properties at the root and inside location", () => {
    expect(
      reportFormSchema.safeParse({ ...validInput, name: "Ana" }).success,
    ).toBe(false);
    expect(
      reportFormSchema.safeParse({
        ...validInput,
        location: { ...validInput.location, address: "Calle Falsa 123" },
      }).success,
    ).toBe(false);
  });

  it("requires a location", () => {
    expect(
      reportFormSchema.safeParse({ ...validInput, location: undefined }).success,
    ).toBe(false);
  });
});
