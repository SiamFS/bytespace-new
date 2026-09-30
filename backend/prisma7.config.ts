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
    url: process.env["DATABASE_URL"],
  },
});
