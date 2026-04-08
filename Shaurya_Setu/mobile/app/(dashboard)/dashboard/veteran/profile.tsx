import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/contexts/auth-context";
import { useApi } from "@/hooks/use-api";

interface VeteranProfile {
	id: string;
	fullName: string;
	serviceNumber: string;
	branch: string;
	yearsOfService: number;
	dischargeType: string;
	verified: boolean;
	verificationDocumentName?: string;
}

const DISCHARGE = ["Honorable", "General", "Other Than Honorable", "Bad Conduct", "Dishonorable"] as const;

export default function VeteranProfileScreen() {
	const { user } = useAuth();
	const api = useApi();
	const [profile, setProfile] = useState<VeteranProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadMsg, setUploadMsg] = useState("");
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		fullName: "",
		serviceNumber: "",
		branch: "",
		yearsOfService: "",
		dischargeType: "",
	});

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!user?.id) return;
			try {
				const res = await api(`/api/veterans?userId=${user.id}`);
				const data = (await res.json()) as { success?: boolean; data?: VeteranProfile[] };
				if (data.success && data.data?.[0]) {
					if (!cancelled) setProfile(data.data[0]);
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

	async function handleSubmit() {
		if (!user?.id) return;
		setError("");
		setCreating(true);
		try {
			const res = await api("/api/veterans", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fullName: formData.fullName,
					serviceNumber: formData.serviceNumber,
					branch: formData.branch,
					yearsOfService: Number(formData.yearsOfService),
					dischargeType: formData.dischargeType,
				}),
			});
			const data = (await res.json()) as { success?: boolean; data?: VeteranProfile; error?: string };
			if (!res.ok) {
				setError(data.error ?? "Failed to create profile");
				return;
			}
			if (data.success && data.data) setProfile(data.data);
		} catch {
			setError("Something went wrong.");
		} finally {
			setCreating(false);
		}
	}

	async function pickDocument() {
		if (!profile) return;
		setUploadMsg("");
		setUploading(true);
		try {
			const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
			if (result.canceled || !result.assets?.[0]) {
				setUploading(false);
				return;
			}
			const name = result.assets[0].name ?? "document";
			const res = await api(`/api/veterans/${profile.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ verificationDocumentName: name }),
			});
			const data = (await res.json()) as { success?: boolean; error?: string };
			if (data.success) {
				setProfile({ ...profile, verificationDocumentName: name });
				setUploadMsg("Recorded for verification (demo — file not stored on server).");
			} else {
				setUploadMsg(data.error ?? "Could not record file name.");
			}
		} catch {
			setUploadMsg("Something went wrong.");
		} finally {
			setUploading(false);
		}
	}

	if (loading) {
		return (
			<DashboardShell title="My profile">
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			</DashboardShell>
		);
	}

	if (!profile) {
		return (
			<DashboardShell title="Create profile">
				<Text style={styles.intro}>Complete your veteran profile to get started.</Text>
				{error ? (
					<View style={styles.errBox}>
						<Text style={styles.errTxt}>{error}</Text>
					</View>
				) : null}
				<Text style={styles.label}>Full name *</Text>
				<TextInput
					style={styles.input}
					value={formData.fullName}
					onChangeText={(t) => setFormData((f) => ({ ...f, fullName: t }))}
					placeholder="John Doe"
                placeholderTextColor="#a1a1aa"
				/>
				<Text style={styles.label}>Service number *</Text>
				<TextInput
					style={styles.input}
					value={formData.serviceNumber}
					onChangeText={(t) => setFormData((f) => ({ ...f, serviceNumber: t }))}
				/>
				<Text style={styles.label}>Branch *</Text>
				<TextInput
					style={styles.input}
					value={formData.branch}
					onChangeText={(t) => setFormData((f) => ({ ...f, branch: t }))}
					placeholder="Army, Navy…"
                placeholderTextColor="#a1a1aa"
				/>
				<Text style={styles.label}>Years of service *</Text>
				<TextInput
					style={styles.input}
					value={formData.yearsOfService}
					onChangeText={(t) => setFormData((f) => ({ ...f, yearsOfService: t }))}
					keyboardType="number-pad"
				/>
				<Text style={styles.label}>Discharge type *</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
					{DISCHARGE.map((d) => (
						<Pressable
							key={d}
							style={[styles.chip, formData.dischargeType === d && styles.chipOn]}
							onPress={() => setFormData((f) => ({ ...f, dischargeType: d }))}
						>
							<Text style={[styles.chipTxt, formData.dischargeType === d && styles.chipTxtOn]}>{d}</Text>
						</Pressable>
					))}
				</ScrollView>
				<Pressable style={[styles.primaryBtn, creating && styles.disabled]} onPress={handleSubmit} disabled={creating}>
					<Text style={styles.primaryBtnTxt}>{creating ? "Creating…" : "Create profile"}</Text>
				</Pressable>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell title="My profile">
			<View style={styles.card}>
				<Row label="Full name" value={profile.fullName} />
				<Row label="Service number" value={profile.serviceNumber} />
				<Row label="Branch" value={profile.branch} />
				<Row label="Years of service" value={String(profile.yearsOfService)} />
				<Row label="Discharge type" value={profile.dischargeType} />
				<Text style={styles.label}>Verification</Text>
				{profile.verified ? (
					<View style={styles.badgeOk}>
						<Text style={styles.badgeOkTxt}>Verified</Text>
					</View>
				) : (
					<View style={styles.badgePend}>
						<Text style={styles.badgePendTxt}>Pending verification</Text>
					</View>
				)}
			</View>
			<View style={styles.card}>
				<Text style={styles.h2}>Verification document (demo)</Text>
				<Text style={styles.sub}>
					Upload a document for admin review. The server stores the file name only.
				</Text>
				{profile.verificationDocumentName ? (
					<Text style={styles.fileOn}>On file: {profile.verificationDocumentName}</Text>
				) : (
					<Text style={styles.muted}>No document recorded yet.</Text>
				)}
				<Pressable style={styles.outlineBtn} onPress={pickDocument} disabled={uploading}>
					<Text style={styles.outlineTxt}>{uploading ? "Working…" : "Choose file"}</Text>
				</Pressable>
				{uploadMsg ? <Text style={styles.okMsg}>{uploadMsg}</Text> : null}
			</View>
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
	center: { padding: 32, alignItems: "center" },
	intro: { fontSize: 14, color: "#71717a", marginBottom: 16 },
	errBox: {
		padding: 10,
		borderRadius: 8,
		backgroundColor: "#fef2f2",
		borderWidth: 1,
		borderColor: "#fecaca",
		marginBottom: 12,
	},
	errTxt: { color: "#b91c1c", fontSize: 14 },
	label: { fontSize: 12, fontWeight: "600", color: "#52525b", marginBottom: 4 },
	value: { fontSize: 15, color: "#18181b" },
	input: {
		borderWidth: 1,
		borderColor: "#d4d4d8",
		borderRadius: 8,
		padding: Platform.OS === "ios" ? 12 : 8,
		fontSize: 16,
		marginBottom: 12,
		backgroundColor: "#fff",
		color: "#18181b",
	},
	chipRow: { marginBottom: 16, maxHeight: 44 },
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#d4d4d8",
		marginRight: 8,
		backgroundColor: "#fff",
	},
	chipOn: { borderColor: "#0a7ea4", backgroundColor: "#e0f2fe" },
	chipTxt: { fontSize: 13, color: "#3f3f46" },
	chipTxtOn: { color: "#0a7ea4", fontWeight: "700" },
	primaryBtn: {
		backgroundColor: "#18181b",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	primaryBtnTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },
	disabled: { opacity: 0.6 },
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#fff",
		marginBottom: 16,
	},
	h2: { fontSize: 17, fontWeight: "700", color: "#18181b" },
	sub: { marginTop: 6, fontSize: 13, color: "#71717a", lineHeight: 18 },
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
	fileOn: { marginTop: 8, fontSize: 14, color: "#18181b" },
	muted: { marginTop: 8, fontSize: 14, color: "#71717a" },
	outlineBtn: {
		marginTop: 12,
		alignSelf: "flex-start",
		borderWidth: 1,
		borderColor: "#d4d4d8",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		backgroundColor: "#fafafa",
	},
	outlineTxt: { fontSize: 14, fontWeight: "600", color: "#3f3f46" },
	okMsg: { marginTop: 10, fontSize: 13, color: "#059669" },
});
