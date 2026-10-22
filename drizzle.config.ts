import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Schema and migrations land with C2. The config exists now so the migration
// workflow is wired; `db:generate` will report an empty schema until then.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
