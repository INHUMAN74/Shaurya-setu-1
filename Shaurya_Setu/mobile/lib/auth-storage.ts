import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "shaurya_jwt";
const USER_KEY = "shaurya_user";

export type AuthUser = {
	id: string;
	email: string;
	role: string;
};

export async function saveToken(token: string): Promise<void> {
	await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
	return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveUser(user: AuthUser): Promise<void> {
	await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadUser(): Promise<AuthUser | null> {
	const raw = await SecureStore.getItemAsync(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
}

export async function saveSession(token: string, user: AuthUser): Promise<void> {
	await Promise.all([saveToken(token), saveUser(user)]);
}

export async function clearSession(): Promise<void> {
	await SecureStore.deleteItemAsync(TOKEN_KEY);
	await SecureStore.deleteItemAsync(USER_KEY);
}
