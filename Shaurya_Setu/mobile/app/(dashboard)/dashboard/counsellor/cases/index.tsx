import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import DashboardShell from "@/components/DashboardShell";
import { useApi } from "@/hooks/use-api";

interface Case {
	id: string;
	veteranId: { fullName: string; serviceNumber: string };
	status: string;
	startDate: string;
	expectedEndDate: string;
}

export default function CounsellorCasesScreen() {
	const api = useApi();
	const [cases, setCases] = useState<Case[]>([]);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const url =
					statusFilter !== "all" ? `/api/cases?status=${statusFilter}` : "/api/cases";
				const res = await api(url);
				const data = (await res.json()) as { success?: boolean; data?: Case[] };
				if (data.success && !cancelled) setCases(data.data ?? []);
			} catch (e) {
				console.error(e);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [api, statusFilter]);

	const filteredCases = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return cases;
		return cases.filter((c) => {
			const name =
				typeof c.veteranId === "object" ? (c.veteranId.fullName ?? "").toLowerCase() : "";
			const sn =
				typeof c.veteranId === "object" ? (c.veteranId.serviceNumber ?? "").toLowerCase() : "";
			return name.includes(q) || sn.includes(q);
		});
	}, [cases, search]);

	const filters = [
		{ id: "all", label: "All" },
		{ id: "active", label: "Active" },
		{ id: "paused", label: "Paused" },
		{ id: "completed", label: "Completed" },
	] as const;

	return (
		<DashboardShell title="Cases">
			<Text style={styles.intro}>Filter by status, then search by veteran name or service number.</Text>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
				{filters.map((f) => (
					<Pressable
						key={f.id}
						style={[styles.filterChip, statusFilter === f.id && styles.filterOn]}
						onPress={() => setStatusFilter(f.id)}
					>
						<Text style={[styles.filterTxt, statusFilter === f.id && styles.filterTxtOn]}>
							{f.label}
						</Text>
					</Pressable>
				))}
			</ScrollView>
			<TextInput
				style={styles.search}
				placeholder="Search name or service no…"
                placeholderTextColor="#a1a1aa"
				value={search}
				onChangeText={setSearch}
			/>
			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			) : (
				<View style={styles.gap}>
					{filteredCases.map((c) => (
						<Link key={c.id} href={`/dashboard/counsellor/cases/${c.id}` as const} asChild>
							<Pressable style={styles.card}>
								<View>
									<Text style={styles.name}>
										{typeof c.veteranId === "object" ? c.veteranId.fullName : "Unknown"}
									</Text>
									<Text style={styles.sub}>
										Started {new Date(c.startDate).toLocaleDateString()} • Expected{" "}
										{new Date(c.expectedEndDate).toLocaleDateString()}
									</Text>
								</View>
								<Text style={styles.badge}>{c.status.replace(/_/g, " ")}</Text>
							</Pressable>
						</Link>
					))}
					{filteredCases.length === 0 ? (
						<Text style={styles.muted}>
							{cases.length === 0 ? "No cases found." : "No cases match your search."}
						</Text>
					) : null}
				</View>
			)}
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	intro: { fontSize: 14, color: "#71717a", marginBottom: 12 },
	filterRow: { marginBottom: 12, maxHeight: 44 },
	filterChip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		marginRight: 8,
		backgroundColor: "#fff",
	},
	filterOn: { backgroundColor: "#18181b", borderColor: "#18181b" },
	filterTxt: { fontSize: 14, fontWeight: "600", color: "#3f3f46" },
	filterTxtOn: { color: "#fff" },
	search: {
		borderWidth: 1,
		borderColor: "#d4d4d8",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
		backgroundColor: "#fff",
		color: "#18181b",
	},
	center: { padding: 32, alignItems: "center" },
	gap: { gap: 10 },
	card: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 14,
		backgroundColor: "#fff",
	},
	name: { fontSize: 15, fontWeight: "600", color: "#18181b" },
	sub: { fontSize: 12, color: "#71717a", marginTop: 4 },
	badge: {
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
