import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../index.js";

// index.ts is what Vercel runs: the API mounted in a wrapper app (see the comment there).
describe("Vercel entry (index.ts)", () => {
  it("serves the API routes with the API's headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("uses the API's JSON 404 for unknown paths", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});
