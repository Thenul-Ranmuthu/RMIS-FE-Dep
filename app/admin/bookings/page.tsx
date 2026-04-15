"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRole } from "@/services/authService";
import UnauthorisedMessage from "@/components/audit-log/UnauthorisedMessage";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "—";
  // timeStr is "HH:mm:ss"
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
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
        gap: 6,
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
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: meta.dot,
          flexShrink: 0,
        }}
      />
      {meta.label}
    </span>
  );
};

const CustomerTypeBadge = ({ type }: { type: string }) => (
  <span
    style={{
      backgroundColor: type === "COMPANY" ? "#ede9fe" : "#f0fdf4",
      color: type === "COMPANY" ? "#6d28d9" : "#166534",
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 700,
    }}
  >
    {type === "COMPANY" ? "🏢 Company" : "👤 Public"}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────

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

  // ── Auth guard ───────────────────────────────────────────────────────────
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

  // ── Fetch ────────────────────────────────────────────────────────────────
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

      if (!res.ok) throw new Error("Failed to fetch bookings");
      setTickets(await res.json());
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    router.push("/ministry");
  };

  // ── Client-side search filter ────────────────────────────────────────────
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

  // ── Stats ────────────────────────────────────────────────────────────────
  const countByStatus = (s: string) =>
    tickets.filter((t) => t.status === s).length;

  if (isUnauthorised) return <UnauthorisedMessage />;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 260,
          backgroundColor: "#0f172a",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "rgba(34,197,94,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🛡️
            </div>
            <div>
              <p
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Ministry of Environment
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "8px 8px 4px",
              margin: 0,
            }}
          >
            Administration
          </p>

          {[
            { href: "/admin/dashboard", icon: "📋", label: "Audit Logs" },
            { href: "/admin/technicians", icon: "🔧", label: "Technicians" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  marginTop: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span>{item.icon}</span> {item.label}
              </div>
            </Link>
          ))}

          {/* Active item */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            <span>📅</span> Bookings
          </div>
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              backgroundColor: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Booking Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
            Monitor all technician service bookings across the system.
          </p>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Total",
              icon: "📋",
              bg: "#fff",
              border: "#e2e8f0",
              iconBg: "#f1f5f9",
              count: tickets.length,
              color: "#0f172a",
            },
            {
              label: "Pending",
              icon: "⏳",
              bg: "#fffbeb",
              border: "#fde68a",
              iconBg: "#fef3c7",
              count: countByStatus("PENDING"),
              color: "#d97706",
            },
            {
              label: "Completed",
              icon: "✅",
              bg: "#f0fdf4",
              border: "#bbf7d0",
              iconBg: "#dcfce7",
              count: countByStatus("COMPLETED"),
              color: "#16a34a",
            },
            {
              label: "Cancelled",
              icon: "❌",
              bg: "#fff1f2",
              border: "#fecdd3",
              iconBg: "#fee2e2",
              count: countByStatus("CANCELLED"),
              color: "#dc2626",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                backgroundColor: card.bg,
                borderRadius: 12,
                border: `1px solid ${card.border}`,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: card.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: card.color === "#0f172a" ? "#94a3b8" : card.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: 0,
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {isLoading ? "—" : card.count}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar: status tabs + search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Status filter tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              backgroundColor: "#fff",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              padding: 4,
            }}
          >
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
                style={{
                  padding: "7px 16px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  transition: "all 0.15s",
                  backgroundColor:
                    statusFilter === s ? "#0f172a" : "transparent",
                  color: statusFilter === s ? "#fff" : "#64748b",
                  whiteSpace: "nowrap",
                }}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search ticket, customer, technician…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 9,
                paddingBottom: 9,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                color: "#0f172a",
                backgroundColor: "#fff",
                outline: "none",
                width: 280,
              }}
            />
          </div>
        </div>

        {/* Table + Detail panel */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Table */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {isLoading ? (
              <div
                style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                Loading bookings…
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                {searchQuery
                  ? "No bookings match your search."
                  : `No ${statusFilter === "ALL" ? "" : statusFilter.toLowerCase() + " "}bookings found.`}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
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
                          style={{
                            padding: "12px 16px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                          }}
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
                        style={{
                          borderBottom: "1px solid #f8fafc",
                          cursor: "pointer",
                          backgroundColor:
                            selectedTicket?.id === ticket.id
                              ? "#f0fdf4"
                              : "transparent",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedTicket?.id !== ticket.id)
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedTicket?.id !== ticket.id)
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                        }}
                      >
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {ticket.ticketNumber}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                              margin: 0,
                            }}
                          >
                            {ticket.customerName || "—"}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              margin: "2px 0 0",
                            }}
                          >
                            {ticket.customerEmail}
                          </p>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                              margin: 0,
                            }}
                          >
                            {ticket.technicianName || "—"}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              margin: "2px 0 0",
                            }}
                          >
                            {ticket.technicianSpecialization || "—"}
                          </p>
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            color: "#475569",
                            maxWidth: 160,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {ticket.serviceType || "—"}
                          </p>
                          {ticket.description && (
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#94a3b8",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 140,
                              }}
                            >
                              {ticket.description}
                            </p>
                          )}
                        </td>
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                              margin: 0,
                            }}
                          >
                            {formatDate(ticket.scheduledDate)}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              margin: "2px 0 0",
                            }}
                          >
                            {formatTime(ticket.scheduledStartTime)} –{" "}
                            {formatTime(ticket.scheduledEndTime)}
                          </p>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              color: "#1a4a38",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            View →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Row count footer */}
            {!isLoading && filtered.length > 0 && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: 12,
                  color: "#94a3b8",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  Showing {filtered.length} of {tickets.length} bookings
                </span>
                {searchQuery && <span>Filtered by: "{searchQuery}"</span>}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedTicket && (
            <div
              style={{
                width: 340,
                flexShrink: 0,
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                position: "sticky",
                top: 20,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedTicket.ticketNumber}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      margin: "3px 0 0",
                    }}
                  >
                    Ticket ID #{selectedTicket.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Status + customer type */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <StatusBadge status={selectedTicket.status} />
                <CustomerTypeBadge type={selectedTicket.customerType} />
              </div>

              {/* Sections */}
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
                      label: "Start Time",
                      value: formatTime(selectedTicket.scheduledStartTime),
                    },
                    {
                      label: "End Time",
                      value: formatTime(selectedTicket.scheduledEndTime),
                    },
                  ],
                },
                {
                  title: "🛠️ Service",
                  rows: [
                    { label: "Type", value: selectedTicket.serviceType || "—" },
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
                <div key={section.title} style={{ marginBottom: 18 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 8px",
                      paddingBottom: 6,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {section.title}
                  </p>
                  {section.rows.map((row) => (
                    <div key={row.label} style={{ marginBottom: 8 }}>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          margin: 0,
                        }}
                      >
                        {row.label}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                          margin: "2px 0 0",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              ))}

              {/* Cancellation info */}
              {selectedTicket.status === "CANCELLED" && (
                <div
                  style={{
                    backgroundColor: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: 8,
                    padding: "12px 14px",
                    marginTop: 4,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#dc2626",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      margin: "0 0 4px",
                    }}
                  >
                    ❌ Cancellation Details
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#991b1b",
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    {selectedTicket.cancellationReason || "No reason provided"}
                  </p>
                  {selectedTicket.cancellationTimestamp && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#f87171",
                        margin: "4px 0 0",
                      }}
                    >
                      {formatDateTime(selectedTicket.cancellationTimestamp)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
            © 2024 Ministry of Environment. All Rights Reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <Link
              href="#"
              style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none" }}
            >
              Help Center
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
