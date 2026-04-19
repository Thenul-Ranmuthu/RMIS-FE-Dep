"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRole } from "@/services/authService";
import UnauthorisedMessage from "@/components/audit-log/UnauthorisedMessage";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

interface ServiceTicket {
  id: number;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerType: "PUBLIC_USER" | "COMPANY";
  technicianId: number;
  technicianName: string;
  technicianSpecialization: string;
  availabilityId: number;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  serviceType: string;
  description: string;
  status: string;
  cancellationReason: string | null;
  cancellationTimestamp: string | null;
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
const formatDateTime = (d: string | null) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const formatTime = (t: string | null) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const STATUS_META: Record<
  string,
  { bg: string; color: string; dot: string; label: string }
> = {
  PENDING: {
    bg: "#fef9c3",
    color: "#854d0e",
    dot: "#f59e0b",
    label: "Pending",
  },
  ACCEPTED: {
    bg: "#dbeafe",
    color: "#1e40af",
    dot: "#3b82f6",
    label: "Accepted",
  },
  COMPLETED: {
    bg: "#dcfce7",
    color: "#166534",
    dot: "#22c55e",
    label: "Completed",
  },
  CANCELLED: {
    bg: "#fee2e2",
    color: "#991b1b",
    dot: "#ef4444",
    label: "Cancelled",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const meta = STATUS_META[status] ?? {
    bg: "#f1f5f9",
    color: "#475569",
    dot: "#94a3b8",
    label: status,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        backgroundColor: meta.bg,
        color: meta.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: meta.dot,
          flexShrink: 0,
        }}
      />
      {meta.label}
    </span>
  );
};

