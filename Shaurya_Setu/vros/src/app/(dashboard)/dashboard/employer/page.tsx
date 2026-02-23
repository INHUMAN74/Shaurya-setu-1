"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function fetchTasks() {
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
    }
    fetchTasks();
  }, [session]);

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
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tasks Assigned to Me</h2>
        {tasks.length === 0 ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div>
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
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
