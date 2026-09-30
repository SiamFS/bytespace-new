import type { User } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Locals {
      /** Set by middleware/loadSession — null when signed out. */
      user?: User | null;
    }
  }
}

export {};
