import { describe, expect, it } from "vitest";
import { parseEnv } from "./env.js";

const base = { DATABASE_URL: "postgresql://user:pass@localhost:5432/db" };

describe("parseEnv", () => {
  it("applies defaults", () => {
    const env = parseEnv(base);
    expect(env).toMatchObject({
      NODE_ENV: "development",
      PORT: 4000,
      CORS_ORIGINS: ["http://localhost:3000"],
      TRUST_PROXY: 0,
      LOG_LEVEL: "info",
    });
  });

  it("parses a comma-separated CORS list, trimming spaces", () => {
    const env = parseEnv({ ...base, CORS_ORIGINS: "https://a.example.com, https://b.example.com ," });
    expect(env.CORS_ORIGINS).toEqual(["https://a.example.com", "https://b.example.com"]);
  });

  it("rejects CORS entries that are not bare origins", () => {
    expect(() => parseEnv({ ...base, CORS_ORIGINS: "https://a.example.com/" })).toThrow(/CORS_ORIGINS/);
    expect(() => parseEnv({ ...base, CORS_ORIGINS: "ftp://a.example.com" })).toThrow(/CORS_ORIGINS/);
  });

  it("requires a PostgreSQL DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
    expect(() => parseEnv({ DATABASE_URL: "mysql://localhost/db" })).toThrow(/DATABASE_URL/);
  });

  it("coerces numbers and rejects bad ones", () => {
    expect(parseEnv({ ...base, PORT: "8080", TRUST_PROXY: "1" })).toMatchObject({ PORT: 8080, TRUST_PROXY: 1 });
    expect(() => parseEnv({ ...base, PORT: "abc" })).toThrow(/PORT/);
    expect(() => parseEnv({ ...base, TRUST_PROXY: "-1" })).toThrow(/TRUST_PROXY/);
  });

  it("lists every invalid variable in one error", () => {
    expect(() => parseEnv({ PORT: "0", LOG_LEVEL: "loud" })).toThrow(/DATABASE_URL[\s\S]*PORT|PORT[\s\S]*DATABASE_URL/);
  });
});
