"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
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

  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((c) => {
      const name =
        typeof c.veteranId === "object" ? (c.veteranId.fullName ?? "").toLowerCase() : "";
      const sn =
        typeof c.veteranId === "object" ? (c.veteranId.serviceNumber ?? "").toLowerCase() : "";
      return name.includes(q) || sn.includes(q);
    });
  }, [cases, search]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Cases</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Filter by status, then search by veteran name or service number.
      </p>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "paused", label: "Paused" },
              { id: "completed", label: "Completed" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                statusFilter === f.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search veteran name or service no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {filteredCases.map((case_) => (
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
          {filteredCases.length === 0 && (
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {cases.length === 0 ? "No cases found." : "No cases match your search."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
