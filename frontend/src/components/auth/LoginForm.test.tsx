import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/lib/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign In" }));
  return user;
}

beforeEach(() => {
  router.replace.mockReset();
  router.refresh.mockReset();
  window.history.replaceState(null, "", "/login");
});
afterEach(() => vi.unstubAllGlobals());

describe("LoginForm — after a failed Google sign-in", () => {
  it("explains why, from ?error=", async () => {
    window.history.replaceState(null, "", "/login?error=google_conflict");
    renderWithProviders(<LoginForm />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists. Sign in with your password.",
    );
  });

  it("ignores unknown reasons", async () => {
    window.history.replaceState(null, "", "/login?error=<script>");
    renderWithProviders(<LoginForm />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeEmptyDOMElement());
  });

  it("drops the Google message once the form is submitted", async () => {
    window.history.replaceState(null, "", "/login?error=google_failed");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(200, { user: { id: "1" } })));
    renderWithProviders(<LoginForm />);
    expect(await screen.findByText("Google sign-in didn't work. Please try again.")).toBeInTheDocument();

    await fillAndSubmit("jamie@example.com", "secret123");
    await waitFor(() => expect(screen.queryByText("Google sign-in didn't work. Please try again.")).not.toBeInTheDocument());
  });
});

describe("LoginForm", () => {
  it("has labelled email and password fields with the Figma placeholders", () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("placeholder", "designer@example.com");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
  });

  it("shows errors, focuses the first invalid field and sends nothing when empty", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<LoginForm />);

    await fillAndSubmit("", "");

    expect(await screen.findByText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates the email on blur", async () => {
    renderWithProviders(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.tab();
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("posts the normalised email and goes home on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { user: { id: "1" } }));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<LoginForm />);

    await fillAndSubmit("  Jamie@Example.com ", "secret123");

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/auth/login");
    expect(JSON.parse(init.body)).toEqual({ email: "jamie@example.com", password: "secret123" });
  });

  it("returns to a safe ?next= path, and ignores unsafe ones", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(200, { user: { id: "1" } })));
    window.history.replaceState(null, "", "/login?next=/courses");
    const { unmount } = renderWithProviders(<LoginForm />);
    await fillAndSubmit("jamie@example.com", "secret123");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/courses"));
    unmount();

    router.replace.mockReset();
    window.history.replaceState(null, "", "/login?next=//evil.example.com");
    renderWithProviders(<LoginForm />);
    await fillAndSubmit("jamie@example.com", "secret123");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
  });

  it("shows one generic message for wrong credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json(401, { error: { code: "UNAUTHORIZED", message: "Invalid credentials" } })),
    );
    renderWithProviders(<LoginForm />);
    await fillAndSubmit("jamie@example.com", "wrong-pass");

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("explains rate limiting with the Retry-After time", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json(429, { error: { code: "RATE_LIMITED", message: "x" } }, { "Retry-After": "42" })),
    );
    renderWithProviders(<LoginForm />);
    await fillAndSubmit("jamie@example.com", "secret123");
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many attempts. Try again in 42 seconds.");
  });

  it("disables the button and shows progress while signing in", async () => {
    let resolve!: (response: Response) => void;
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((r) => (resolve = r))));
    renderWithProviders(<LoginForm />);
    await fillAndSubmit("jamie@example.com", "secret123");

    const button = await screen.findByRole("button", { name: "Signing in…" });
    expect(button).toBeDisabled();

    resolve(json(200, { user: { id: "1" } }));
    await waitFor(() => expect(router.replace).toHaveBeenCalled());
  });

  it("shows a friendly message when the server can't be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    renderWithProviders(<LoginForm />);
    await fillAndSubmit("jamie@example.com", "secret123");
    expect(await screen.findByRole("alert")).toHaveTextContent("Can't reach the server.");
    expect(screen.getByRole("button", { name: "Sign In" })).toBeEnabled();
  });
});

describe("LoginForm session", () => {
  it("stores the signed-in user so the navbar updates without another request", async () => {
    const user = { id: "1", name: "Jamie Davis", email: "jamie@example.com", createdAt: "2026-10-01T00:00:00.000Z" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(200, { user })));
    const { queryClient } = renderWithProviders(<LoginForm />);
    await fillAndSubmit("jamie@example.com", "secret123");
    await waitFor(() => expect(queryClient.getQueryData(["session"])).toEqual({ user }));
  });
});
