import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import DashboardShell from "@/components/DashboardShell";
import HorizontalBarChart from "@/components/HorizontalBarChart";
import { useApi } from "@/hooks/use-api";

interface Case {
	id: string;
	veteranId: { fullName: string; serviceNumber: string };
	status: string;
	startDate: string;
	expectedEndDate: string;
}

interface StatsPayload {
	veteranCount: number;
	cases: { active: number; paused: number; completed: number };
	overdueTaskCount: number;
}

export default function CounsellorDashboardScreen() {
	const api = useApi();
	const [stats, setStats] = useState({ active: 0, paused: 0, completed: 0 });
	const [overview, setOverview] = useState<StatsPayload | null>(null);
	const [cases, setCases] = useState<Case[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const [casesRes, statsRes] = await Promise.all([api("/api/cases"), api("/api/stats")]);
				const casesData = (await casesRes.json()) as { success?: boolean; data?: Case[] };
				const statsData = (await statsRes.json()) as { success?: boolean; data?: StatsPayload };

				if (casesData.success && casesData.data) {
					const list = casesData.data;
					if (!cancelled) {
						setCases(list);
						setStats({
							active: list.filter((c) => c.status === "active").length,
							paused: list.filter((c) => c.status === "paused").length,
							completed: list.filter((c) => c.status === "completed").length,
						});
					}
				}
				if (statsData.success && statsData.data && !cancelled) {
					setOverview(statsData.data);
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

	const caseBarItems = [
		{ label: "Active", value: overview?.cases.active ?? stats.active, color: "#3b82f6" },
		{ label: "Paused", value: overview?.cases.paused ?? stats.paused, color: "#f59e0b" },
		{ label: "Completed", value: overview?.cases.completed ?? stats.completed, color: "#10b981" },
	];

	return (
		<DashboardShell title="Dashboard">
			<Text style={styles.intro}>Overview of veterans, cases, and open work.</Text>
			<View style={styles.grid}>
				<View style={styles.tile}>
					<Text style={styles.tileLabel}>Registered veterans</Text>
					<Text style={styles.tileVal}>{overview?.veteranCount ?? "—"}</Text>
				</View>
				<View style={styles.tile}>
					<Text style={styles.tileLabel}>Active cases</Text>
					<Text style={styles.tileVal}>{stats.active}</Text>
				</View>
				<View style={styles.tile}>
					<Text style={styles.tileLabel}>Paused cases</Text>
					<Text style={styles.tileVal}>{stats.paused}</Text>
				</View>
				<View style={[styles.tile, styles.tileWarn]}>
					<Text style={styles.tileLabelWarn}>Overdue tasks</Text>
					<Text style={styles.tileValWarn}>{overview?.overdueTaskCount ?? "—"}</Text>
				</View>
			</View>
			<View style={styles.chartWrap}>
				<HorizontalBarChart title="Cases by status" items={caseBarItems} />
			</View>
			<View style={styles.sectionHead}>
				<Text style={styles.h2}>Recent cases</Text>
				<Link href="/dashboard/counsellor/cases" asChild>
					<Pressable>
						<Text style={styles.link}>View all →</Text>
					</Pressable>
				</Link>
			</View>
			<View style={styles.gap}>
				{cases.slice(0, 5).map((c) => (
					<Link key={c.id} href={`/dashboard/counsellor/cases/${c.id}` as const} asChild>
						<Pressable style={styles.caseCard}>
							<View>
								<Text style={styles.caseName}>
									{typeof c.veteranId === "object" ? c.veteranId.fullName : "Unknown"}
								</Text>
								<Text style={styles.caseSub}>
									{typeof c.veteranId === "object" ? c.veteranId.serviceNumber : ""}
								</Text>
							</View>
							<Text style={styles.statusBadge}>{c.status.replace(/_/g, " ")}</Text>
						</Pressable>
					</Link>
				))}
				{cases.length === 0 ? <Text style={styles.muted}>No cases yet.</Text> : null}
			</View>
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	intro: { fontSize: 14, color: "#71717a", marginBottom: 16 },
	grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
	tile: {
		flexGrow: 1,
		minWidth: "45%",
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 12,
		backgroundColor: "#fff",
	},
	tileWarn: {
		borderColor: "#fecaca",
		backgroundColor: "#fef2f2",
	},
	tileLabel: { fontSize: 12, color: "#71717a" },
	tileLabelWarn: { fontSize: 12, color: "#991b1b" },
	tileVal: { fontSize: 22, fontWeight: "700", color: "#18181b", marginTop: 4 },
	tileValWarn: { fontSize: 22, fontWeight: "700", color: "#991b1b", marginTop: 4 },
	chartWrap: { marginBottom: 16 },
	sectionHead: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	h2: { fontSize: 17, fontWeight: "700", color: "#18181b" },
	link: { fontSize: 14, fontWeight: "600", color: "#0a7ea4" },
	gap: { gap: 8 },
	caseCard: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 14,
		backgroundColor: "#fff",
	},
	caseName: { fontSize: 15, fontWeight: "600", color: "#18181b" },
	caseSub: { fontSize: 13, color: "#71717a", marginTop: 2 },
	statusBadge: {
		fontSize: 11,
		fontWeight: "600",
		textTransform: "capitalize",
		backgroundColor: "#dbeafe",
		color: "#1e40af",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	muted: { textAlign: "center", color: "#71717a", fontSize: 14 },
});
