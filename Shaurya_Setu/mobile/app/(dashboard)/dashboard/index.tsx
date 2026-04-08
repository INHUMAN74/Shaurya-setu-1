import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { dashboardPathForRole } from "@/lib/dashboard-path";

export default function DashboardIndex() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!user) {
		return <Redirect href="/login" />;
	}

	return <Redirect href={dashboardPathForRole(user.role)} />;
}

const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
});
