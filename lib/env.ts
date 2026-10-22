/** Trimmed, case-insensitive environment label (REQ-MCK-03). */
export function environmentLabel(): string {
  return (process.env.PUBLIC_ENVIRONMENT_LABEL ?? "").trim().toLowerCase();
}

export function isProductionEnvironment(): boolean {
  return environmentLabel() === "production";
}
