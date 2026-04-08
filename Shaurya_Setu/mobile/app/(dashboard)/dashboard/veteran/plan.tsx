import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import CaseNotesPanel from "@/components/CaseNotesPanel";
import CaseTimeline from "@/components/CaseTimeline";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/contexts/auth-context";
import { useApi } from "@/hooks/use-api";

export default function VeteranPlanScreen() {
	const { user } = useAuth();
	const api = useApi();
	const [caseId, setCaseId] = useState<string | null>(null);
	const [caseData, setCaseData] = useState<{
		status: string;
		startDate: string;
		expectedEndDate: string;
	} | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!user?.id) return;
			try {
				const profileRes = await api(`/api/veterans?userId=${user.id}`);
				const profileData = (await profileRes.json()) as {
					success?: boolean;
					data?: { id: string }[];
				};
				if (!profileData.success || !profileData.data?.[0]) {
					if (!cancelled) setLoading(false);
					return;
				}
				const veteranId = profileData.data[0].id;
				const casesRes = await api(`/api/cases?veteranId=${veteranId}`);
				const casesData = (await casesRes.json()) as {
					success?: boolean;
					data?: { id: string; status: string; startDate: string; expectedEndDate: string }[];
				};
				if (casesData.success && casesData.data?.[0]) {
					const c = casesData.data[0];
					setCaseId(String(c.id));
					setCaseData({
						status: c.status,
						startDate: c.startDate,
						expectedEndDate: c.expectedEndDate,
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
	}, [api, user?.id]);

	if (loading) {
		return (
			<DashboardShell title="My plan">
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			</DashboardShell>
		);
	}

	if (!caseId) {
		return (
			<DashboardShell title="My reintegration plan">
				<View style={styles.card}>
					<Text style={styles.muted}>
						You don&apos;t have an active reintegration case yet. A counsellor will set up your plan soon.
					</Text>
				</View>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell title="My reintegration plan">
			{caseData && (
				<View style={styles.card}>
					<Text style={styles.row}>
						<Text style={styles.bold}>Status: </Text>
						{caseData.status.replace(/_/g, " ")}
					</Text>
					<Text style={styles.row}>
						<Text style={styles.bold}>Start: </Text>
						{new Date(caseData.startDate).toLocaleDateString()}
					</Text>
					<Text style={styles.row}>
						<Text style={styles.bold}>Expected end: </Text>
						{new Date(caseData.expectedEndDate).toLocaleDateString()}
					</Text>
				</View>
			)}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Stages & tasks</Text>
				<CaseTimeline caseId={caseId} />
			</View>
			<CaseNotesPanel caseId={caseId} canAdd={false} />
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	center: { padding: 32, alignItems: "center" },
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#fff",
		marginBottom: 16,
	},
	row: { fontSize: 14, color: "#52525b", marginBottom: 4 },
	bold: { fontWeight: "700", color: "#3f3f46" },
	muted: { fontSize: 14, color: "#71717a", lineHeight: 20 },
	section: { marginBottom: 8 },
	sectionTitle: { fontSize: 16, fontWeight: "700", color: "#18181b", marginBottom: 8 },
});
