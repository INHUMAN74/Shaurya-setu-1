"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CaseTimeline from "@/components/CaseTimeline";
import CaseNotesPanel from "@/components/CaseNotesPanel";

interface Case {
  id: string;
  veteranId: string | { _id: string; fullName: string; serviceNumber: string; branch: string };
  status: string;
  startDate: string;
  expectedEndDate: string;
}

interface EmployerOption {
  id: string;
  email: string;
}

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ stageId: "", title: "", dueDate: "", assignedTo: "" });
  const [stages, setStages] = useState<any[]>([]);
  const [employers, setEmployers] = useState<EmployerOption[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchEmployers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setEmployers(
            data.data
              .filter((u: { role: string }) => u.role === "employer")
              .map((u: { id: string; email: string }) => ({ id: u.id, email: u.email }))
          );
        }
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    }
    fetchEmployers();
  }, []);

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
          ...(newTask.assignedTo ? { assignedTo: newTask.assignedTo } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTask(false);
        setNewTask({ stageId: "", title: "", dueDate: "", assignedTo: "" });
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

  async function updateCaseStatus(status: string) {
    if (!case_) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setCase({ ...case_, status: data.data.status });
      }
    } catch (e) {
      console.error("Error updating case status:", e);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function updateStageStatus(stageId: string, status: string) {
    try {
      const res = await fetch(`/api/cases/${caseId}/stages/${stageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        const stagesRes = await fetch(`/api/cases/${caseId}/stages`);
        const stagesData = await stagesRes.json();
        if (stagesData.success) {
          setStages(stagesData.data);
        }
      }
    } catch (e) {
      console.error("Error updating stage status:", e);
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
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">Status:</span>{" "}
              <select
                value={case_.status}
                disabled={updatingStatus}
                onChange={(e) => updateCaseStatus(e.target.value)}
                className="rounded border border-zinc-300 bg-white px-2 py-0.5 text-xs font-medium capitalize text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
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

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Stage Status Control</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {stages.map((stage) => (
            <div key={stage.id} className="rounded-md border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {stage.stageType}
              </p>
              <select
                value={stage.status}
                onChange={(e) => updateStageStatus(stage.id, e.target.value)}
                className="mt-2 w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs font-medium capitalize text-zinc-800 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
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
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Assign to employer (optional)
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">Unassigned</option>
                  {employers.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.email}
                    </option>
                  ))}
                </select>
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
      <CaseNotesPanel caseId={caseId} />
    </div>
  );
}
