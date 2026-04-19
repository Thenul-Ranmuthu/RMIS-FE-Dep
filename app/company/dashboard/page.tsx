"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AddQuotaModal from "@/components/AddQuotaModal";
// import { getQuotas } from "@/services/quotaService";
// import type { QuotaRequest, QuotaSummary } from "@/services/quotaService";

import { getQuotas, getQuotaDetails } from "@/services/quotaService";
import type { CompanyQuotaRequest, QuotaSummary } from "@/services/quotaService";
//fix
// ─── Status badge helper ───────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const map: Record<string, { bg: string; text: string; dot: string }> = {
    APPROVED: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    PENDING: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    REJECTED: {
      bg: "bg-red-100",
      text: "text-red-600",
      dot: "bg-red-500",
    },
  };

  const style = map[status.toUpperCase()] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Quota stat card ───────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  accent: "emerald" | "purple";
  loading: boolean;
}) {
  const colors = {
    emerald: {
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-600",
      bar: "bg-emerald-500",
    },
    purple: {
      icon: "bg-purple-100 text-purple-600",
      value: "text-purple-600",
      bar: "bg-purple-500",
    },
  };
  const c = colors[accent];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex items-center gap-5">
      <div className={`rounded-xl p-4 ${c.icon} flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        {loading ? (
          <div className="h-9 w-28 bg-gray-200 animate-pulse rounded-lg" />
        ) : (
          <p className={`text-4xl font-black ${c.value} leading-none`}>
            {value !== null ? (
              value.toLocaleString()
            ) : (
              <span className="text-gray-300 text-2xl font-semibold">
                Not set
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function CompanyDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<{
    email: string;
    role: string;
    status?: string;
  } | null>(null);

  const [summary, setSummary] = useState<QuotaSummary>({
    currentAvailableQuota: null,
    remainingYearlyQuota: null,
  });
  const [requests, setRequests] = useState<CompanyQuotaRequest[]>([]);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [quotaError, setQuotaError] = useState<string>("");

  const [showModal, setShowModal] = useState(false);

  // ── Auth guard & initial load ───────────────────────────────

  useEffect(() => {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const token =
      localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    if (!raw || !token) {
      router.push("/");
      return;
    }

    let parsed: { email: string; role: string; status?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      router.push("/");
      return;
    }

    // Block PENDING / INACTIVE companies
    if (parsed.status && parsed.status.toUpperCase() !== "ACTIVE") {
      router.push("/company/pending");
      return;
    }

    setUser(parsed);
    fetchQuotas(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch quotas ────────────────────────────────────────────

  const fetchQuotas = useCallback(async (token: string) => {
    setQuotaLoading(true);
    setQuotaError("");
    try {
      const data = await getQuotas(token);
      // setSummary(data.summary);
      try {
        const details = await getQuotaDetails(token);
        setSummary({
          currentAvailableQuota: details.quota,
          remainingYearlyQuota: details.remainingQuota,
        });
      } catch {
        setSummary({ currentAvailableQuota: null, remainingYearlyQuota: null });
      }
      setRequests(data.requests);
    } catch (err: unknown) {
      const status = (err as Error & { status?: number }).status;
      if (status === 500) {
        setQuotaError(
          "Server error while loading quota history. Your quota data is temporarily unavailable — please try refreshing the page.",
        );
      } else {
        setQuotaError(
          err instanceof Error ? err.message : "Failed to load quota history.",
        );
      }
    } finally {
      setQuotaLoading(false);
    }
  }, []);

  // ── Sign out ─────────────────────────────────────────────────

  const handleSignOut = () => {
    ["accessToken", "user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    router.push("/");
  };

  // ── After quota added ────────────────────────────────────────

  const handleQuotaAdded = () => {
    setShowModal(false);
    const token =
      localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) fetchQuotas(token);
  };

  // ── Format date ──────────────────────────────────────────────

  const formatDate = (val?: string) => {
    if (!val) return "—";
    try {
      return new Date(val).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 -z-0" />

      {/* Page content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ── Top nav bar ─────────────────────────────────────── */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-base leading-none">
                  RMIS
                </p>
                <p className="text-white/60 text-xs mt-0.5">Company Portal</p>
              </div>
            </div>

            {/* User + sign out */}
            <div className="flex items-center gap-4">
              {/* Service booking nav links */}
              <button
                onClick={() => router.push("/public/directory")}
                className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Book Service
              </button>
              <button
                onClick={() => router.push("/company/bookings")}
                className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                My Bookings
              </button>

              {user && (
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.email?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>

                  <div>
                    <p className="text-white text-xs font-semibold leading-none">
                      {user?.email}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-emerald-500/30 rounded text-emerald-300 text-[10px] font-bold uppercase tracking-wide">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Page body ────────────────────────────────────────── */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          {/* Page title */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Quota Management</h1>
            <p className="text-white/60 text-sm mt-1">
              View your quota limits and submit new quota requests.
            </p>
          </div>

          {/* ── Stat cards ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <StatCard
              // label="Current Available Quota"
              label="Assigned Quota"
              value={summary.currentAvailableQuota}
              accent="emerald"
              loading={quotaLoading}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              }
            />
            <StatCard
              // label="Remaining Yearly Quota"
              label="Remaining Quota"
              value={summary.remainingYearlyQuota}
              accent="purple"
              loading={quotaLoading}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          </div>

          {/* ── Quota requests section ──────────────────────────── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Quota Requests
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  History of all your quota requests
                </p>
              </div>

              {/* Add button — always visible regardless of quota load error */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Quota Request
              </button>
            </div>

            {/* ── Inline error (soft — doesn't block the button) ── */}
            {quotaError && (
              <div className="mx-6 mt-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Could not load quota history
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">{quotaError}</p>
                  <button
                    onClick={() => {
                      const token =
                        localStorage.getItem("accessToken") ||
                        sessionStorage.getItem("accessToken");
                      if (token) fetchQuotas(token);
                    }}
                    className="mt-2 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* ── Table / skeleton / empty ─────────────────────── */}
            <div className="px-4 sm:px-6 py-4">
              {quotaLoading ? (
                /* Skeleton rows */
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : !quotaError && requests.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-100 rounded-full p-5 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-bold text-gray-700">
                    No quota requests yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs">
                    You haven&apos;t submitted any quota requests. Click{" "}
                    <strong>Add Quota Request</strong> above to get started.
                  </p>
                </div>
              ) : requests.length > 0 ? (
                /* Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 pr-4">
                          {/* # */}
                          Req. No.
                        </th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 pr-4">
                          Requested Amount
                        </th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 pr-4">
                          Status
                        </th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider pb-3">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {requests.map((req, idx) => (
                        <tr
                          // key={req.id ?? idx}
                          key={req.requestId ?? idx}
                          className="hover:bg-gray-50/60 transition"
                        >
                          <td className="py-3.5 pr-4 text-gray-400 font-medium text-xs">
                            {/* {idx + 1} */}#{req.requestNumber}
                          </td>
                          <td className="py-3.5 pr-4 font-bold text-gray-900">
                            {/* {req.requestQuata?.toLocaleString() ?? "—"} */}
                            {req.requestedQuota?.toLocaleString() ?? "—"}
                          </td>
                          <td className="py-3.5 pr-4">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="py-3.5 text-gray-500 text-xs">
                            {/* {formatDate(req.createdAt)} */}
                            {formatDate(req.submissionDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>

            {/* Footer hint */}
            {!quotaLoading && requests.length > 0 && (
              <div className="px-6 pb-5">
                <p className="text-xs text-gray-400">
                  Showing {requests.length} request
                  {requests.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────── */}
      {showModal && user && (
        <AddQuotaModal
          companyEmail={user.email}
          onClose={() => setShowModal(false)}
          onSuccess={handleQuotaAdded}
        />
      )}
    </main>
  );
}
