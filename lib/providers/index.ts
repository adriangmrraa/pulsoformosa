import { isProductionEnvironment } from "@/lib/env";
import { MockReportsProvider } from "./mock";
import type { ReportsProvider } from "./types";

export class MockProviderInProductionError extends Error {
  readonly code = "MOCK_IN_PRODUCTION";

  constructor(provider: string) {
    super(
      `The ${provider} mock provider refuses to serve with PUBLIC_ENVIRONMENT_LABEL=production.`,
    );
    this.name = "MockProviderInProductionError";
  }
}

const reportsProvider = new MockReportsProvider();

export function getReportsProvider(): ReportsProvider {
  if (isProductionEnvironment()) {
    throw new MockProviderInProductionError("reports");
  }
  return reportsProvider;
}
