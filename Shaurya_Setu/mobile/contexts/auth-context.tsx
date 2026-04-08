import { router } from "expo-router";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import { clearSession, loadToken, loadUser, saveSession, type AuthUser } from "@/lib/auth-storage";

type AuthContextValue = {
	token: string | null;
	user: AuthUser | null;
	loading: boolean;
	signIn: (token: string, user: AuthUser) => Promise<void>;
	signOut: () => Promise<void>;
	refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	const refresh = useCallback(async () => {
		const [t, u] = await Promise.all([loadToken(), loadUser()]);
		if (t && !u) {
			await clearSession();
			setToken(null);
			setUser(null);
			return;
		}
		setToken(t);
		setUser(u);
	}, []);

	useEffect(() => {
		refresh().finally(() => setLoading(false));
	}, [refresh]);

	const signIn = useCallback(async (newToken: string, newUser: AuthUser) => {
		await saveSession(newToken, newUser);
		setToken(newToken);
		setUser(newUser);
	}, []);

	const signOut = useCallback(async () => {
		await clearSession();
		setToken(null);
		setUser(null);
		router.replace("/login");
	}, []);

	const value = useMemo(
		() => ({ token, user, loading, signIn, signOut, refresh }),
		[token, user, loading, signIn, signOut, refresh],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
