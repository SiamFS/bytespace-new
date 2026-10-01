// Prisma CLI config (Prisma 7.10 names it prisma7.config.ts so it can't clash with Prisma 8's
// prisma.config.ts). The CLI does not load .env itself, hence dotenv.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct (unpooled) connection — Neon: "Prisma Migrate requires a direct
    // connection" (PgBouncer transaction mode). The app itself uses the pooled DATABASE_URL.
    // Locally and in CI there is no pooler, so DIRECT_URL is optional there.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
