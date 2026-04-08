import { Link, router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { apiUrl } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/dashboard-path";

type Role = "veteran" | "employer" | "counsellor";

const ROLES: { key: Role; label: string }[] = [
	{ key: "veteran", label: "Veteran" },
	{ key: "employer", label: "Employer" },
	{ key: "counsellor", label: "Counsellor" },
];

export default function SignupScreen() {
	const { signIn } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<Role>("veteran");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit() {
		setError("");
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		setLoading(true);
		try {
			const signupRes = await fetch(apiUrl("/api/auth/signup"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim().toLowerCase(),
					password,
					role,
				}),
			});
			const signupJson = (await signupRes.json()) as {
				success?: boolean;
				error?: string;
				data?: { role?: string };
			};
			if (!signupRes.ok || !signupJson.success) {
				setError(signupJson.error ?? "Failed to create account");
				return;
			}

			const loginRes = await fetch(apiUrl("/api/auth/mobile/login"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim().toLowerCase(),
					password,
				}),
			});
			const loginJson = (await loginRes.json()) as {
				success?: boolean;
				error?: string;
				token?: string;
				user?: { id: string; email: string; role: string };
			};
			if (!loginRes.ok || !loginJson.success || !loginJson.token || !loginJson.user?.role) {
				setError(
					loginJson.error ?? "Account created but sign-in failed. Try logging in manually.",
				);
				return;
			}
			await signIn(loginJson.token, {
				id: String(loginJson.user.id),
				email: loginJson.user.email,
				role: loginJson.user.role,
			});
			router.replace(dashboardPathForRole(loginJson.user.role));
		} catch {
			setError("Something went wrong. Check EXPO_PUBLIC_API_URL and that vros is running.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<KeyboardAvoidingView
			style={styles.flex}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
				<Text style={styles.h1}>Shaurya Setu</Text>
				<Text style={styles.sub}>Create your account</Text>

				{error ? (
					<View style={styles.errBox}>
						<Text style={styles.errText}>{error}</Text>
					</View>
				) : null}

				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					autoComplete="email"
					keyboardType="email-address"
					placeholder="you@example.com"
					placeholderTextColor="#888"
				/>

				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					autoComplete="new-password"
					placeholder="At least 6 characters"
					placeholderTextColor="#888"
				/>

				<Text style={styles.label}>Role</Text>
				<View style={styles.roleRow}>
					{ROLES.map((r) => (
						<Pressable
							key={r.key}
							style={[styles.roleChip, role === r.key && styles.roleChipOn]}
							onPress={() => setRole(r.key)}
						>
							<Text style={[styles.roleChipText, role === r.key && styles.roleChipTextOn]}>
								{r.label}
							</Text>
						</Pressable>
					))}
				</View>

				<Pressable
					style={[styles.primary, loading && styles.disabled]}
					onPress={handleSubmit}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.primaryText}>Sign up</Text>
					)}
				</Pressable>

				<Link href="/login" asChild>
					<Pressable style={styles.linkWrap}>
						<Text style={styles.link}>Already have an account? Sign in</Text>
					</Pressable>
				</Link>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: "#fafafa" },
	scroll: {
		flexGrow: 1,
		padding: 24,
		paddingTop: 48,
		maxWidth: 400,
		width: "100%",
		alignSelf: "center",
	},
	h1: { fontSize: 22, fontWeight: "700", color: "#111", textAlign: "center" },
	sub: {
		marginTop: 6,
		marginBottom: 20,
		fontSize: 14,
		color: "#666",
		textAlign: "center",
	},
	errBox: {
		backgroundColor: "#fef2f2",
		borderWidth: 1,
		borderColor: "#fecaca",
		padding: 10,
		borderRadius: 8,
		marginBottom: 12,
	},
	errText: { color: "#b91c1c", fontSize: 14 },
	label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: Platform.OS === "ios" ? 12 : 8,
		fontSize: 16,
		marginBottom: 14,
		backgroundColor: "#fff",
		color: "#111",
	},
	roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
	roleChip: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		backgroundColor: "#fff",
	},
	roleChipOn: { borderColor: "#0a7ea4", backgroundColor: "#e0f2fe" },
	roleChipText: { fontSize: 14, color: "#444" },
	roleChipTextOn: { color: "#0a7ea4", fontWeight: "700" },
	primary: {
		backgroundColor: "#18181b",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 4,
	},
	disabled: { opacity: 0.6 },
	primaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
	linkWrap: { marginTop: 16, alignItems: "center" },
	link: { color: "#0a7ea4", fontSize: 15, fontWeight: "600" },
});
