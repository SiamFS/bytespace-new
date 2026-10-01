import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/lib/test-utils";
import { AuthNav } from "./AuthNav";

const jamie = { id: "1", name: "Jamie Davis", email: "jamie@example.com", createdAt: "2026-10-01T00:00:00.000Z" };

function mockApi(sessionUser: typeof jamie | null) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/auth/logout" && init?.method === "POST") return new Response(null, { status: 204 });
    return Response.json({ user: sessionUser });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("AuthNav", () => {
  it("shows Figma's Sign In / Join Us while the session is loading and for guests", async () => {
    mockApi(null);
    renderWithProviders(<AuthNav variant="bar" />);
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Join Us" })).toHaveAttribute("href", "/register");
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/auth/me", expect.anything()));
    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows the first name and a Log out button when signed in", async () => {
    mockApi(jamie);
    renderWithProviders(<AuthNav variant="bar" />);
    expect(await screen.findByText(/Hi, Jamie/)).toBeInTheDocument();
    expect(screen.getByText("Signed in as")).toHaveClass("sr-only");
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign In" })).not.toBeInTheDocument();
  });

  it("logs out and switches back to the guest links", async () => {
    const fetchMock = mockApi(jamie);
    const onNavigate = vi.fn();
    renderWithProviders(<AuthNav variant="menu" asListItems onNavigate={onNavigate} />);

    await userEvent.click(await screen.findByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", expect.objectContaining({ method: "POST" }));
    expect(onNavigate).toHaveBeenCalled();
  });

  it("switches to the guest links immediately, before the server answers", async () => {
    let finishLogout!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        url === "/api/auth/logout"
          ? new Promise<Response>((resolve) => (finishLogout = resolve))
          : Promise.resolve(Response.json({ user: jamie })),
      ),
    );
    renderWithProviders(<AuthNav variant="bar" />);
    await userEvent.click(await screen.findByRole("button", { name: "Log out" }));

    // The request is still pending — the navbar doesn't wait for it.
    expect(await screen.findByRole("link", { name: "Sign In" })).toBeInTheDocument();
    finishLogout(new Response(null, { status: 204 }));
  });

  it("restores the signed-in state if logging out fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url === "/api/auth/logout"
          ? Response.json({ error: { code: "INTERNAL_ERROR", message: "x" } }, { status: 500 })
          : Response.json({ user: jamie }),
      ),
    );
    renderWithProviders(<AuthNav variant="bar" />);
    await userEvent.click(await screen.findByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.getByText(/Hi, Jamie/)).toBeInTheDocument();
  });

  it("renders list items for the mobile menu", async () => {
    mockApi(null);
    const { container } = renderWithProviders(
      <ul>
        <AuthNav variant="menu" asListItems />
      </ul>,
    );
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});
