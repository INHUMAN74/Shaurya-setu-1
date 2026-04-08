import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import { useApi } from "@/hooks/use-api";

type NoteAuthor = { email?: string; role?: string };

type CaseNoteRow = {
	id: string;
	body: string;
	createdAt: string;
	author: NoteAuthor | string;
};

function authorLabel(author: CaseNoteRow["author"]): string {
	if (author && typeof author === "object" && "email" in author && author.email) {
		return author.email;
	}
	return "Team member";
}

export default function CaseNotesPanel({
	caseId,
	canAdd = true,
}: {
	caseId: string;
	canAdd?: boolean;
}) {
	const api = useApi();
	const [notes, setNotes] = useState<CaseNoteRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [body, setBody] = useState("");
	const [saving, setSaving] = useState(false);

	const load = useCallback(async () => {
		try {
			const res = await api(`/api/cases/${caseId}/notes`);
			const data = (await res.json()) as { success?: boolean; data?: CaseNoteRow[] };
			if (data.success) setNotes(data.data ?? []);
		} catch {
			/* ignore */
		} finally {
			setLoading(false);
		}
	}, [api, caseId]);

	useEffect(() => {
		setLoading(true);
		load();
	}, [load]);

	async function handleAdd() {
		const text = body.trim();
		if (!text) return;
		setSaving(true);
		try {
			const res = await api(`/api/cases/${caseId}/notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ body: text }),
			});
			const data = (await res.json()) as { success?: boolean };
			if (data.success) {
				setBody("");
				setLoading(true);
				await load();
			}
		} finally {
			setSaving(false);
		}
	}

	return (
		<View style={styles.card}>
			<Text style={styles.h2}>Case notes & activity</Text>
			<Text style={styles.sub}>
				{canAdd
					? "Short log for your team. The veteran can read these on their plan."
					: "Updates from your counsellor and support team."}
			</Text>

			{canAdd && (
				<View style={styles.form}>
					<TextInput
						style={styles.input}
						multiline
						numberOfLines={3}
						value={body}
						onChangeText={setBody}
						placeholder="e.g. Called veteran regarding interview…"
						placeholderTextColor="#a1a1aa"
					/>
					<Pressable
						style={[styles.btn, (!body.trim() || saving) && styles.btnDisabled]}
						onPress={handleAdd}
						disabled={!body.trim() || saving}
					>
						<Text style={styles.btnText}>{saving ? "Saving…" : "Add note"}</Text>
					</Pressable>
				</View>
			)}

			{loading ? (
				<ActivityIndicator style={{ marginTop: 12 }} />
			) : notes.length === 0 ? (
				<Text style={styles.muted}>No notes yet.</Text>
			) : (
				<View style={styles.list}>
					{notes.map((n) => (
						<View key={n.id} style={styles.note}>
							<Text style={styles.noteBody}>{n.body}</Text>
							<Text style={styles.noteMeta}>
								{authorLabel(n.author)} · {new Date(n.createdAt).toLocaleString()}
							</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		marginTop: 16,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e4e4e7",
		backgroundColor: "#fff",
	},
	h2: { fontSize: 17, fontWeight: "700", color: "#18181b" },
	sub: { marginTop: 4, fontSize: 13, color: "#71717a", lineHeight: 18 },
	form: { marginTop: 12, gap: 8 },
	input: {
		borderWidth: 1,
		borderColor: "#d4d4d8",
		borderRadius: 8,
		padding: 10,
		fontSize: 14,
		color: "#18181b",
		minHeight: 72,
		textAlignVertical: "top",
	},
	btn: {
		alignSelf: "flex-start",
		backgroundColor: "#18181b",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
	},
	btnDisabled: { opacity: 0.5 },
	btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
	muted: { marginTop: 8, fontSize: 13, color: "#71717a" },
	list: { marginTop: 12, gap: 10 },
	note: {
		padding: 12,
		borderRadius: 8,
		backgroundColor: "#fafafa",
		borderWidth: 1,
		borderColor: "#f4f4f5",
	},
	noteBody: { fontSize: 14, color: "#18181b" },
	noteMeta: { marginTop: 8, fontSize: 11, color: "#71717a" },
});
