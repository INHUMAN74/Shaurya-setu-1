"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Veteran {
  id: string;
  fullName: string;
  serviceNumber: string;
  branch: string;
  yearsOfService: number;
  dischargeType: string;
  verified: boolean;
  hasCase: boolean;
  caseId?: string;
}

export default function VeteranProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const veteranId = params.veteranId as string;
  const [veteran, setVeteran] = useState<Veteran | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingCase, setCreatingCase] = useState(false);

  useEffect(() => {
    async function fetchVeteran() {
      try {
        const res = await fetch(`/api/veterans/${veteranId}`);
        const data = await res.json();
        if (data.success) {
          setVeteran(data.data);
        }
      } catch (error) {
        console.error("Error fetching veteran:", error);
      } finally {
        setLoading(false);
      }
    }
    if (veteranId) fetchVeteran();
  }, [veteranId]);

  async function handleCreateCase() {
    if (!veteran) return;
    setCreatingCase(true);
    try {
      const startDate = new Date();
      const expectedEndDate = new Date();
      expectedEndDate.setMonth(expectedEndDate.getMonth() + 6);
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          veteranId: veteran.id,
          startDate: startDate.toISOString(),
          expectedEndDate: expectedEndDate.toISOString(),
          status: "active",
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/counsellor/cases/${data.data.id}`);
      }
    } catch (error) {
      console.error("Error creating case:", error);
    } finally {
      setCreatingCase(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
      </div>
    );
  }

  if (!veteran) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Veteran Not Found</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/counsellor/veterans"
          className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
        >
          ← Back to veterans
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{veteran.fullName}</h1>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{veteran.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Service Number</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{veteran.serviceNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{veteran.branch}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Years of Service</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{veteran.yearsOfService}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Discharge Type</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{veteran.dischargeType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Verification Status</label>
            <div className="mt-1">
              {veteran.verified ? (
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Verified
                </span>
              ) : (
                <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Pending Verification
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6">
          {veteran.hasCase && veteran.caseId ? (
            <Link
              href={`/dashboard/counsellor/cases/${veteran.caseId}`}
              className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              View Case →
            </Link>
          ) : (
            <button
              onClick={handleCreateCase}
              disabled={creatingCase}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {creatingCase ? "Creating..." : "Create Reintegration Case"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
