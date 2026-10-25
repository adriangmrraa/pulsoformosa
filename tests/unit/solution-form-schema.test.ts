// @vitest-environment node
import { describe, expect, it } from "vitest";
import { solutionFormSchema } from "@/lib/validation/solution-form";

const validInput = {
  text: "Habilitar una bomba de achicado en la esquina de la plaza.",
};

describe("solutionFormSchema", () => {
  it("accepts a minimal valid solution with only the required text", () => {
    const parsed = solutionFormSchema.parse(validInput);
    expect(parsed.text).toBe(validInput.text);
  });

  it("enforces the 10–500 character text bounds", () => {
    expect(
      solutionFormSchema.safeParse({ ...validInput, text: "muy corto" })
        .success,
    ).toBe(false);
    expect(
      solutionFormSchema.safeParse({ ...validInput, text: "a".repeat(501) })
        .success,
    ).toBe(false);
    expect(
      solutionFormSchema.safeParse({ ...validInput, text: "a".repeat(10) })
        .success,
    ).toBe(true);
    expect(
      solutionFormSchema.safeParse({ ...validInput, text: "a".repeat(500) })
        .success,
    ).toBe(true);
  });

  it("accepts the optional fields inside their bounds", () => {
    const parsed = solutionFormSchema.parse({
      ...validInput,
      evidence_note: "La cuadrilla ya pasó por la cuadra la semana pasada.",
      evidence_url: "https://example.org/nota-del-diario",
      author_label: "Vecina del barrio",
    });
    expect(parsed.author_label).toBe("Vecina del barrio");
  });

  it("rejects evidence_note over 280 chars and author_label over 60", () => {
    expect(
      solutionFormSchema.safeParse({
        ...validInput,
        evidence_note: "a".repeat(281),
      }).success,
    ).toBe(false);
    expect(
      solutionFormSchema.safeParse({
        ...validInput,
        author_label: "a".repeat(61),
      }).success,
    ).toBe(false);
  });

  it("rejects a malformed or overlong evidence_url", () => {
    expect(
      solutionFormSchema.safeParse({
        ...validInput,
        evidence_url: "not a url",
      }).success,
    ).toBe(false);
    expect(
      solutionFormSchema.safeParse({
        ...validInput,
        evidence_url: `https://example.org/${"a".repeat(300)}`,
      }).success,
    ).toBe(false);
  });

  it("rejects unknown properties so no personal data can slip in", () => {
    expect(
      solutionFormSchema.safeParse({ ...validInput, name: "Ana" }).success,
    ).toBe(false);
    expect(
      solutionFormSchema.safeParse({ ...validInput, dni: "30123456" }).success,
    ).toBe(false);
    expect(
      solutionFormSchema.safeParse({ ...validInput, phone: "3704-000000" })
        .success,
    ).toBe(false);
  });
});
