import type { PrismaClient } from "../generated/prisma/client.js";

export type HealthService = {
  /** True when the database answers a trivial query within `timeoutMs`. */
  isDatabaseUp(timeoutMs?: number): Promise<boolean>;
};

export function createHealthService(prisma: PrismaClient): HealthService {
  return {
    async isDatabaseUp(timeoutMs = 2000) {
      let timer: NodeJS.Timeout | undefined;
      const timeout = new Promise<false>((resolve) => {
        timer = setTimeout(() => resolve(false), timeoutMs);
      });
      const query = prisma.$queryRaw`SELECT 1`.then(
        () => true,
        () => false,
      );
      try {
        return await Promise.race([query, timeout]);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
