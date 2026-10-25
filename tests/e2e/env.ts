/**
 * Shared e2e environment values — imported by playwright.config.ts (webServer
 * env) and by the specs that drive the real moderation endpoint.
 */
export const E2E_MODERATOR_TOKEN =
  process.env.E2E_MODERATOR_TOKEN ?? "e2e-moderator-token";
