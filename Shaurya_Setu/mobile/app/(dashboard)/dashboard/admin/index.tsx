import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import DashboardShell from "@/components/DashboardShell";
import HorizontalBarChart from "@/components/HorizontalBarChart";
import { useApi } from "@/hooks/use-api";

interface Stats {
	users: { total: number; byRole: Record<string, number> };
	veterans: number;
	cases: { active: number; paused: number; completed: number };
	overdueTaskCount: number;
}

const ROLE_LABELS: Record<string, string> = {
	veteran: "Veterans (accounts)",
	employer: "Employers",
	counsellor: "Counsellors",
	admin: "Admins",
};

const ROLE_COLORS = ["#8b5cf6", "#0ea5e9", "#14b8a6", "#f97316"];

export default function AdminDashboardScreen() {
	const api = useApi();
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const [usersRes, veteransRes, casesRes, dashRes] = await Promise.all([
					api("/api/users"),
					api("/api/veterans"),
					api("/api/cases"),
					api("/api/stats"),
				]);
				const usersData = (await usersRes.json()) as { success?: boolean; data?: { role: string }[] };
				const veteransData = (await veteransRes.json()) as { success?: boolean; data?: unknown[] };
				const casesData = (await casesRes.json()) as { success?: boolean; data?: { status: string }[] };
				const dashData = (await dashRes.json()) as {
					success?: boolean;
					data?: { overdueTaskCount: number };
				};

				const byRole: Record<string, number> = {};
				if (usersData.success && usersData.data) {
					for (const u of usersData.data) {
						byRole[u.role] = (byRole[u.role] || 0) + 1;
					}
				}

				const list = casesData.success ? casesData.data ?? [] : [];
				const active = list.filter((c) => c.status === "active").length;
				const paused = list.filter((c) => c.status === "paused").length;
				const completed = list.filter((c) => c.status === "completed").length;

				if (!cancelled) {
					setStats({
						users: {
							total: usersData.success ? usersData.data?.length ?? 0 : 0,
							byRole,
						},
						veterans: veteransData.success ? veteransData.data?.length ?? 0 : 0,
						cases: { active, paused, completed },
						overdueTaskCount: dashData.success ? dashData.data?.overdueTaskCount ?? 0 : 0,
					});
				}
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
			<DashboardShell>
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			</DashboardShell>
		);
	}

	const roleEntries = Object.entries(stats?.users.byRole ?? {}).sort((a, b) => b[1] - a[1]);
	const roleBarItems = roleEntries.map(([role, value], i) => ({
		label: ROLE_LABELS[role] ?? role,
		value,
		color: ROLE_COLORS[i % ROLE_COLORS.length],
	}));

	const caseBarItems = [
		{ label: "Active", value: stats?.cases.active ?? 0, color: "#3b82f6" },
		{ label: "Paused", value: stats?.cases.paused ?? 0, color: "#f59e0b" },
		{ label: "Completed", value: stats?.cases.completed ?? 0, color: "#10b981" },
	];

	return (
		<DashboardShell title="Admin">
			<Text style={styles.intro}>Platform usage and case health at a glance.</Text>
			<View style={styles.grid}>
				<Tile label="Total users" value={String(stats?.users.total ?? 0)} />
				<Tile label="Veteran profiles" value={String(stats?.veterans ?? 0)} />
				<Tile label="Active cases" value={String(stats?.cases.active ?? 0)} />
				<Tile label="Completed cases" value={String(stats?.cases.completed ?? 0)} />
				<Tile label="Overdue tasks" value={String(stats?.overdueTaskCount ?? 0)} warn />
			</View>
			<View style={styles.charts}>
				<HorizontalBarChart title="Cases by status" items={caseBarItems} />
				{roleBarItems.length > 0 ? (
					<HorizontalBarChart title="Users by role" items={roleBarItems} />
				) : (
					<View style={styles.emptyChart}>
						<Text style={styles.muted}>No role data yet.</Text>
					</View>
				)}
			</View>
			<View style={styles.links}>
				<Link href="/dashboard/admin/users" asChild>
					<Pressable style={styles.linkCard}>
						<Text style={styles.linkTitle}>Users</Text>
						<Text style={styles.linkSub}>Manage user accounts and roles</Text>
					</Pressable>
				</Link>
				<Link href="/dashboard/admin/verification" asChild>
					<Pressable style={styles.linkCard}>
						<Text style={styles.linkTitle}>Veteran verification</Text>
						<Text style={styles.linkSub}>Review and verify veteran profiles</Text>
					</Pressable>
				</Link>
			</View>
		</DashboardShell>
	);
}

function Tile({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
	return (
		<View style={[styles.tile, warn && styles.tileWarn]}>
			<Text style={[styles.tileLabel, warn && styles.tileLabelWarn]}>{label}</Text>
			<Text style={[styles.tileVal, warn && styles.tileValWarn]}>{value}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	intro: { fontSize: 14, color: "#71717a", marginBottom: 16 },
	grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
	tile: {
		minWidth: "30%",
		flexGrow: 1,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 12,
		backgroundColor: "#fff",
	},
	tileWarn: { borderColor: "#fecaca", backgroundColor: "#fef2f2" },
	tileLabel: { fontSize: 12, color: "#71717a" },
	tileLabelWarn: { color: "#991b1b" },
	tileVal: { fontSize: 22, fontWeight: "700", color: "#18181b", marginTop: 4 },
	tileValWarn: { color: "#991b1b" },
	charts: { gap: 16, marginBottom: 16 },
	emptyChart: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#fff",
	},
	muted: { color: "#71717a", fontSize: 14 },
	links: { gap: 12 },
	linkCard: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#fff",
	},
	linkTitle: { fontSize: 17, fontWeight: "700", color: "#18181b" },
	linkSub: { fontSize: 14, color: "#71717a", marginTop: 6 },
});
