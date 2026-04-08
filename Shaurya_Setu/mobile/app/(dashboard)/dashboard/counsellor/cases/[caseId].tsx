import { Link, useLocalSearchParams } from "expo-router";
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

import CaseNotesPanel from "@/components/CaseNotesPanel";
import CaseTimeline from "@/components/CaseTimeline";
import DashboardShell from "@/components/DashboardShell";
import { useApi } from "@/hooks/use-api";

interface CaseData {
	id: string;
	veteranId:
		| string
		| { _id?: string; fullName?: string; serviceNumber?: string; branch?: string };
	status: string;
	startDate: string;
	expectedEndDate: string;
}

interface StageRow {
	id: string;
	stageType: string;
	status: string;
}

interface EmployerOption {
	id: string;
	email: string;
}

const CASE_STATUSES = ["active", "paused", "completed"] as const;
const STAGE_STATUSES = ["pending", "in_progress", "completed"] as const;

export default function CounsellorCaseDetailScreen() {
	const { caseId } = useLocalSearchParams<{ caseId: string }>();
	const api = useApi();
	const [case_, setCase] = useState<CaseData | null>(null);
	const [loading, setLoading] = useState(true);
	const [showAddTask, setShowAddTask] = useState(false);
	const [newTask, setNewTask] = useState({ stageId: "", title: "", dueDate: "", assignedTo: "" });
	const [stages, setStages] = useState<StageRow[]>([]);
	const [employers, setEmployers] = useState<EmployerOption[]>([]);
	const [updatingStatus, setUpdatingStatus] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await api("/api/users");
				const data = (await res.json()) as { success?: boolean; data?: { id: string; email: string; role: string }[] };
				if (data.success && Array.isArray(data.data) && !cancelled) {
					setEmployers(
						data.data.filter((u) => u.role === "employer").map((u) => ({ id: String(u.id), email: u.email })),
					);
				}
			} catch (e) {
				console.error(e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [api]);

	useEffect(() => {
		if (!caseId) return;
		let cancelled = false;
		(async () => {
			try {
				const [caseRes, stagesRes] = await Promise.all([
					api(`/api/cases/${caseId}`),
					api(`/api/cases/${caseId}/stages`),
				]);
				const caseData = (await caseRes.json()) as { success?: boolean; data?: CaseData };
				const stagesData = (await stagesRes.json()) as { success?: boolean; data?: StageRow[] };
				if (caseData.success && caseData.data && !cancelled) setCase(caseData.data);
				if (stagesData.success && stagesData.data && !cancelled) setStages(stagesData.data);
			} catch (e) {
				console.error(e);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [api, caseId]);

	async function handleAddTask() {
		if (!caseId || !newTask.stageId.trim() || !newTask.title.trim()) return;
		try {
			const res = await api("/api/tasks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					stageId: newTask.stageId,
					title: newTask.title,
					dueDate: newTask.dueDate || undefined,
					...(newTask.assignedTo ? { assignedTo: newTask.assignedTo } : {}),
				}),
			});
			const data = (await res.json()) as { success?: boolean };
			if (data.success) {
				setShowAddTask(false);
				setNewTask({ stageId: "", title: "", dueDate: "", assignedTo: "" });
				const stagesRes = await api(`/api/cases/${caseId}/stages`);
				const stagesData = (await stagesRes.json()) as { success?: boolean; data?: StageRow[] };
				if (stagesData.success) setStages(stagesData.data ?? []);
			}
		} catch (e) {
			console.error(e);
		}
	}

	async function updateCaseStatus(status: string) {
		if (!case_ || !caseId) return;
		setUpdatingStatus(true);
		try {
			const res = await api(`/api/cases/${caseId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const data = (await res.json()) as { success?: boolean; data?: { status: string } };
			if (data.success && data.data) setCase({ ...case_, status: data.data.status });
		} finally {
			setUpdatingStatus(false);
		}
	}

	async function updateStageStatus(stageId: string, status: string) {
		if (!caseId) return;
		try {
			const res = await api(`/api/cases/${caseId}/stages/${stageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const data = (await res.json()) as { success?: boolean };
			if (data.success) {
				const stagesRes = await api(`/api/cases/${caseId}/stages`);
				const stagesData = (await stagesRes.json()) as { success?: boolean; data?: StageRow[] };
				if (stagesData.success) setStages(stagesData.data ?? []);
			}
		} catch (e) {
			console.error(e);
		}
	}

	function vetId(): string | undefined {
		const v = case_?.veteranId;
		if (v && typeof v === "object" && "_id" in v && v._id) return String(v._id);
		return undefined;
	}

	function vetName(): string {
		const v = case_?.veteranId;
		if (v && typeof v === "object" && "fullName" in v) return v.fullName ?? "Unknown";
		return "Unknown";
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

	if (!case_) {
		return (
			<DashboardShell title="Case">
				<Text style={styles.h1}>Case not found</Text>
			</DashboardShell>
		);
	}

	const vid = vetId();

	return (
		<DashboardShell title={vetName()}>
			<Link href="/dashboard/counsellor/cases" asChild>
				<Pressable>
					<Text style={styles.back}>← Back to cases</Text>
				</Pressable>
			</Link>
			<View style={styles.card}>
				<Text style={styles.label}>Veteran</Text>
				{vid ? (
					<Link href={`/dashboard/counsellor/veterans/${vid}` as const} asChild>
						<Pressable>
							<Text style={styles.linkName}>{vetName()}</Text>
						</Pressable>
					</Link>
				) : (
					<Text style={styles.value}>{vetName()}</Text>
				)}
				<Text style={[styles.label, { marginTop: 12 }]}>Case status</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
					{CASE_STATUSES.map((s) => (
						<Pressable
							key={s}
							style={[styles.chip, case_.status === s && styles.chipOn]}
							disabled={updatingStatus}
							onPress={() => updateCaseStatus(s)}
						>
							<Text style={[styles.chipTxt, case_.status === s && styles.chipTxtOn]}>{s}</Text>
						</Pressable>
					))}
				</ScrollView>
				<Text style={styles.meta}>
					Start: {new Date(case_.startDate).toLocaleDateString()} • Expected end:{" "}
					{new Date(case_.expectedEndDate).toLocaleDateString()}
				</Text>
			</View>

			<Text style={styles.h2}>Stage status</Text>
			<View style={styles.stageGrid}>
				{stages.map((stage) => (
					<View key={stage.id} style={styles.stageBox}>
						<Text style={styles.stageType}>{stage.stageType}</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{STAGE_STATUSES.map((s) => (
								<Pressable
									key={s}
									style={[styles.miniChip, stage.status === s && styles.miniChipOn]}
									onPress={() => updateStageStatus(stage.id, s)}
								>
									<Text style={styles.miniChipTxt}>{s.replace(/_/g, " ")}</Text>
								</Pressable>
							))}
						</ScrollView>
					</View>
				))}
			</View>

			<View style={styles.rowBetween}>
				<Text style={styles.h2}>Reintegration plan</Text>
				<Pressable onPress={() => setShowAddTask(!showAddTask)}>
					<Text style={styles.toggle}>{showAddTask ? "Cancel" : "Add task"}</Text>
				</Pressable>
			</View>
			{showAddTask && (
				<View style={styles.card}>
					<Text style={styles.label}>Stage</Text>
					<ScrollView horizontal style={styles.chipRow}>
						{stages.map((st) => (
							<Pressable
								key={st.id}
								style={[styles.chip, newTask.stageId === st.id && styles.chipOn]}
								onPress={() => setNewTask((n) => ({ ...n, stageId: st.id }))}
							>
								<Text style={[styles.chipTxt, newTask.stageId === st.id && styles.chipTxtOn]}>
									{st.stageType}
								</Text>
							</Pressable>
						))}
					</ScrollView>
					<Text style={styles.label}>Title</Text>
					<TextInput
						style={styles.input}
						value={newTask.title}
						onChangeText={(t) => setNewTask((n) => ({ ...n, title: t }))}
						placeholder="Task title"
                        placeholderTextColor="#a1a1aa"
					/>
					<Text style={styles.label}>Due date (optional, YYYY-MM-DD)</Text>
					<TextInput
						style={styles.input}
						value={newTask.dueDate}
						onChangeText={(t) => setNewTask((n) => ({ ...n, dueDate: t }))}
						placeholder="2026-04-07"
                        placeholderTextColor="#a1a1aa"
					/>
					<Text style={styles.label}>Assign to employer (optional)</Text>
					<ScrollView horizontal style={styles.chipRow}>
						<Pressable
							style={[styles.chip, newTask.assignedTo === "" && styles.chipOn]}
							onPress={() => setNewTask((n) => ({ ...n, assignedTo: "" }))}
						>
							<Text style={[styles.chipTxt, newTask.assignedTo === "" && styles.chipTxtOn]}>None</Text>
						</Pressable>
						{employers.map((e) => (
							<Pressable
								key={e.id}
								style={[styles.chip, newTask.assignedTo === e.id && styles.chipOn]}
								onPress={() => setNewTask((n) => ({ ...n, assignedTo: e.id }))}
							>
								<Text style={[styles.chipTxt, newTask.assignedTo === e.id && styles.chipTxtOn]}>
									{e.email}
								</Text>
							</Pressable>
						))}
					</ScrollView>
					<Pressable style={styles.primaryBtn} onPress={handleAddTask}>
						<Text style={styles.primaryBtnTxt}>Add task</Text>
					</Pressable>
				</View>
			)}
			{caseId ? <CaseTimeline caseId={caseId} /> : null}
			{caseId ? <CaseNotesPanel caseId={caseId} canAdd /> : null}
		</DashboardShell>
	);
}

const styles = StyleSheet.create({
	center: { padding: 48, alignItems: "center" },
	h1: { fontSize: 20, fontWeight: "700" },
	back: { fontSize: 14, fontWeight: "600", color: "#0a7ea4", marginBottom: 8 },
	card: {
		borderWidth: 1,
		borderColor: "#e4e4e7",
		borderRadius: 12,
		padding: 14,
		backgroundColor: "#fff",
		marginBottom: 16,
	},
	label: { fontSize: 12, fontWeight: "600", color: "#52525b", marginBottom: 4 },
	value: { fontSize: 15, color: "#18181b" },
	linkName: { fontSize: 16, fontWeight: "600", color: "#0a7ea4" },
	chipRow: { marginBottom: 8, maxHeight: 44 },
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		marginRight: 8,
		backgroundColor: "#fff",
	},
	chipOn: { backgroundColor: "#18181b", borderColor: "#18181b" },
	chipTxt: { fontSize: 13, color: "#3f3f46", textTransform: "capitalize" },
	chipTxtOn: { color: "#fff", fontWeight: "700" },
	meta: { fontSize: 13, color: "#71717a", marginTop: 8 },
	h2: { fontSize: 17, fontWeight: "700", color: "#18181b", marginBottom: 8 },
	stageGrid: { gap: 10, marginBottom: 16 },
	stageBox: {
		borderWidth: 1,
		borderColor: "#f4f4f5",
		borderRadius: 8,
		padding: 10,
		backgroundColor: "#fafafa",
	},
	stageType: { fontSize: 11, fontWeight: "700", color: "#71717a", textTransform: "uppercase", marginBottom: 6 },
	miniChip: {
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		marginRight: 6,
		backgroundColor: "#fff",
	},
	miniChipOn: { backgroundColor: "#dbeafe", borderColor: "#93c5fd" },
	miniChipTxt: { fontSize: 11, textTransform: "capitalize", color: "#1e3a8a" },
	rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
	toggle: { fontSize: 14, fontWeight: "600", color: "#18181b" },
	input: {
		borderWidth: 1,
		borderColor: "#d4d4d8",
		borderRadius: 8,
		padding: 10,
		fontSize: 15,
		marginBottom: 10,
		backgroundColor: "#fff",
		color: "#18181b",
	},
	primaryBtn: {
		backgroundColor: "#18181b",
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	primaryBtnTxt: { color: "#fff", fontWeight: "600" },
});
