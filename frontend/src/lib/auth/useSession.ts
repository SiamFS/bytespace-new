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

export function useLogout() {
  const setUser = useSetSessionUser();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => setUser(null),
  });
}
