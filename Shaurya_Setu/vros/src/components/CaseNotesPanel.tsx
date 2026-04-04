"use client";

import { useCallback, useEffect, useState } from "react";

interface NoteAuthor {
  email?: string;
  role?: string;
}

interface CaseNoteRow {
  id: string;
  body: string;
  createdAt: string;
  author: NoteAuthor | string;
}

interface CaseNotesPanelProps {
  caseId: string;
  /** When false, only list notes (e.g. veteran read-only). */
  canAdd?: boolean;
}

function authorLabel(author: CaseNoteRow["author"]): string {
  if (author && typeof author === "object" && "email" in author && author.email) {
    return author.email;
  }
  return "Team member";
}

export default function CaseNotesPanel({ caseId, canAdd = true }: CaseNotesPanelProps) {
  const [notes, setNotes] = useState<CaseNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/notes`);
      const data = await res.json();
      if (data.success) {
        setNotes(data.data || []);
      }
    } catch (e) {
      console.error("Failed to load notes", e);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (data.success) {
        setBody("");
        await load();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Case notes & activity</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {canAdd
          ? "Short log for your team (e.g. calls, follow-ups). The veteran can read these on their plan."
          : "Updates from your counsellor and support team."}
      </p>

      {canAdd && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label htmlFor="case-note" className="sr-only">
            New note
          </label>
          <textarea
            id="case-note"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. Called veteran regarding job interview — scheduled for Tuesday."
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={saving || !body.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Saving…" : "Add note"}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/40"
              >
                <p className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">{n.body}</p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {authorLabel(n.author)} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
