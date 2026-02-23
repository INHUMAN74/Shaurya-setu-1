"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CaseTimeline from "@/components/CaseTimeline";

interface Case {
  id: string;
  veteranId: string | { _id: string; fullName: string; serviceNumber: string; branch: string };
  status: string;
  startDate: string;
  expectedEndDate: string;
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ stageId: "", title: "", dueDate: "" });
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [caseRes, stagesRes] = await Promise.all([
          fetch(`/api/cases/${caseId}`),
          fetch(`/api/cases/${caseId}/stages`),
        ]);
        const caseData = await caseRes.json();
        const stagesData = await stagesRes.json();
        if (caseData.success) {
          setCase(caseData.data);
        }
        if (stagesData.success) {
          setStages(stagesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (caseId) fetchData();
  }, [caseId]);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageId: newTask.stageId,
          title: newTask.title,
          dueDate: newTask.dueDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTask(false);
        setNewTask({ stageId: "", title: "", dueDate: "" });
        const stagesRes = await fetch(`/api/cases/${caseId}/stages`);
        const stagesData = await stagesRes.json();
        if (stagesData.success) {
          setStages(stagesData.data);
        }
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
      </div>
    );
  }

  if (!case_) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Case Not Found</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/counsellor/cases"
            className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            ← Back to cases
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {typeof case_.veteranId === "object" ? case_.veteranId.fullName : "Case"}
          </h1>
        </div>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">Veteran:</span>{" "}
              {typeof case_.veteranId === "object" && case_.veteranId._id ? (
                <Link
                  href={`/dashboard/counsellor/veterans/${case_.veteranId._id}`}
                  className="hover:underline"
                >
                  {case_.veteranId.fullName || "Unknown"}
                </Link>
              ) : (
                <span>{typeof case_.veteranId === "object" ? case_.veteranId.fullName || "Unknown" : "Unknown"}</span>
              )}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">Status:</span>{" "}
              <span className="capitalize">{case_.status.replace("_", " ")}</span>
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">Start Date:</span> {new Date(case_.startDate).toLocaleDateString()}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">Expected End Date:</span>{" "}
              {new Date(case_.expectedEndDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Reintegration Plan</h2>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {showAddTask ? "Cancel" : "Add Task"}
          </button>
        </div>
        {showAddTask && (
          <form onSubmit={handleAddTask} className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Stage
                </label>
                <select
                  value={newTask.stageId}
                  onChange={(e) => setNewTask({ ...newTask, stageId: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  required
                >
                  <option value="">Select stage</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.stageType === "employment"
                        ? "Employment"
                        : stage.stageType === "family"
                          ? "Family"
                          : "Wellbeing"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Add Task
              </button>
            </div>
          </form>
        )}
        <CaseTimeline caseId={caseId} />
      </div>
    </div>
  );
}
