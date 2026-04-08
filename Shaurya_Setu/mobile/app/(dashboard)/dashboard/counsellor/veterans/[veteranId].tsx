import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import DashboardShell from "@/components/DashboardShell";
import { useApi } from "@/hooks/use-api";

interface Veteran {
	id: string;
	fullName: string;
	serviceNumber: string;
	branch: string;
	yearsOfService: number;
	dischargeType: string;
	verified: boolean;
	hasCase: boolean;
	caseId?: string;
}

export default function CounsellorVeteranDetailScreen() {
	const { veteranId } = useLocalSearchParams<{ veteranId: string }>();
	const api = useApi();
	const [veteran, setVeteran] = useState<Veteran | null>(null);
	const [loading, setLoading] = useState(true);
	const [creatingCase, setCreatingCase] = useState(false);

	useEffect(() => {
		if (!veteranId) return;
		let cancelled = false;
		(async () => {
			try {
				const res = await api(`/api/veterans/${veteranId}`);
				const data = (await res.json()) as { success?: boolean; data?: Veteran };
				if (data.success && data.data && !cancelled) setVeteran(data.data);
			} catch (e) {
				console.error(e);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [api, veteranId]);

	async function handleCreateCase() {
		if (!veteran) return;
		setCreatingCase(true);
		try {
			const startDate = new Date();
			const expectedEndDate = new Date();
			expectedEndDate.setMonth(expectedEndDate.getMonth() + 6);
			const res = await api("/api/cases", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					veteranId: veteran.id,
					startDate: startDate.toISOString(),
					expectedEndDate: expectedEndDate.toISOString(),
					status: "active",
				}),
			});
			const data = (await res.json()) as { success?: boolean; data?: { id: string } };
			if (data.success && data.data?.id) {
				router.replace(`/dashboard/counsellor/cases/${data.data.id}`);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setCreatingCase(false);
		}
	}

	if (loading) {
		return (
			<DashboardShell>
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			</DashboardShell>
		);
	}

	if (!veteran) {
		return (
			<DashboardShell title="Veteran">
				<Text style={styles.h1}>Veteran not found</Text>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell title={veteran.fullName}>
			<Link href="/dashboard/counsellor/veterans" asChild>
				<Pressable>
					<Text style={styles.back}>← Back to veterans</Text>
				</Pressable>
			</Link>
			<View style={styles.card}>
				<Row label="Full name" value={veteran.fullName} />
				<Row label="Service number" value={veteran.serviceNumber} />
				<Row label="Branch" value={veteran.branch} />
				<Row label="Years of service" value={String(veteran.yearsOfService)} />
				<Row label="Discharge type" value={veteran.dischargeType} />
				<Text style={styles.label}>Verification</Text>
				{veteran.verified ? (
					<View style={styles.badgeOk}>
						<Text style={styles.badgeOkTxt}>Verified</Text>
					</View>
				) : (
					<View style={styles.badgePend}>
						<Text style={styles.badgePendTxt}>Pending verification</Text>
					</View>
				)}
			</View>
			{veteran.hasCase && veteran.caseId ? (
				<Link href={`/dashboard/counsellor/cases/${veteran.caseId}` as const} asChild>
					<Pressable style={styles.primaryBtn}>
						<Text style={styles.primaryBtnTxt}>View case →</Text>
					</Pressable>
				</Link>
			) : (
				<Pressable style={styles.primaryBtn} onPress={handleCreateCase} disabled={creatingCase}>
					<Text style={styles.primaryBtnTxt}>{creatingCase ? "Creating…" : "Create reintegration case"}</Text>
				</Pressable>
			)}
		</DashboardShell>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<View style={{ marginBottom: 12 }}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.value}>{value}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	h1: { fontSize: 20, fontWeight: "700" },
	back: { fontSize: 14, fontWeight: "600", color: "#0a7ea4", marginBottom: 12 },
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#fff",
		marginBottom: 16,
	},
	label: { fontSize: 12, fontWeight: "600", color: "#52525b", marginBottom: 4 },
	value: { fontSize: 15, color: "#18181b" },
	badgeOk: {
		alignSelf: "flex-start",
		backgroundColor: "#d1fae5",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	badgeOkTxt: { fontSize: 12, fontWeight: "600", color: "#065f46" },
	badgePend: {
		alignSelf: "flex-start",
		backgroundColor: "#fef3c7",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	badgePendTxt: { fontSize: 12, fontWeight: "600", color: "#92400e" },
	primaryBtn: {
		backgroundColor: "#18181b",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	primaryBtnTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
