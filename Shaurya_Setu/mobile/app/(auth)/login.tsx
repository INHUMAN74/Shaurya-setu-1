import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
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

export default function LoginScreen() {
	const { signIn, token, loading: authLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!authLoading && token) {
			router.replace("/dashboard");
		}
	}, [authLoading, token]);

	async function handleSubmit() {
		setError("");
		setLoading(true);
		try {
			const res = await fetch(apiUrl("/api/auth/mobile/login"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim().toLowerCase(),
					password,
				}),
			});
			const json = (await res.json()) as {
				success?: boolean;
				error?: string;
				token?: string;
				user?: { id: string; email: string; role: string };
			};
			if (!res.ok || !json.success || !json.token || !json.user?.role) {
				setError(json.error ?? "Invalid email or password.");
				return;
			}
			await signIn(json.token, {
				id: String(json.user.id),
				email: json.user.email,
				role: json.user.role,
			});
			router.replace(dashboardPathForRole(json.user.role));
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
				<Text style={styles.sub}>Sign in to your account</Text>

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
					autoComplete="password"
					placeholder="••••••••"
					placeholderTextColor="#888"
				/>

				<Pressable
					style={[styles.primary, loading && styles.disabled]}
					onPress={handleSubmit}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.primaryText}>Sign in</Text>
					)}
				</Pressable>

				<Link href="/signup" asChild>
					<Pressable style={styles.linkWrap}>
						<Text style={styles.link}>Create an account</Text>
					</Pressable>
				</Link>
				<Link href="/" asChild>
					<Pressable style={styles.linkWrap}>
						<Text style={styles.muted}>← Back to home</Text>
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
		justifyContent: "center",
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
	muted: { color: "#666", fontSize: 14 },
});
