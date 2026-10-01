import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/lib/test-utils";
import { VerifyEmail } from "./VerifyEmail";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const jamie = { id: "1", name: "Jamie Davis", email: "jamie@example.com", createdAt: "2026-10-01T00:00:00.000Z" };

beforeEach(() => router.replace.mockReset());
afterEach(() => vi.unstubAllGlobals());

describe("VerifyEmail", () => {
  it("verifies the token from the link, signs in and goes home", async () => {
    window.history.replaceState(null, "", "/verify-email?token=abc123");
    const fetchMock = vi.fn().mockResolvedValue(json(200, { user: jamie }));
    vi.stubGlobal("fetch", fetchMock);
    const { queryClient } = renderWithProviders(<VerifyEmail />);

    expect(await screen.findByText("Email verified — welcome, Jamie!")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/auth/verify-email");
    expect(JSON.parse(init.body)).toEqual({ token: "abc123" });
    expect(queryClient.getQueryData(["session"])).toEqual({ user: jamie });
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"), { timeout: 3000 });
  });

  it("explains an expired or used link", async () => {
    window.history.replaceState(null, "", "/verify-email?token=old");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(400, { error: { code: "INVALID_TOKEN", message: "x" } })));
    renderWithProviders(<VerifyEmail />);
    expect(await screen.findByText(/invalid or has expired/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to login" })).toHaveAttribute("href", "/login");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("explains a link without a token, without calling the API", async () => {
    window.history.replaceState(null, "", "/verify-email");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<VerifyEmail />);
    expect(await screen.findByText(/link is incomplete/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
