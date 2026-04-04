"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  stageId: { stageType: string; caseId: { veteranId: { fullName: string } } };
}

export default function EmployerDashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/tasks?assignedTo=${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function updateStatus(taskId: string, status: "in_progress" | "done") {
    setUpdatingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        await loadTasks();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Update task status when you complete employer-side actions for a veteran&apos;s reintegration plan.
      </p>
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tasks assigned to me</h2>
        {tasks.length === 0 ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{task.title}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {typeof task.stageId === "object" &&
                      typeof task.stageId.caseId === "object" &&
                      typeof task.stageId.caseId.veteranId === "object"
                        ? task.stageId.caseId.veteranId.fullName
                        : "Unknown"}
                      {" • "}
                      {typeof task.stageId === "object"
                        ? task.stageId.stageType === "employment"
                          ? "Employment"
                          : task.stageId.stageType === "family"
                            ? "Family"
                            : "Wellbeing"
                        : ""}
                    </p>
                    {task.dueDate && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {task.status.replace("_", " ")}
                    </span>
                    {task.status === "todo" && (
                      <button
                        type="button"
                        disabled={updatingId === task.id}
                        onClick={() => updateStatus(task.id, "in_progress")}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        Start
                      </button>
                    )}
                    {(task.status === "todo" || task.status === "in_progress") && (
                      <button
                        type="button"
                        disabled={updatingId === task.id}
                        onClick={() => updateStatus(task.id, "done")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Mark done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
