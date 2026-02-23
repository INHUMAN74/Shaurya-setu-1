"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface VeteranProfile {
  id: string;
  fullName: string;
  serviceNumber: string;
  branch: string;
  yearsOfService: number;
  dischargeType: string;
  verified: boolean;
}

export default function VeteranProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<VeteranProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    serviceNumber: "",
    branch: "",
    yearsOfService: "",
    dischargeType: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/veterans?userId=${session.user.id}`);
        const data = await res.json();
        if (data.success && data.data?.[0]) {
          setProfile(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/veterans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          serviceNumber: formData.serviceNumber,
          branch: formData.branch,
          yearsOfService: Number(formData.yearsOfService),
          dischargeType: formData.dischargeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create profile");
        return;
      }
      if (data.success) {
        setProfile(data.data);
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Create My Profile</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Complete your veteran profile to get started with reintegration support.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="serviceNumber" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Service Number *
              </label>
              <input
                id="serviceNumber"
                type="text"
                value={formData.serviceNumber}
                onChange={(e) => setFormData({ ...formData, serviceNumber: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="12345678"
              />
            </div>
            <div>
              <label htmlFor="branch" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Branch *
              </label>
              <input
                id="branch"
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Army, Navy, Air Force, etc."
              />
            </div>
            <div>
              <label htmlFor="yearsOfService" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Years of Service *
              </label>
              <input
                id="yearsOfService"
                type="number"
                min="0"
                step="1"
                value={formData.yearsOfService}
                onChange={(e) => setFormData({ ...formData, yearsOfService: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="5"
              />
            </div>
            <div>
              <label htmlFor="dischargeType" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Discharge Type *
              </label>
              <select
                id="dischargeType"
                value={formData.dischargeType}
                onChange={(e) => setFormData({ ...formData, dischargeType: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Select discharge type</option>
                <option value="Honorable">Honorable</option>
                <option value="General">General</option>
                <option value="Other Than Honorable">Other Than Honorable</option>
                <option value="Bad Conduct">Bad Conduct</option>
                <option value="Dishonorable">Dishonorable</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {creating ? "Creating profile..." : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">My Profile</h1>
      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{profile.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Service Number</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{profile.serviceNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{profile.branch}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Years of Service</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{profile.yearsOfService}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Discharge Type</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{profile.dischargeType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Verification Status</label>
            <div className="mt-1">
              {profile.verified ? (
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
      </div>
    </div>
  );
}
