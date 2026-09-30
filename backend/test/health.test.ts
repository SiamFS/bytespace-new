import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("GET /api/health (liveness)", () => {
  it("returns ok without caching", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("stays ok when the database is down (liveness must not depend on it)", async () => {
    const app = createApp({ health: { isDatabaseUp: async () => false } });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });
});

describe("GET /api/health/ready (readiness)", () => {
  it("checks the real test database", async () => {
    const res = await request(createApp()).get("/api/health/ready");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", checks: { database: "ok" } });
  });

  it("returns 503 when the database is down", async () => {
    const app = createApp({ health: { isDatabaseUp: async () => false } });
    const res = await request(app).get("/api/health/ready");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "unavailable", checks: { database: "down" } });
  });
});
