"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSession, logout, type User } from "./api";

/** One cache entry for "who is signed in", shared by the navbar and the auth forms. */
export const SESSION_KEY = ["session"] as const;

type Session = { user: User | null };

/**
 * The signed-in user, fetched in the browser (never on the server) so pages stay static and
 * never wait for the API. `user` is undefined while loading, null for guests.
 */
export function useSession() {
  const query = useQuery({ queryKey: SESSION_KEY, queryFn: fetchSession });
  return { user: query.data?.user, isLoading: query.isPending };
}

/** Store the user returned by login / register so the navbar updates without a refetch. */
export function useSetSessionUser() {
  const queryClient = useQueryClient();
  return (user: User | null) => queryClient.setQueryData<Session>(SESSION_KEY, { user });
}

/**
 * Log out optimistically (TanStack Query "Optimistic Updates — via the cache"): the navbar shows
 * the guest links at once instead of a disabled "Logging out…" button while the request makes
 * its round trip (~1–2s to the API, more on a cold start). If the request fails, the signed-in
 * state comes back, since the cookie (HttpOnly — only the server can clear it) is still there.
 */
export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onMutate: async (_variables, context) => {
      // Don't let an in-flight /me answer put the user back.
      await context.client.cancelQueries({ queryKey: SESSION_KEY });
      const previous = context.client.getQueryData<Session>(SESSION_KEY);
      context.client.setQueryData<Session>(SESSION_KEY, { user: null });
      return { previous };
    },
    onError: (_error, _variables, onMutateResult, context) => {
      if (onMutateResult?.previous) context.client.setQueryData(SESSION_KEY, onMutateResult.previous);
    },
  });
}
