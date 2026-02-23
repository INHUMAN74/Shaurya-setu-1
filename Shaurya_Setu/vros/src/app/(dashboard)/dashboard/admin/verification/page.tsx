"use client";

import { useEffect, useState } from "react";

interface Veteran {
  id: string;
  fullName: string;
  serviceNumber: string;
  branch: string;
  verified: boolean;
}

export default function AdminVerificationPage() {
  const [veterans, setVeterans] = useState<Veteran[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVeterans() {
      try {
        const res = await fetch("/api/veterans?verified=false");
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
  }, []);

  async function handleVerify(veteranId: string) {
    setVerifying(veteranId);
    try {
      const res = await fetch(`/api/veterans/${veteranId}/verify`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        setVeterans(veterans.filter((v) => v.id !== veteranId));
      }
    } catch (error) {
      console.error("Error verifying veteran:", error);
    } finally {
      setVerifying(null);
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
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Veteran Verification</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Review and verify veteran profiles pending verification.
      </p>
      {veterans.length === 0 ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">No veterans pending verification.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {veterans.map((veteran) => (
            <div
              key={veteran.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{veteran.fullName}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Service Number: {veteran.serviceNumber} • Branch: {veteran.branch}
                  </p>
                </div>
                <button
                  onClick={() => handleVerify(veteran.id)}
                  disabled={verifying === veteran.id}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {verifying === veteran.id ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
