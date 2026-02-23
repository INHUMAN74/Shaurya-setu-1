"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CaseTimeline from "@/components/CaseTimeline";

export default function VeteranPlanPage() {
  const { data: session } = useSession();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<{ status: string; startDate: string; expectedEndDate: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCase() {
      if (!session?.user?.id) return;
      try {
        const profileRes = await fetch(`/api/veterans?userId=${session.user.id}`);
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data?.[0]) {
          const veteranId = profileData.data[0].id;
          const casesRes = await fetch(`/api/cases?veteranId=${veteranId}`);
          const casesData = await casesRes.json();
          if (casesData.success && casesData.data?.[0]) {
            setCaseId(casesData.data[0].id);
            setCaseData(casesData.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching case:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
      </div>
    );
  }

  if (!caseId) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">My Reintegration Plan</h1>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            You don't have an active reintegration case yet. A counsellor will set up your plan soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">My Reintegration Plan</h1>
      {caseData && (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{caseData.status.replace("_", " ")}</span>
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Start Date:</span> {new Date(caseData.startDate).toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Expected End Date:</span>{" "}
                {new Date(caseData.expectedEndDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6">
        <CaseTimeline caseId={caseId} />
      </div>
    </div>
  );
}
