import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { env } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

// One node-postgres pool for the process. On Vercel (Fluid compute) attachDatabasePool releases
// idle clients before the function instance suspends (Vercel docs "Database Connections");
// outside Vercel it does nothing.
const pool = new Pool({ connectionString: env.DATABASE_URL });
attachDatabasePool(pool);

/** Single Prisma client for the process — Prisma 7 connects through the pg driver adapter. */
export const prisma = new PrismaClient({ adapter: new PrismaPg(pool, { disposeExternalPool: true }) });
