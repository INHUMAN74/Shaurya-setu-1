"use client";

import { useEffect, useState } from "react";

type StageStatus = "pending" | "in_progress" | "completed";
type StageType = "employment" | "family" | "wellbeing";
type TaskStatus = "todo" | "in_progress" | "done";

interface Task {
  id: string;
  stageId: string;
  title: string;
  assignedTo?: string;
  dueDate?: string;
  status: TaskStatus;
  createdAt: string;
}

interface Stage {
  id: string;
  caseId: string;
  stageType: StageType;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  tasks: Task[];
}

interface CaseTimelineProps {
  caseId: string;
}

const STATUS_BADGE_STYLES: Record<StageStatus | TaskStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
};

const STAGE_LABELS: Record<StageType, string> = {
  employment: "Employment",
  family: "Family",
  wellbeing: "Wellbeing",
};

function formatStatus(status: string): string {
  return status.replace("_", " ");
}

export default function CaseTimeline({ caseId }: CaseTimelineProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cases/${caseId}/stages`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? "Failed to fetch stages");
        }
        setStages(json.data ?? []);
        if (json.data?.length > 0 && !expandedStageId) {
          setExpandedStageId(json.data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStages();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
        No stages found for this case.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px -translate-x-1/2 bg-slate-200 dark:bg-slate-700"
          aria-hidden
        />

        <ul className="space-y-0">
          {stages.map((stage, index) => {
            const isExpanded = expandedStageId === stage.id;
            const hasTasks = stage.tasks.length > 0;

            return (
              <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    stage.status === "completed"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : stage.status === "in_progress"
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                  }`}
                >
                  {stage.status === "completed" ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {STAGE_LABELS[stage.stageType]}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE_STYLES[stage.status]}`}
                    >
                      {formatStatus(stage.status)}
                    </span>
                    {hasTasks && (
                      <svg
                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Expanded tasks */}
                  {isExpanded && hasTasks && (
                    <ul className="mt-2 space-y-2 pl-2">
                      {stage.tasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50"
                        >
                          <span className="text-sm text-slate-700 dark:text-slate-300">{task.title}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE_STYLES[task.status]}`}
                          >
                            {formatStatus(task.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {isExpanded && !hasTasks && (
                    <p className="mt-2 pl-2 text-sm text-slate-500 dark:text-slate-400">No tasks yet.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
