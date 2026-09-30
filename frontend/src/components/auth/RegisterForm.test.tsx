import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/lib/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function fill({ name = "Jamie Davis", email = "jamie@example.com", password = "secret123" } = {}) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText("Full Name"), name);
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

beforeEach(() => {
  router.replace.mockReset();
  window.history.replaceState(null, "", "/register");
});
afterEach(() => vi.unstubAllGlobals());

describe("RegisterForm", () => {
  it("uses the Figma placeholders and new-password autocomplete", () => {
    renderWithProviders(<RegisterForm />);
    expect(screen.getByLabelText("Full Name")).toHaveAttribute("placeholder", "Jamie Davis");
    expect(screen.getByLabelText("Full Name")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
  });

  it("explains the password rules", async () => {
    vi.stubGlobal("fetch", vi.fn());
    renderWithProviders(<RegisterForm />);
    await fill({ password: "short" });
    expect(await screen.findByText("Use at least 8 characters")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("Use at least 8 characters");
  });

  it("rejects a whitespace-only name", async () => {
    vi.stubGlobal("fetch", vi.fn());
    renderWithProviders(<RegisterForm />);
    await fill({ name: "   " });
    expect(await screen.findByText("Enter your full name")).toBeInTheDocument();
  });

  it("posts trimmed values and redirects on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(201, { user: { id: "1" } }));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<RegisterForm />);

    await fill({ name: "  Jamie Davis  ", email: "JAMIE@example.com " });

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/auth/register");
    expect(JSON.parse(init.body)).toEqual({ name: "Jamie Davis", email: "jamie@example.com", password: "secret123" });
  });

  it("puts 'email already exists' on the email field and focuses it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(409, { error: { code: "CONFLICT", message: "x" } })));
    renderWithProviders(<RegisterForm />);
    await fill();

    expect(await screen.findByText("An account with this email already exists.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus());
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("maps server field errors onto the fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(400, { error: { code: "VALIDATION_ERROR", message: "x", fields: { name: "Name not allowed" } } }),
      ),
    );
    renderWithProviders(<RegisterForm />);
    await fill();
    expect(await screen.findByText("Name not allowed")).toBeInTheDocument();
  });
});
