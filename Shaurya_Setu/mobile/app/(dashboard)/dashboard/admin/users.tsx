import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import DashboardShell from "@/components/DashboardShell";
import { useApi } from "@/hooks/use-api";

interface User {
	id: string;
	email: string;
	role: string;
	isActive: boolean;
	createdAt: string;
}

export default function AdminUsersScreen() {
	const api = useApi();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await api("/api/users");
				const data = (await res.json()) as { success?: boolean; data?: User[] };
				if (data.success && !cancelled) setUsers(data.data ?? []);
			} catch (e) {
				console.error(e);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [api]);

	if (loading) {
		return (
			<DashboardShell title="Users">
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell title="Users">
			{users.map((u) => (
				<View key={String(u.id)} style={styles.row}>
					<View style={styles.rowMain}>
						<Text style={styles.email}>{u.email}</Text>
						<Text style={styles.role}>{u.role}</Text>
					</View>
					<View style={styles.rowMeta}>
						{u.isActive ? (
							<Text style={styles.active}>Active</Text>
						) : (
							<Text style={styles.inactive}>Inactive</Text>
						)}
						<Text style={styles.date}>{new Date(u.createdAt).toLocaleDateString()}</Text>
					</View>
				</View>
			))}
			{users.length === 0 ? <Text style={styles.muted}>No users found.</Text> : null}
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	row: {
		borderBottomWidth: 1,
		borderBottomColor: "#f4f4f5",
		paddingVertical: 12,
		gap: 8,
	},
	rowMain: { flex: 1 },
	rowMeta: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
	email: { fontSize: 14, fontWeight: "600", color: "#18181b" },
	role: { fontSize: 13, textTransform: "capitalize", color: "#71717a" },
	active: {
		fontSize: 11,
		fontWeight: "600",
		color: "#065f46",
		backgroundColor: "#d1fae5",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	inactive: {
		fontSize: 11,
		fontWeight: "600",
		color: "#991b1b",
		backgroundColor: "#fee2e2",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	date: { fontSize: 12, color: "#71717a", minWidth: 90 },
	muted: { textAlign: "center", color: "#71717a", marginTop: 24 },
});
