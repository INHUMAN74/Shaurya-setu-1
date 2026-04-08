import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import DashboardShell from "@/components/DashboardShell";
import { useApi } from "@/hooks/use-api";

interface Veteran {
	id: string;
	fullName: string;
	serviceNumber: string;
	branch: string;
	verified: boolean;
	verificationDocumentName?: string;
}

export default function AdminVerificationScreen() {
	const api = useApi();
	const [veterans, setVeterans] = useState<Veteran[]>([]);
	const [loading, setLoading] = useState(true);
	const [verifying, setVerifying] = useState<string | null>(null);
	const [recordingId, setRecordingId] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await api("/api/veterans?verified=false");
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
	}, [api]);

	async function handleVerify(veteranId: string) {
		setVerifying(veteranId);
		try {
			const res = await api(`/api/veterans/${veteranId}/verify`, { method: "PATCH" });
			const data = (await res.json()) as { success?: boolean };
			if (data.success) setVeterans((prev) => prev.filter((v) => v.id !== veteranId));
		} catch (e) {
			console.error(e);
		} finally {
			setVerifying(null);
		}
	}

	async function pickIntakeDoc(veteranId: string) {
		setRecordingId(veteranId);
		try {
			const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
			if (result.canceled || !result.assets?.[0]) {
				setRecordingId(null);
				return;
			}
			const name = result.assets[0].name ?? "document";
			const res = await api(`/api/veterans/${veteranId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ verificationDocumentName: `Admin intake: ${name}` }),
			});
			const data = (await res.json()) as { success?: boolean };
			if (data.success) {
				const label = `Admin intake: ${name}`;
				setVeterans((prev) =>
					prev.map((v) => (v.id === veteranId ? { ...v, verificationDocumentName: label } : v)),
				);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setRecordingId(null);
		}
	}

	if (loading) {
		return (
			<DashboardShell title="Verification">
				<View style={styles.center}>
					<ActivityIndicator size="large" />
				</View>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell title="Veteran verification">
			<Text style={styles.intro}>Review and verify veteran profiles pending verification.</Text>
			{veterans.length === 0 ? (
				<View style={styles.card}>
					<Text style={styles.muted}>No veterans pending verification.</Text>
				</View>
			) : (
				<View style={styles.gap}>
					{veterans.map((v) => (
						<View key={v.id} style={styles.card}>
							<Text style={styles.name}>{v.fullName}</Text>
							<Text style={styles.sub}>
								{v.serviceNumber} • {v.branch}
							</Text>
							{v.verificationDocumentName ? (
								<Text style={styles.doc}>Document: {v.verificationDocumentName}</Text>
							) : (
								<Text style={styles.warn}>No document on file (demo).</Text>
							)}
							<Pressable
								style={styles.outlineBtn}
								onPress={() => pickIntakeDoc(v.id)}
								disabled={recordingId !== null}
							>
								<Text style={styles.outlineTxt}>
									{recordingId === v.id ? "Recording…" : "Mock: attach review copy"}
								</Text>
							</Pressable>
							<Pressable
								style={styles.verifyBtn}
								onPress={() => handleVerify(v.id)}
								disabled={verifying === v.id}
							>
								<Text style={styles.verifyTxt}>{verifying === v.id ? "Verifying…" : "Verify"}</Text>
							</Pressable>
						</View>
					))}
				</View>
			)}
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	intro: { fontSize: 14, color: "#71717a", marginBottom: 16 },
	gap: { gap: 12 },
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 14,
		backgroundColor: "#fff",
	},
	name: { fontSize: 16, fontWeight: "700", color: "#18181b" },
	sub: { fontSize: 13, color: "#71717a", marginTop: 4 },
	doc: { fontSize: 12, color: "#52525b", marginTop: 8 },
	warn: { fontSize: 12, color: "#b45309", marginTop: 8 },
	outlineBtn: {
		alignSelf: "flex-start",
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#d4d4d8",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
	},
	outlineTxt: { fontSize: 13, fontWeight: "600", color: "#3f3f46" },
	verifyBtn: {
		marginTop: 12,
		alignSelf: "flex-start",
		backgroundColor: "#059669",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
	},
	verifyTxt: { color: "#fff", fontWeight: "600", fontSize: 14 },
	muted: { fontSize: 14, color: "#71717a" },
});
