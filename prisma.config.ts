import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI does not automatically load `.env.local`.
// Load it explicitly (and then `.env` if present).
loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.POSTGRES_URL ??
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/jsca?schema=public",
  },
});

