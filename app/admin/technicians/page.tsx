"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRole } from "@/services/authService";
import UnauthorisedMessage from "@/components/audit-log/UnauthorisedMessage";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

interface Certification {
  id: number;
  certificationName: string;
  fileType: string;
  fileUrl: string;
  originalFileName: string;
}
interface Technician {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  district: string;
  specialization: string;
  yearsOfExperience: number;
  skillLevel: string;
  status: string;
  registrationDate: string;
  approvalDate: string | null;
  certifications: Certification[];
}
type TabType = "PENDING" | "ACTIVE" | "REJECTED";

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const SkillBadge = ({ level }: { level: string }) => {
  const s: Record<string, string> = {
    JUNIOR: "bg-gray-100 text-gray-700",
    INTERMEDIATE: "bg-blue-100 text-blue-700",
    SENIOR: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${s[level] ?? "bg-slate-100 text-slate-600"}`}
    >
      {level || "—"}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const s: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    ACTIVE: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${s[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
};

export default function AdminTechnicianPage() {
  const router = useRouter();
  const [isUnauthorised, setIsUnauthorised] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    if (!token) {
      router.push("/admin/auth/login");
      return;
    }
    if (role !== "ADMIN") {
      setIsUnauthorised(true);
      return;
    }
  }, []);

  useEffect(() => {
    fetchTechnicians();
  }, [activeTab]);

  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/admin/technicians/${activeTab.toLowerCase()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed");
      setTechnicians(await res.json());
    } catch {
      setTechnicians([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!selectedSkillLevel) {
      alert("Please select a skill level before approving");
      return;
    }
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/admin/technicians/${id}/approve?skillLevel=${selectedSkillLevel}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed");
      setSelectedTechnician(null);
      setSelectedSkillLevel("");
      fetchTechnicians();
    } catch {
      alert("Failed to approve technician");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim() || rejectingId == null) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/admin/technicians/${rejectingId}/reject?reason=${encodeURIComponent(rejectReason)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed");
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingId(null);
      setSelectedTechnician(null);
      fetchTechnicians();
    } catch {
      alert("Failed to reject technician");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this technician?")) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/technicians/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setSelectedTechnician(null);
      fetchTechnicians();
    } catch {
      alert("Failed to delete technician");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    router.push("/ministry");
  };

  if (isUnauthorised) return <UnauthorisedMessage />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-30 lg:z-auto w-64 bg-[#0f172a] flex flex-col flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl flex-shrink-0">
              🛡️
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Ministry of Environment
              </p>
              <p className="text-white/40 text-xs">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 py-2">
            Administration
          </p>
          {[
            { href: "/admin/dashboard", icon: "📋", label: "Audit Logs" },
            { href: "/admin/bookings", icon: "📅", label: "Bookings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/55 hover:bg-white/10 font-semibold text-sm mt-1 transition-colors no-underline"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/10 text-white font-semibold text-sm mt-1">
            <span>🔧</span>Technicians
          </div>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-300 font-semibold text-sm transition-colors"
          >
            <span>🚪</span>Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <svg
              className="w-5 h-5 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-bold text-slate-800 text-sm">
            Technician Management
          </span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-black text-slate-900">
              Technician Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review, approve, or reject technician registration applications.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {
                label: "Pending Review",
                icon: "⏳",
                count: activeTab === "PENDING" ? technicians.length : "—",
                bg: "bg-amber-50 border-amber-200",
                lc: "text-amber-600",
              },
              {
                label: "Active",
                icon: "✅",
                count: activeTab === "ACTIVE" ? technicians.length : "—",
                bg: "bg-green-50 border-green-200",
                lc: "text-green-600",
              },
              {
                label: "Rejected",
                icon: "❌",
                count: activeTab === "REJECTED" ? technicians.length : "—",
                bg: "bg-red-50 border-red-200",
                lc: "text-red-500",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`${card.bg} border rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3`}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/60 flex items-center justify-center text-base sm:text-xl flex-shrink-0">
                  {card.icon}
                </div>
                <div>
                  <p
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${card.lc}`}
                  >
                    {card.label}
                  </p>
                  <p className="text-lg sm:text-2xl font-black text-slate-900">
                    {isLoading ? "—" : card.count}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-5 w-fit">
            {(["PENDING", "ACTIVE", "REJECTED"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedTechnician(null);
                  setSelectedSkillLevel("");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Table + detail */}
          <div className="flex flex-col xl:flex-row gap-4 items-start">
            <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-w-0">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="text-3xl mb-2">⏳</div>Loading technicians...
                </div>
              ) : technicians.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="text-3xl mb-2">📭</div>No{" "}
                  {activeTab.toLowerCase()} technicians found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr className="border-b border-slate-100">
                        {[
                          "Name",
                          "Email",
                          "Specialization",
                          "Skill Level",
                          "Registered",
                          "Status",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {technicians.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => {
                            setSelectedTechnician(t);
                            setSelectedSkillLevel("");
                          }}
                          className={`border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTechnician?.id === t.id ? "bg-green-50" : ""}`}
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {t.firstName} {t.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {t.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {t.specialization || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {t.skillLevel ? (
                              <SkillBadge level={t.skillLevel} />
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                            {formatDate(t.registrationDate)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="px-4 py-3 text-emerald-700 text-sm font-bold whitespace-nowrap">
                            View →
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedTechnician && (
              <div className="w-full xl:w-80 xl:flex-shrink-0 bg-white rounded-xl border border-slate-200 p-5 shadow-sm xl:sticky xl:top-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {selectedTechnician.firstName}{" "}
                      {selectedTechnician.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ID #{selectedTechnician.id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTechnician(null);
                      setSelectedSkillLevel("");
                    }}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                {[
                  { label: "Email", value: selectedTechnician.email },
                  { label: "Phone", value: selectedTechnician.phoneNumber },
                  {
                    label: "District",
                    value: selectedTechnician.district || "—",
                  },
                  {
                    label: "Address",
                    value: selectedTechnician.address || "—",
                  },
                  {
                    label: "Specialization",
                    value: selectedTechnician.specialization || "—",
                  },
                  {
                    label: "Experience",
                    value:
                      selectedTechnician.yearsOfExperience != null
                        ? `${selectedTechnician.yearsOfExperience} yrs`
                        : "—",
                  },
                  {
                    label: "Registered",
                    value: formatDate(selectedTechnician.registrationDate),
                  },
                  {
                    label: "Approved",
                    value: formatDate(selectedTechnician.approvalDate),
                  },
                ].map((row) => (
                  <div key={row.label} className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {row.label}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5 break-words">
                      {row.value}
                    </p>
                  </div>
                ))}

                <div className="mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Skill Level
                  </p>
                  {selectedTechnician.skillLevel ? (
                    <SkillBadge level={selectedTechnician.skillLevel} />
                  ) : (
                    <span className="text-sm text-slate-400">
                      Not assigned yet
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <StatusBadge status={selectedTechnician.status} />
                </div>

                {selectedTechnician.certifications?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                      Certifications ({selectedTechnician.certifications.length}
                      )
                    </p>
                    <div className="flex flex-col gap-2">
                      {selectedTechnician.certifications.map((cert) => (
                        <a
                          key={cert.id}
                          href={`${API_BASE}${cert.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-green-50 transition-colors no-underline"
                        >
                          <span>📄</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {cert.certificationName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {cert.originalFileName}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {selectedTechnician.status === "PENDING" && (
                    <>
                      <div className="mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                          Assign Skill Level{" "}
                          <span className="text-red-500">*</span>
                        </p>
                        <select
                          value={selectedSkillLevel}
                          onChange={(e) =>
                            setSelectedSkillLevel(e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Select level…</option>
                          <option value="JUNIOR">Junior</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="SENIOR">Senior</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleApprove(selectedTechnician.id)}
                        disabled={actionLoading || !selectedSkillLevel}
                        className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading
                          ? "Approving..."
                          : "✅ Approve Technician"}
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(selectedTechnician.id);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition disabled:opacity-50"
                      >
                        ❌ Reject Technician
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(selectedTechnician.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-lg border border-slate-200 bg-white text-red-500 font-bold text-sm hover:bg-red-50 transition disabled:opacity-50"
                  >
                    🗑 Delete Technician
                  </button>
                </div>
              </div>
            )}
          </div>

          <footer className="mt-10 pt-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-400 text-xs">
              © 2024 Ministry of Environment. All Rights Reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-slate-400 text-xs hover:text-slate-600 transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-slate-400 text-xs hover:text-slate-600 transition"
              >
                Help Center
              </Link>
            </div>
          </footer>
        </div>
      </main>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Reject Technician
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for rejection. This will be recorded.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm resize-vertical outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectingId(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
