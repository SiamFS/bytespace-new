import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

// Prisma 7 connects through a driver adapter (node-postgres here).
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

/** Single Prisma client for the process (one connection pool). */
export const prisma = new PrismaClient({ adapter });
