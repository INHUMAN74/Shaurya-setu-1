"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HorizontalBarChart from "@/components/HorizontalBarChart";

interface Stats {
  users: { total: number; byRole: Record<string, number> };
  veterans: number;
  cases: { active: number; paused: number; completed: number };
  overdueTaskCount: number;
}

const ROLE_LABELS: Record<string, string> = {
  veteran: "Veterans (accounts)",
  employer: "Employers",
  counsellor: "Counsellors",
  admin: "Admins",
};

const ROLE_COLORS = ["bg-violet-500", "bg-sky-500", "bg-teal-500", "bg-orange-500"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, veteransRes, casesRes, dashRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/veterans"),
          fetch("/api/cases"),
          fetch("/api/stats"),
        ]);
        const usersData = await usersRes.json();
        const veteransData = await veteransRes.json();
        const casesData = await casesRes.json();
        const dashData = await dashRes.json();

        const byRole: Record<string, number> = {};
        if (usersData.success) {
          usersData.data.forEach((u: { role: string }) => {
            byRole[u.role] = (byRole[u.role] || 0) + 1;
          });
        }

        const active = casesData.success ? casesData.data.filter((c: { status: string }) => c.status === "active").length : 0;
        const paused = casesData.success ? casesData.data.filter((c: { status: string }) => c.status === "paused").length : 0;
        const completed = casesData.success
          ? casesData.data.filter((c: { status: string }) => c.status === "completed").length
          : 0;

        setStats({
          users: {
            total: usersData.success ? usersData.data.length : 0,
            byRole,
          },
          veterans: veteransData.success ? veteransData.data.length : 0,
          cases: { active, paused, completed },
          overdueTaskCount: dashData.success ? dashData.data.overdueTaskCount : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
      </div>
    );
  }

  const roleEntries = Object.entries(stats?.users.byRole ?? {}).sort((a, b) => b[1] - a[1]);
  const roleBarItems = roleEntries.map(([role, value], i) => ({
    label: ROLE_LABELS[role] ?? role,
    value,
    colorClass: ROLE_COLORS[i % ROLE_COLORS.length],
  }));

  const caseBarItems = [
    { label: "Active", value: stats?.cases.active ?? 0, colorClass: "bg-blue-500" },
    { label: "Paused", value: stats?.cases.paused ?? 0, colorClass: "bg-amber-500" },
    { label: "Completed", value: stats?.cases.completed ?? 0, colorClass: "bg-emerald-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Admin dashboard</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Platform usage and case health at a glance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total users</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats?.users.total || 0}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Veteran profiles</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats?.veterans || 0}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Active cases</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats?.cases.active || 0}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed cases</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stats?.cases.completed || 0}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/80 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm text-red-800 dark:text-red-300">Overdue tasks</p>
          <p className="mt-1 text-2xl font-semibold text-red-900 dark:text-red-200">{stats?.overdueTaskCount ?? 0}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <HorizontalBarChart title="Cases by status" items={caseBarItems} />
        {roleBarItems.length > 0 ? (
          <HorizontalBarChart title="Users by role" items={roleBarItems} />
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No role data yet.
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/users"
          className="block rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Users</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Manage user accounts and roles</p>
        </Link>
        <Link
          href="/dashboard/admin/verification"
          className="block rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Veteran verification</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Review and verify veteran profiles</p>
        </Link>
      </div>
    </div>
  );
}
