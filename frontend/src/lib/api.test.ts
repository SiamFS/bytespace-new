import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, postJson } from "./api";
import { authErrorMessages } from "./auth/api";

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

afterEach(() => vi.unstubAllGlobals());

describe("postJson", () => {
  it("posts JSON and returns the parsed body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { user: { id: "1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(postJson("/api/auth/login", { a: 1 })).resolves.toEqual({ user: { id: "1" } });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/auth/login");
    expect(init).toMatchObject({ method: "POST", body: '{"a":1}', credentials: "same-origin" });
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("turns an error body into an ApiError with code, fields and Retry-After", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(429, { error: { code: "RATE_LIMITED", message: "Slow down" } }, { "Retry-After": "30" }),
      ),
    );
    const error = await postJson("/x", {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, code: "RATE_LIMITED", retryAfter: 30 });
  });

  it("handles non-JSON error pages (e.g. a proxy 502)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 })));
    await expect(postJson("/x", {})).rejects.toMatchObject({ status: 502, code: "UNKNOWN" });
  });

  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(postJson("/x", {})).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("reports timeouts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")));
    await expect(postJson("/x", {})).rejects.toMatchObject({ code: "TIMEOUT" });
  });
});

describe("authErrorMessages", () => {
  it("never says whether the email exists on login", () => {
    expect(authErrorMessages(new ApiError(401, "UNAUTHORIZED", "x"), "login")).toEqual({
      form: "Invalid email or password.",
    });
  });

  it("puts a duplicate email on the email field when registering", () => {
    expect(authErrorMessages(new ApiError(409, "CONFLICT", "x"), "register")).toEqual({
      fields: { email: "An account with this email already exists." },
    });
  });

  it("maps server validation errors onto fields", () => {
    const error = new ApiError(400, "VALIDATION_ERROR", "x", { fields: { password: "Too weak" } });
    expect(authErrorMessages(error, "register")).toEqual({ fields: { password: "Too weak" } });
  });

  it.each([
    [30, "Too many attempts. Try again in 30 seconds."],
    [1, "Too many attempts. Try again in 1 second."],
    [undefined, "Too many attempts. Please wait a moment and try again."],
  ])("explains rate limits (Retry-After %j)", (retryAfter, message) => {
    const error = new ApiError(429, "RATE_LIMITED", "x", retryAfter === undefined ? {} : { retryAfter });
    expect(authErrorMessages(error, "login").form).toBe(message);
  });

  it("has a generic message for anything else", () => {
    expect(authErrorMessages(new Error("boom"), "login").form).toBe("Something went wrong. Please try again.");
    expect(authErrorMessages(new ApiError(500, "INTERNAL_ERROR", "x"), "login").form).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
