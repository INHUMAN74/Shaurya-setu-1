import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/contexts/auth-context";
import { useApi } from "@/hooks/use-api";

interface VeteranProfile {
	id: string;
	fullName: string;
	serviceNumber: string;
	branch: string;
	verified: boolean;
}

interface Case {
	id: string;
	status: string;
	startDate: string;
	expectedEndDate: string;
}

export default function VeteranDashboardScreen() {
	const { user } = useAuth();
	const api = useApi();
	const [profile, setProfile] = useState<VeteranProfile | null>(null);
	const [case_, setCase] = useState<Case | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!user?.id) return;
			try {
				const profileRes = await api(`/api/veterans?userId=${user.id}`);
				const profileData = (await profileRes.json()) as {
					success?: boolean;
					data?: VeteranProfile[];
				};
				if (cancelled || !profileData.success || !profileData.data?.[0]) {
					if (!cancelled) setLoading(false);
					return;
				}
				const myProfile = profileData.data[0];
				setProfile(myProfile);
				const casesRes = await api(`/api/cases?veteranId=${myProfile.id}`);
				const casesData = (await casesRes.json()) as { success?: boolean; data?: Case[] };
				if (casesData.success && casesData.data?.[0]) {
					setCase(casesData.data[0]);
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
			<DashboardShell>
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell title="Dashboard">
			{profile ? (
				<View style={styles.gap}>
					<View style={styles.card}>
						<Text style={styles.h2}>My profile</Text>
						<Text style={styles.row}>
							<Text style={styles.bold}>Name: </Text>
							{profile.fullName}
						</Text>
						<Text style={styles.row}>
							<Text style={styles.bold}>Service number: </Text>
							{profile.serviceNumber}
						</Text>
						<Text style={styles.row}>
							<Text style={styles.bold}>Branch: </Text>
							{profile.branch}
						</Text>
						{profile.verified ? (
							<View style={styles.badgeOk}>
								<Text style={styles.badgeOkTxt}>Verified</Text>
							</View>
						) : null}
						<Link href="/dashboard/veteran/profile" asChild>
							<Pressable style={styles.linkBtn}>
								<Text style={styles.linkTxt}>View full profile →</Text>
							</Pressable>
						</Link>
					</View>
					{case_ ? (
						<View style={styles.card}>
							<Text style={styles.h2}>My reintegration case</Text>
							<Text style={styles.row}>
								<Text style={styles.bold}>Status: </Text>
								{case_.status.replace(/_/g, " ")}
							</Text>
							<Text style={styles.row}>
								<Text style={styles.bold}>Start: </Text>
								{new Date(case_.startDate).toLocaleDateString()}
							</Text>
							<Text style={styles.row}>
								<Text style={styles.bold}>Expected end: </Text>
								{new Date(case_.expectedEndDate).toLocaleDateString()}
							</Text>
							<Link href="/dashboard/veteran/plan" asChild>
								<Pressable style={styles.primaryBtn}>
									<Text style={styles.primaryBtnTxt}>View my reintegration plan →</Text>
								</Pressable>
							</Link>
						</View>
					) : (
						<View style={styles.card}>
							<Text style={styles.muted}>
								You don&apos;t have an active reintegration case yet. A counsellor will set up your plan
								soon.
							</Text>
						</View>
					)}
				</View>
			) : (
				<View style={styles.card}>
					<Text style={styles.muted}>Please complete your veteran profile to get started.</Text>
					<Link href="/dashboard/veteran/profile" asChild>
						<Pressable style={styles.primaryBtn}>
							<Text style={styles.primaryBtnTxt}>Create profile →</Text>
						</Pressable>
					</Link>
				</View>
			)}
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	gap: { gap: 16 },
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#fff",
	},
	h2: { fontSize: 17, fontWeight: "700", color: "#18181b", marginBottom: 8 },
	row: { fontSize: 14, color: "#52525b", marginBottom: 4 },
	bold: { fontWeight: "700", color: "#3f3f46" },
	badgeOk: {
		alignSelf: "flex-start",
		marginTop: 8,
		backgroundColor: "#d1fae5",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	badgeOkTxt: { fontSize: 12, fontWeight: "600", color: "#065f46" },
	linkBtn: { marginTop: 12 },
	linkTxt: { fontSize: 14, fontWeight: "600", color: "#0a7ea4" },
	muted: { fontSize: 14, color: "#71717a", lineHeight: 20 },
	primaryBtn: {
		marginTop: 12,
		backgroundColor: "#18181b",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	primaryBtnTxt: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
