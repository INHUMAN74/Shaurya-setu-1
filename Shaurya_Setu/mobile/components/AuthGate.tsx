import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/contexts/auth-context";

export function AuthGate({ children }: { children: React.ReactNode }) {
	const { token, loading } = useAuth();

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!token) {
		return <Redirect href="/login" />;
	}

	return <>{children}</>;
}

const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
});
