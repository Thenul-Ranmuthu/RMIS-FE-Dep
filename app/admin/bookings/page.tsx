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

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

export default function AdminBookingDashboardPage() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <>
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2>Booking Management</h2>
            <p>Monitor all technician service bookings across the system.</p>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              fontWeight: 300,
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="summary-cards-container">
        <div className="summary-card">
          <div className="summary-icon green">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div className="summary-info">
            <h3>Total Bookings</h3>
            <div className="summary-value">
              {isLoading ? "—" : tickets.length}
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon yellow">
            <span className="material-symbols-outlined">hourglass_empty</span>
          </div>
          <div className="summary-info">
            <h3>Pending</h3>
            <div className="summary-value">
              {isLoading
                ? "—"
                : tickets.filter((t) => t.status === "PENDING").length}
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div
            className="summary-icon"
            style={{ backgroundColor: "#c2ead1", color: "#327552" }}
          >
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div className="summary-info">
            <h3>Completed</h3>
            <div className="summary-value">
              {isLoading
                ? "—"
                : tickets.filter((t) => t.status === "COMPLETED").length}
            </div>
          </div>
        </div>
      </div>

      <div className="master-table-card" style={{ marginTop: "24px" }}>
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <div className="filter-input">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <span className="material-symbols-outlined select-icon">
                  expand_more
                </span>
              </div>
            </div>
            <div className="filter-group" style={{ flex: 2 }}>
              <label>Search</label>
              <div className="filter-input">
                <span className="material-symbols-outlined">search</span>
                <input
                  placeholder="Ticket #, Customer, Technician..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Customer</th>
                <th>Technician</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    Loading bookings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => (
                  <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)}>
                    <td>
                      <span className="req-id">{ticket.ticketNumber}</span>
                    </td>
                    <td>
                      <div>{ticket.customerName}</div>
                      <div style={{ fontSize: "11px", opacity: 0.7 }}>
                        {ticket.customerEmail}
                      </div>
                    </td>
                    <td>{ticket.technicianName}</td>
                    <td>
                      {formatDate(ticket.scheduledDate)}
                      <div style={{ fontSize: "11px", opacity: 0.7 }}>
                        {formatTime(ticket.scheduledStartTime)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          ticket.status === "COMPLETED"
                            ? "status-approved"
                            : ticket.status === "PENDING"
                              ? "status-pending"
                              : ticket.status === "CANCELLED"
                                ? "status-rejected"
                                : ""
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span className="action-link">Details</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-footer" style={{ padding: "16px 32px" }}>
            <div className="pagination-info" style={{ marginLeft: "8px" }}>
              Showing {filtered.length} results
            </div>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="master-table-card"
            style={{ width: "500px", background: "white", padding: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3>Booking Details: {selectedTicket.ticketNumber}</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div
              className="filters-grid"
              style={{ flexDirection: "column", gap: "12px" }}
            >
              <p>
                <strong>Customer:</strong> {selectedTicket.customerName} (
                {selectedTicket.customerEmail})
              </p>
              <p>
                <strong>Technician:</strong> {selectedTicket.technicianName} -{" "}
                {selectedTicket.technicianSpecialization}
              </p>
              <p>
                <strong>Service:</strong> {selectedTicket.serviceType}
              </p>
              <p>
                <strong>Schedule:</strong>{" "}
                {formatDate(selectedTicket.scheduledDate)} at{" "}
                {formatTime(selectedTicket.scheduledStartTime)}
              </p>
              <p>
                <strong>Status:</strong> {selectedTicket.status}
              </p>
              {selectedTicket.description && (
                <p>
                  <strong>Description:</strong> {selectedTicket.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
