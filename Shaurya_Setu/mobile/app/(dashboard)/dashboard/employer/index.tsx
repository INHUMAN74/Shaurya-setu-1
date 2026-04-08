import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/contexts/auth-context";
import { useApi } from "@/hooks/use-api";

interface Task {
	id: string;
	title: string;
	status: string;
	dueDate?: string;
	stageId: {
		stageType: string;
		caseId: { veteranId: { fullName: string } };
	};
}

export default function EmployerDashboardScreen() {
	const { user } = useAuth();
	const api = useApi();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const loadTasks = useCallback(async () => {
		if (!user?.id) return;
		try {
			const res = await api(`/api/tasks?assignedTo=${user.id}`);
			const data = (await res.json()) as { success?: boolean; data?: Task[] };
			if (data.success) setTasks(data.data ?? []);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, [api, user?.id]);

	useEffect(() => {
		loadTasks();
	}, [loadTasks]);

	async function updateStatus(taskId: string, status: "in_progress" | "done") {
		setUpdatingId(taskId);
		try {
			const res = await api(`/api/tasks/${taskId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const data = (await res.json()) as { success?: boolean };
			if (data.success) await loadTasks();
		} catch (e) {
			console.error(e);
		} finally {
			setUpdatingId(null);
		}
	}

	function vetName(t: Task) {
		const v = t.stageId?.caseId?.veteranId;
		if (v && typeof v === "object" && "fullName" in v) return v.fullName;
		return "Unknown";
	}

	function stageLabel(t: Task) {
		const st = t.stageId?.stageType;
		if (st === "employment") return "Employment";
		if (st === "family") return "Family";
		if (st === "wellbeing") return "Wellbeing";
		return "";
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

	return (
		<DashboardShell title="Dashboard">
			<Text style={styles.intro}>
				Update task status when you complete employer-side actions for a veteran&apos;s reintegration plan.
			</Text>
			<Text style={styles.h2}>Tasks assigned to me</Text>
			{tasks.length === 0 ? (
				<View style={styles.card}>
					<Text style={styles.muted}>No tasks assigned to you yet.</Text>
				</View>
			) : (
				<View style={styles.gap}>
					{tasks.map((task) => (
						<View key={task.id} style={styles.card}>
							<Text style={styles.taskTitle}>{task.title}</Text>
							<Text style={styles.meta}>
								{vetName(task)} • {stageLabel(task)}
							</Text>
							{task.dueDate ? (
								<Text style={styles.due}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
							) : null}
							<View style={styles.badgeRow}>
								<Text style={styles.badgeTxt}>{task.status.replace(/_/g, " ")}</Text>
							</View>
							<View style={styles.actions}>
								{task.status === "todo" && (
									<Pressable
										style={styles.outlineBtn}
										disabled={updatingId === task.id}
										onPress={() => updateStatus(task.id, "in_progress")}
									>
										<Text style={styles.outlineTxt}>Start</Text>
									</Pressable>
								)}
								{(task.status === "todo" || task.status === "in_progress") && (
									<Pressable
										style={styles.doneBtn}
										disabled={updatingId === task.id}
										onPress={() => updateStatus(task.id, "done")}
									>
										<Text style={styles.doneTxt}>Mark done</Text>
									</Pressable>
								)}
							</View>
						</View>
					))}
				</View>
			)}
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	intro: { fontSize: 14, color: "#71717a", marginBottom: 16, lineHeight: 20 },
	h2: { fontSize: 17, fontWeight: "700", color: "#18181b", marginBottom: 12 },
	gap: { gap: 12 },
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 14,
		backgroundColor: "#fff",
	},
	taskTitle: { fontSize: 16, fontWeight: "600", color: "#18181b" },
	meta: { fontSize: 13, color: "#71717a", marginTop: 4 },
	due: { fontSize: 12, color: "#a1a1aa", marginTop: 4 },
	badgeRow: { marginTop: 8 },
	badgeTxt: {
		alignSelf: "flex-start",
		backgroundColor: "#dbeafe",
		color: "#1e40af",
		fontSize: 12,
		fontWeight: "600",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
		textTransform: "capitalize",
	},
	actions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
	outlineBtn: {
		borderWidth: 1,
		borderColor: "#d4d4d8",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
	},
	outlineTxt: { fontSize: 13, fontWeight: "600", color: "#3f3f46" },
	doneBtn: { backgroundColor: "#059669", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
	doneTxt: { fontSize: 13, fontWeight: "600", color: "#fff" },
	muted: { fontSize: 14, color: "#71717a" },
});
