import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

function connectionStringFromEnv(): string {
  return (
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/jsca?schema=public"
  );
}

function createAdapter() {
  const connectionString = connectionStringFromEnv();
  const pool = new Pool({ connectionString });
  return new PrismaPg(pool);
}

export const db: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.__prisma = db;

