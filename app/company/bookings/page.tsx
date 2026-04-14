"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyCompanyTickets,
  cancelCompanyTicket,
  ServiceTicketResponse,
} from "@/services/serviceTicketService";

/* ─── Status badge ──────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    PENDING:   { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
    SCHEDULED: { bg: "rgba(96,165,250,0.12)",  text: "#93c5fd" },
    COMPLETED: { bg: "rgba(52,211,153,0.12)",  text: "#34d399" },
    CANCELLED: { bg: "rgba(239,68,68,0.1)",    text: "#f87171" },
  };
  const s = map[status?.toUpperCase()] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  return (
    <span style={{ background: s.bg, color: s.text, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>
      {status}
    </span>
  );
}

/* ─── Booking card ─────────────────────────────────────────────── */
function TicketCard({ ticket, onCancel }: { ticket: ServiceTicketResponse; onCancel: (id: number) => void }) {
  const date = ticket.scheduledDate
    ? new Date(`${ticket.scheduledDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "—";
  const startTime = ticket.scheduledStartTime?.slice(0, 5) ?? "—";
  const endTime   = ticket.scheduledEndTime?.slice(0, 5) ?? "—";
  const isPending = ticket.status?.toUpperCase() === "PENDING";

  return (
    <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Ticket</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{ticket.ticketNumber}</div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
        <InfoCell label="Technician" value={ticket.technicianName} />
        <InfoCell label="Specialization" value={ticket.technicianSpecialization} />
        <InfoCell label="Service" value={ticket.serviceType} />
        <InfoCell label="Date" value={date} />
        <InfoCell label="Time" value={`${startTime} – ${endTime}`} />
        {ticket.description && <InfoCell label="Description" value={ticket.description} span />}
      </div>

      {/* Cancellation info */}
      {ticket.cancellationReason && (
        <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#fca5a5" }}>
          <strong>Cancelled:</strong> {ticket.cancellationReason}
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <button
          onClick={() => onCancel(ticket.id)}
          style={{ alignSelf: "flex-start", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
}

function InfoCell({ label, value, span }: { label: string; value?: string; span?: boolean }) {
  return (
    <div style={span ? { gridColumn: "1 / -1" } : {}}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */
export default function CompanyBookingsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<ServiceTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCompanyTickets();
      setTickets(data);
    } catch {
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    const reason = prompt("Reason for cancellation (optional):") || "Cancelled by company";
    try {
      await cancelCompanyTicket(id, reason);
      alert("Booking cancelled successfully.");
      fetchTickets();
    } catch (err: unknown) {
      const e = err as Record<string, string>;
      alert(e?.error || "Failed to cancel. Please try again.");
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "system-ui, sans-serif", color: "#f8fafc" }}>
      {/* ── Topbar ─────────────────────────────────────────── */}
      <div style={{ background: "#111827", borderBottom: "1px solid rgba(4,120,87,0.2)", padding: "14px 32px", display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => router.push("/company/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}
        >
          ← Dashboard
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Company Bookings</h1>
        <button
          onClick={fetchTickets}
          disabled={loading}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}
        >
          ↻ Refresh
        </button>
        <button
          onClick={() => router.push("/public/directory")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#047857", border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          + New Booking
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: "32px auto", padding: "0 20px 60px" }}>
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid rgba(52,211,153,0.18)", borderTopColor: "#34d399", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#64748b", fontSize: 13 }}>Loading bookings…</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(4,120,87,0.1)", border: "1px solid rgba(4,120,87,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" fill="none" stroke="#34d399" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px" }}>No Bookings Yet</h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Your company hasn't raised any service tickets yet.</p>
            <button
              onClick={() => router.push("/public/directory")}
              style={{ background: "#047857", border: "none", color: "#fff", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Find a Technician
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>{tickets.length} booking{tickets.length !== 1 ? "s" : ""} found</p>
            {tickets.map((t) => (
              <TicketCard key={t.id} ticket={t} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
