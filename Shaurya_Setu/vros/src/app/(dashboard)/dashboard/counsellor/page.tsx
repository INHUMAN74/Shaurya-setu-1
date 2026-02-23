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

export default function CounsellorDashboardPage() {
  const [stats, setStats] = useState({ active: 0, paused: 0, completed: 0 });
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/cases");
        const data = await res.json();
        if (data.success) {
          setCases(data.data || []);
          const active = data.data.filter((c: Case) => c.status === "active").length;
          const paused = data.data.filter((c: Case) => c.status === "paused").length;
          const completed = data.data.filter((c: Case) => c.status === "completed").length;
          setStats({ active, paused, completed });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Cases</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Paused Cases</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.paused}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed Cases</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.completed}</p>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Cases</h2>
          <Link
            href="/dashboard/counsellor/cases"
            className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {cases.slice(0, 5).map((case_) => (
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
                    {typeof case_.veteranId === "object" ? case_.veteranId.serviceNumber : ""}
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {case_.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
          {cases.length === 0 && (
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">No cases yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