export default function AdminBookingDashboardPage() {
  const router = useRouter();
  const [isUnauthorised, setIsUnauthorised] = useState(false);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const url =
        statusFilter === "ALL"
          ? `${API_BASE}/api/service-tickets/admin/all`
          : `${API_BASE}/api/service-tickets/admin/all?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setTickets(await res.json());
    } catch {
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    router.push("/ministry");
  };

  const filtered = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.customerEmail?.toLowerCase().includes(q) ||
      t.technicianName?.toLowerCase().includes(q) ||
      t.serviceType?.toLowerCase().includes(q)
    );
  });

  const countByStatus = (s: string) =>
    tickets.filter((t) => t.status === s).length;
  if (isUnauthorised) return <UnauthorisedMessage />;

  const navItems = [
    { href: "/admin/dashboard", icon: "📋", label: "Audit Logs" },
    { href: "/admin/technicians", icon: "🔧", label: "Technicians" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
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
          {navItems.map((item) => (
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
            <span>📅</span>Bookings
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

      {/* Main */}
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
            Booking Dashboard
          </span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Title */}
          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-black text-slate-900">
              Booking Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Monitor all technician service bookings across the system.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Total",
                icon: "📋",
                count: tickets.length,
                bg: "bg-white border-slate-200",
                lc: "text-slate-400",
              },
              {
                label: "Pending",
                icon: "⏳",
                count: countByStatus("PENDING"),
                bg: "bg-amber-50 border-amber-200",
                lc: "text-amber-600",
              },
              {
                label: "Completed",
                icon: "✅",
                count: countByStatus("COMPLETED"),
                bg: "bg-green-50 border-green-200",
                lc: "text-green-600",
              },
              {
                label: "Cancelled",
                icon: "❌",
                count: countByStatus("CANCELLED"),
                bg: "bg-red-50 border-red-200",
                lc: "text-red-500",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`${card.bg} border rounded-xl p-3 sm:p-4 flex items-center gap-3`}
              >
                <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-lg flex-shrink-0">
                  {card.icon}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${card.lc}`}
                  >
                    {card.label}
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {isLoading ? "—" : card.count}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {(
                [
                  "ALL",
                  "PENDING",
                  "ACCEPTED",
                  "COMPLETED",
                  "CANCELLED",
                ] as StatusFilter[]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setSelectedTicket(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search ticket, customer…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Table + Detail */}
          <div className="flex flex-col xl:flex-row gap-4 items-start">
            {/* Table */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-w-0">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="text-3xl mb-2">⏳</div>Loading bookings…
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="text-3xl mb-2">📭</div>
                  {searchQuery
                    ? "No bookings match your search."
                    : "No bookings found."}
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
                          "Ticket #",
                          "Customer",
                          "Technician",
                          "Service",
                          "Scheduled",
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
                      {filtered.map((ticket) => (
                        <tr
                          key={ticket.id}
                          onClick={() =>
                            setSelectedTicket(
                              selectedTicket?.id === ticket.id ? null : ticket,
                            )
                          }
                          className={`border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTicket?.id === ticket.id ? "bg-green-50" : ""}`}
                        >
                          <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                            {ticket.ticketNumber}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {ticket.customerName || "—"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {ticket.customerEmail}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {ticket.technicianName || "—"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {ticket.technicianSpecialization || "—"}
                            </p>
                          </td>
                          <td className="px-4 py-3 max-w-[140px]">
                            <p className="text-sm font-semibold text-slate-900">
                              {ticket.serviceType || "—"}
                            </p>
                            {ticket.description && (
                              <p className="text-xs text-slate-400 mt-0.5 truncate">
                                {ticket.description}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatDate(ticket.scheduledDate)}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {formatTime(ticket.scheduledStartTime)} –{" "}
                              {formatTime(ticket.scheduledEndTime)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={ticket.status} />
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
              {!isLoading && filtered.length > 0 && (
                <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                  <span>
                    Showing {filtered.length} of {tickets.length} bookings
                  </span>
                  {searchQuery && <span>Filtered by: "{searchQuery}"</span>}
                </div>
              )}
            </div>

            {/* Detail panel — full width on mobile, fixed side on xl */}
            {selectedTicket && (
              <div className="w-full xl:w-80 xl:flex-shrink-0 bg-white rounded-xl border border-slate-200 p-5 shadow-sm xl:sticky xl:top-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 font-mono">
                      {selectedTicket.ticketNumber}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ticket ID #{selectedTicket.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <StatusBadge status={selectedTicket.status} />
                </div>
                {[
                  {
                    title: "👤 Customer",
                    rows: [
                      {
                        label: "Name",
                        value: selectedTicket.customerName || "—",
                      },
                      {
                        label: "Email",
                        value: selectedTicket.customerEmail || "—",
                      },
                    ],
                  },
                  {
                    title: "🔧 Technician",
                    rows: [
                      {
                        label: "Name",
                        value: selectedTicket.technicianName || "—",
                      },
                      {
                        label: "Specialization",
                        value: selectedTicket.technicianSpecialization || "—",
                      },
                    ],
                  },
                  {
                    title: "📅 Schedule",
                    rows: [
                      {
                        label: "Date",
                        value: formatDate(selectedTicket.scheduledDate),
                      },
                      {
                        label: "Start",
                        value: formatTime(selectedTicket.scheduledStartTime),
                      },
                      {
                        label: "End",
                        value: formatTime(selectedTicket.scheduledEndTime),
                      },
                    ],
                  },
                  {
                    title: "🛠️ Service",
                    rows: [
                      {
                        label: "Type",
                        value: selectedTicket.serviceType || "—",
                      },
                      {
                        label: "Description",
                        value: selectedTicket.description || "—",
                      },
                    ],
                  },
                  {
                    title: "🕒 Audit",
                    rows: [
                      {
                        label: "Created",
                        value: formatDateTime(selectedTicket.createdAt),
                      },
                      {
                        label: "Updated",
                        value: formatDateTime(selectedTicket.updatedAt),
                      },
                    ],
                  },
                ].map((section) => (
                  <div key={section.title} className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">
                      {section.title}
                    </p>
                    {section.rows.map((row) => (
                      <div key={row.label} className="mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {row.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5 break-words">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
                {selectedTicket.status === "CANCELLED" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">
                      ❌ Cancellation
                    </p>
                    <p className="text-xs text-red-800 font-medium">
                      {selectedTicket.cancellationReason ||
                        "No reason provided"}
                    </p>
                    {selectedTicket.cancellationTimestamp && (
                      <p className="text-xs text-red-400 mt-1">
                        {formatDateTime(selectedTicket.cancellationTimestamp)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-10 pt-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-400 text-xs text-center">
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
    </div>
  );
}
