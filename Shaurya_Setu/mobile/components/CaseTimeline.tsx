import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { useApi } from "@/hooks/use-api";

type StageType = "employment" | "family" | "wellbeing";
type StageStatus = "pending" | "in_progress" | "completed";
type TaskStatus = "todo" | "in_progress" | "done";

type Task = {
	id: string;
	title: string;
	status: TaskStatus;
};

type Stage = {
	id: string;
	stageType: StageType;
	status: StageStatus;
	tasks: Task[];
};

const STAGE_LABELS: Record<StageType, string> = {
	employment: "Employment",
	family: "Family",
	wellbeing: "Wellbeing",
};

function formatStatus(s: string) {
	return s.replace(/_/g, " ");
}

export default function CaseTimeline({ caseId }: { caseId: string }) {
	const api = useApi();
	const [stages, setStages] = useState<Stage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api(`/api/cases/${caseId}/stages`);
				const json = (await res.json()) as { data?: Stage[]; error?: string };
				if (!res.ok) throw new Error(json.error ?? "Failed to load stages");
				const data = json.data ?? [];
				if (!cancelled) {
					setStages(data);
					if (data.length > 0) setExpandedId(String(data[0].id));
				}
			} catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : "Error");
					setStages([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [api, caseId]);

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.errBox}>
				<Text style={styles.errText}>{error}</Text>
			</View>
		);
	}

	if (stages.length === 0) {
		return (
			<View style={styles.empty}>
				<Text style={styles.muted}>No stages found for this case.</Text>
			</View>
		);
	}

	return (
		<View style={styles.wrap}>
			{stages.map((stage, index) => {
				const expanded = expandedId === String(stage.id);
				const hasTasks = stage.tasks?.length > 0;
				return (
					<View key={stage.id} style={styles.stageRow}>
						<View style={styles.dotCol}>
							<View
								style={[
									styles.dot,
									stage.status === "completed" && styles.dotDone,
									stage.status === "in_progress" && styles.dotProg,
								]}
							>
								<Text
								style={[
									styles.dotTxt,
									stage.status !== "completed" &&
										stage.status !== "in_progress" &&
										styles.dotTxtMuted,
								]}
							>
								{stage.status === "completed" ? "✓" : index + 1}
							</Text>
							</View>
						</View>
						<View style={styles.stageBody}>
							<Pressable
								style={styles.stageCard}
								onPress={() => setExpandedId(expanded ? null : String(stage.id))}
							>
								<Text style={styles.stageTitle}>{STAGE_LABELS[stage.stageType]}</Text>
								<Text style={styles.badge}>{formatStatus(stage.status)}</Text>
							</Pressable>
							{expanded && hasTasks && (
								<View style={styles.tasks}>
									{stage.tasks.map((t) => (
										<View key={t.id} style={styles.taskRow}>
											<Text style={styles.taskTitle}>{t.title}</Text>
											<Text style={styles.taskBadge}>{formatStatus(t.status)}</Text>
										</View>
									))}
								</View>
							)}
							{expanded && !hasTasks && (
								<Text style={styles.mutedSmall}>No tasks yet.</Text>
							)}
						</View>
					</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { paddingVertical: 4 },
	center: { padding: 24, alignItems: "center" },
	errBox: {
		padding: 12,
		borderRadius: 8,
		backgroundColor: "#fef2f2",
		borderWidth: 1,
		borderColor: "#fecaca",
	},
	errText: { color: "#b91c1c" },
	empty: {
		padding: 16,
		borderRadius: 8,
		backgroundColor: "#f4f4f5",
		borderWidth: 1,
		borderColor: "#e4e4e7",
	},
	muted: { color: "#71717a", textAlign: "center" },
	stageRow: { flexDirection: "row", marginBottom: 16 },
	dotCol: { width: 36, alignItems: "center" },
	dot: {
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 2,
		borderColor: "#d4d4d8",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	dotDone: { backgroundColor: "#10b981", borderColor: "#10b981" },
	dotProg: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
	dotTxt: { fontSize: 12, fontWeight: "700", color: "#fff" },
	dotTxtMuted: { color: "#3f3f46" },
	stageBody: { flex: 1 },
	stageCard: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		backgroundColor: "#fff",
	},
	stageTitle: { fontWeight: "600", color: "#18181b", flex: 1 },
	badge: {
		fontSize: 11,
		textTransform: "capitalize",
		color: "#52525b",
		backgroundColor: "#f4f4f5",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	tasks: { marginTop: 8, paddingLeft: 4, gap: 8 },
	taskRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 8,
		borderRadius: 6,
		backgroundColor: "#fafafa",
		borderWidth: 1,
		borderColor: "#f4f4f5",
	},
	taskTitle: { flex: 1, fontSize: 13, color: "#3f3f46" },
	taskBadge: { fontSize: 11, textTransform: "capitalize", color: "#71717a" },
	mutedSmall: { marginTop: 6, fontSize: 13, color: "#71717a", paddingLeft: 4 },
});
