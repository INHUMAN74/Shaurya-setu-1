"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface VeteranProfile {
  id: string;
  fullName: string;
  serviceNumber: string;
  branch: string;
  verified: boolean;
}

interface Case {
  id: string;
  status: string;
  startDate: string;
  expectedEndDate: string;
}

export default function VeteranDashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<VeteranProfile | null>(null);
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      try {
        const profileRes = await fetch(`/api/veterans?userId=${session.user.id}`);
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data?.[0]) {
          const myProfile = profileData.data[0];
          setProfile(myProfile);
          const casesRes = await fetch(`/api/cases?veteranId=${myProfile.id}`);
          const casesData = await casesRes.json();
          if (casesData.success && casesData.data?.[0]) {
            setCase(casesData.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

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
      {profile ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">My Profile</h2>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Name:</span> {profile.fullName}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Service Number:</span> {profile.serviceNumber}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Branch:</span> {profile.branch}
              </p>
              {profile.verified && (
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Verified
                </span>
              )}
            </div>
            <Link
              href="/dashboard/veteran/profile"
              className="mt-4 inline-block text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
            >
              View full profile →
            </Link>
          </div>
          {case_ ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">My Reintegration Case</h2>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize">{case_.status.replace("_", " ")}</span>
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Start Date:</span> {new Date(case_.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Expected End Date:</span>{" "}
                  {new Date(case_.expectedEndDate).toLocaleDateString()}
                </p>
              </div>
              <Link
                href="/dashboard/veteran/plan"
                className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                View my reintegration plan →
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                You don't have an active reintegration case yet. A counsellor will set up your plan soon.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            Please complete your veteran profile to get started.
          </p>
          <Link
            href="/dashboard/veteran/profile"
            className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create profile →
          </Link>
        </div>
      )}
    </div>
  );
}
