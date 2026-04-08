import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/auth-context";

export default function HomeScreen() {
	const { token } = useAuth();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Shaurya Setu</Text>
			<Text style={styles.subtitle}>Connect to your vros API with EXPO_PUBLIC_API_URL</Text>

			{token ? (
				<Link href="/dashboard" asChild>
					<Pressable style={styles.button}>
						<Text style={styles.buttonText}>Open dashboard</Text>
					</Pressable>
				</Link>
			) : (
				<>
					<Link href="/login" asChild>
						<Pressable style={styles.button}>
							<Text style={styles.buttonText}>Sign in</Text>
						</Pressable>
					</Link>
					<Link href="/signup" asChild>
						<Pressable style={styles.button}>
							<Text style={styles.buttonText}>Sign up</Text>
						</Pressable>
					</Link>
				</>
			)}
			<Link href="/resources" asChild>
				<Pressable style={styles.buttonSecondary}>
					<Text style={styles.buttonSecondaryText}>Resources</Text>
				</Pressable>
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
		gap: 12,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		opacity: 0.7,
		marginBottom: 16,
	},
	button: {
		backgroundColor: "#0a7ea4",
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	buttonSecondary: {
		borderWidth: 1,
		borderColor: "#0a7ea4",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonSecondaryText: {
		color: "#0a7ea4",
		fontSize: 16,
		fontWeight: "600",
	},
});
