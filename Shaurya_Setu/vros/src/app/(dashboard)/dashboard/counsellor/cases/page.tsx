"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Case {
  id: string;
  veteranId: { fullName: string; serviceNumber: string };
  status: string;
  startDate: string;
  expectedEndDate: string;
}

export default function CounsellorCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const url = statusFilter !== "all" ? `/api/cases?status=${statusFilter}` : "/api/cases";
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setCases(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Cases</h1>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === "active"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("paused")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === "paused"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          Paused
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === "completed"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          Completed
        </button>
      </div>
      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {cases.map((case_) => (
            <Link
              key={case_.id}
              href={`/dashboard/counsellor/cases/${case_.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {typeof case_.veteranId === "object" ? case_.veteranId.fullName : "Unknown"}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Started: {new Date(case_.startDate).toLocaleDateString()} • Expected:{" "}
                    {new Date(case_.expectedEndDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {case_.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
          {cases.length === 0 && (
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">No cases found.</p>
          )}
        </div>
      )}
    </div>
  );
}
