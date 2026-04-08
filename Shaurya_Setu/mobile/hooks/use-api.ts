import { useCallback } from "react";

import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";

/** Authenticated fetch using stored JWT. */
export function useApi() {
	const { token } = useAuth();
	return useCallback(
		(path: string, init?: RequestInit) => apiFetch(path, { ...init, token }),
		[token],
	);
}
