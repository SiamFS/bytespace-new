import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/** A fresh query client per test: no retries, no shared cache between tests. */
export function makeTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

/** `render` wrapped in the app's providers (TanStack Query). */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions & { queryClient?: QueryClient }) {
  const queryClient = options?.queryClient ?? makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
