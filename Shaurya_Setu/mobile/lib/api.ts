import Constants from "expo-constants";

/**
 * Base URL for the Next.js (vros) deployment — same origin as `/api/*`.
 * Set in `.env`: EXPO_PUBLIC_API_URL=https://your-host.example.com
 */
function getBaseUrl(): string {
	const fromEnv = process.env.EXPO_PUBLIC_API_URL;
	if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, "");
	const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
	if (extra?.apiUrl?.trim()) return extra.apiUrl.trim().replace(/\/$/, "");
	return "";
}

/** Absolute URL for an API path (e.g. `/api/cases`). */
export function apiUrl(path: string): string {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	const base = getBaseUrl();
	if (!base) return normalized;
	return `${base}${normalized}`;
}

export async function apiFetch(
	path: string,
	init?: RequestInit & { token?: string | null },
): Promise<Response> {
	const { token, headers: initHeaders, ...rest } = init ?? {};
	const headers = new Headers(initHeaders);
	if (token) headers.set("Authorization", `Bearer ${token}`);
	return fetch(apiUrl(path), { ...rest, headers });
}
