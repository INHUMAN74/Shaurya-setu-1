"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Veteran {
  id: string;
  fullName: string;
  serviceNumber: string;
  branch: string;
  verified: boolean;
  userId: { email: string };
}

export default function CounsellorVeteransPage() {
  const [veterans, setVeterans] = useState<Veteran[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVeterans() {
      try {
        const url = search ? `/api/veterans?search=${encodeURIComponent(search)}` : "/api/veterans";
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setVeterans(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching veterans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVeterans();
  }, [search]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Veterans</h1>
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search by name or service number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>
      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Service Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">Verified</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {veterans.map((veteran) => (
                <tr key={veteran.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">{veteran.fullName}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{veteran.serviceNumber}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{veteran.branch}</td>
                  <td className="px-4 py-3">
                    {veteran.verified ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/counsellor/veterans/${veteran.id}`}
                      className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {veterans.length === 0 && (
            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">No veterans found.</p>
          )}
        </div>
      )}
    </div>
  );
}
