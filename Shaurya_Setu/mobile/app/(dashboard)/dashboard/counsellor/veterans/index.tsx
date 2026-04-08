import { Link } from "expo-router";
import { useEffect, useState } from "react";
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

interface Veteran {
	id: string;
	fullName: string;
	serviceNumber: string;
	branch: string;
	verified: boolean;
	userId: { email: string };
}

type VerifiedFilter = "all" | "verified" | "pending";

export default function CounsellorVeteransScreen() {
	const api = useApi();
	const [veterans, setVeterans] = useState<Veteran[]>([]);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>("all");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
		return () => clearTimeout(t);
	}, [searchInput]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const params = new URLSearchParams();
				if (debouncedSearch) params.set("search", debouncedSearch);
				if (verifiedFilter === "verified") params.set("verified", "true");
				if (verifiedFilter === "pending") params.set("verified", "false");
				const q = params.toString();
				const res = await api(q ? `/api/veterans?${q}` : "/api/veterans");
				const data = (await res.json()) as { success?: boolean; data?: Veteran[] };
				if (data.success && !cancelled) setVeterans(data.data ?? []);
			} catch (e) {
				console.error(e);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [api, debouncedSearch, verifiedFilter]);

	const filters = [
		{ id: "all" as const, label: "All" },
		{ id: "verified" as const, label: "Verified" },
		{ id: "pending" as const, label: "Pending" },
	];

	return (
		<DashboardShell title="Veterans">
			<Text style={styles.intro}>Search by name or service number. Filter by verification.</Text>
			<TextInput
				style={styles.search}
				placeholder="Search…"
                placeholderTextColor="#a1a1aa"
				value={searchInput}
				onChangeText={setSearchInput}
			/>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
				{filters.map((f) => (
					<Pressable
						key={f.id}
						style={[styles.chip, verifiedFilter === f.id && styles.chipOn]}
						onPress={() => setVerifiedFilter(f.id)}
					>
						<Text style={[styles.chipTxt, verifiedFilter === f.id && styles.chipTxtOn]}>{f.label}</Text>
					</Pressable>
				))}
			</ScrollView>
			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			) : (
				<View style={styles.table}>
					{veterans.map((v) => (
						<View key={v.id} style={styles.row}>
							<View style={{ flex: 1 }}>
								<Text style={styles.name}>{v.fullName}</Text>
								<Text style={styles.sub}>
									{v.serviceNumber} • {v.branch}
								</Text>
							</View>
							{v.verified ? (
								<Text style={styles.ok}>Verified</Text>
							) : (
								<Text style={styles.pend}>Pending</Text>
							)}
							<Link href={`/dashboard/counsellor/veterans/${v.id}` as const} asChild>
								<Pressable>
									<Text style={styles.view}>View →</Text>
								</Pressable>
							</Link>
						</View>
					))}
					{veterans.length === 0 ? <Text style={styles.muted}>No veterans found.</Text> : null}
				</View>
			)}
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	intro: { fontSize: 14, color: "#71717a", marginBottom: 12 },
	search: {
		borderWidth: 1,
		borderColor: "#d4d4d8",
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		fontSize: 16,
		backgroundColor: "#fff",
		color: "#18181b",
	},
	filterRow: { marginBottom: 16, maxHeight: 44 },
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		marginRight: 8,
		backgroundColor: "#fff",
	},
	chipOn: { backgroundColor: "#18181b", borderColor: "#18181b" },
	chipTxt: { fontSize: 14, fontWeight: "600", color: "#3f3f46" },
	chipTxtOn: { color: "#fff" },
	center: { padding: 32, alignItems: "center" },
	table: { gap: 8 },
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 12,
		backgroundColor: "#fff",
	},
	name: { fontSize: 15, fontWeight: "600", color: "#18181b" },
	sub: { fontSize: 12, color: "#71717a", marginTop: 2 },
	ok: { fontSize: 11, fontWeight: "700", color: "#065f46", backgroundColor: "#d1fae5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
	pend: { fontSize: 11, fontWeight: "700", color: "#92400e", backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
	view: { fontSize: 14, fontWeight: "600", color: "#0a7ea4" },
	muted: { textAlign: "center", color: "#71717a", marginTop: 16 },
});
