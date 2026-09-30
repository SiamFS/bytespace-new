import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("app-wide behaviour", () => {
  it("answers unknown routes with a JSON 404", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Route not found." } });
  });

  it("sends security headers and hides the framework", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["content-security-policy"]).toBeDefined();
  });

  it("rejects malformed JSON with 400 INVALID_JSON", async () => {
    const res = await request(app).post("/api/anything").set("Content-Type", "application/json").send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("rejects bodies over 10kb with 413", async () => {
    const res = await request(app)
      .post("/api/anything")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ data: "x".repeat(11 * 1024) }));
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });
});

describe("CORS", () => {
  it("lets the configured frontend origin read responses, with credentials", async () => {
    const res = await request(app).get("/api/health").set("Origin", "http://localhost:3000");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("gives other origins no CORS headers (the browser blocks them from reading)", async () => {
    const res = await request(app).get("/api/health").set("Origin", "https://evil.example.com");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("answers preflight requests for the frontend origin", async () => {
    const res = await request(app)
      .options("/api/health")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });
});
