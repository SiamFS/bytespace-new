import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { closeRateLimitStore } from "./lib/rateLimitStore.js";

const app = createApp();

// Express 5 passes listen errors (e.g. EADDRINUSE) to the callback instead of throwing.
const server = app.listen(env.PORT, (error) => {
  if (error) {
    logger.fatal({ err: error }, "Failed to start the server");
    process.exit(1);
  }
  logger.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

/**
 * Graceful shutdown (Express guide): Docker sends SIGTERM on stop. Stop accepting
 * connections, let in-flight requests finish, close the DB pool, then exit. A timer forces
 * the exit if something hangs.
 */
function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, "Shutting down");
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();

  server.close(async (error) => {
    await Promise.all([prisma.$disconnect(), closeRateLimitStore()]);
    if (error) {
      logger.error({ err: error }, "Error while closing the server");
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
