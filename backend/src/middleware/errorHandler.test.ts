import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "../lib/errors.js";
import { errorHandler } from "./errorHandler.js";

/** A tiny app whose only route throws `error`, followed by the real error handler. */
function appThrowing(error: unknown) {
  const app = express();
  const log = { error: vi.fn() };
  app.use((req, _res, next) => {
    (req as unknown as { log: typeof log }).log = log;
    next();
  });
  app.get("/boom", () => {
    throw error;
  });
  app.use(errorHandler);
  return { app, log };
}

describe("errorHandler", () => {
  it("maps AppError to its status, code and fields", async () => {
    const { app } = appThrowing(new AppError(409, "CONFLICT", "Email taken", { email: "Already used" }));
    const res = await request(app).get("/boom");
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Email taken", fields: { email: "Already used" } } });
  });

  it("omits `fields` when there are none", async () => {
    const { app } = appThrowing(new AppError(401, "UNAUTHORIZED", "Nope"));
    const res = await request(app).get("/boom");
    expect(res.body.error).not.toHaveProperty("fields");
  });

  it("hides unexpected errors behind a generic 500 and logs them", async () => {
    const { app, log } = appThrowing(new Error("database password is hunter2"));
    const res = await request(app).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } });
    expect(JSON.stringify(res.body)).not.toContain("hunter2");
    expect(log.error).toHaveBeenCalledOnce();
  });

  it("handles async (rejected promise) errors — Express 5 forwards them", async () => {
    const app = express();
    app.get("/boom", async () => {
      throw new AppError(403, "FORBIDDEN", "No access");
    });
    app.use(errorHandler);
    const res = await request(app).get("/boom");
    expect(res.status).toBe(403);
  });

  it("passes other exposed client errors through as BAD_REQUEST", async () => {
    const err = Object.assign(new Error("weird"), { status: 400, expose: true, type: "something.else" });
    const { app } = appThrowing(err);
    const res = await request(app).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });
});
