"use client";

import { useEffect, useState } from "react";

interface Veteran {
  id: string;
  fullName: string;
  serviceNumber: string;
  branch: string;
  verified: boolean;
  verificationDocumentName?: string;
}

export default function AdminVerificationPage() {
  const [veterans, setVeterans] = useState<Veteran[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);

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

  async function handleMockIntakeDoc(veteranId: string, file: File | undefined) {
    if (!file) return;
    setRecordingId(veteranId);
    try {
      const res = await fetch(`/api/veterans/${veteranId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationDocumentName: `Admin intake: ${file.name}` }),
      });
      const data = await res.json();
      if (data.success) {
        setVeterans((prev) =>
          prev.map((v) => (v.id === veteranId ? { ...v, verificationDocumentName: `Admin intake: ${file.name}` } : v))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecordingId(null);
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{veteran.fullName}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Service Number: {veteran.serviceNumber} • Branch: {veteran.branch}
                  </p>
                  {veteran.verificationDocumentName ? (
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Document record: {veteran.verificationDocumentName}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">No document on file (demo).</p>
                  )}
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm">
                    <span className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                      {recordingId === veteran.id ? "Recording…" : "Mock: attach review copy"}
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      disabled={recordingId !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        handleMockIntakeDoc(veteran.id, f);
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => handleVerify(veteran.id)}
                  disabled={verifying === veteran.id}
                  className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
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
