"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getRole } from "@/services/authService";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

interface BookingDetail {
  id: number;
  ticketNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerType: string;
  serviceType: string;
  description?: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  createdAt: string;
  cancellationReason?: string;
}

function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function statusMeta(status: string) {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        color: "#b45309",
        bg: "#fff7ed",
        border: "#fed7aa",
        icon: "⏳",
      };
    case "ACCEPTED":
      return {
        label: "Accepted",
        color: "#047857",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        icon: "✅",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        color: "#047857",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        icon: "✓",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        color: "#dc2626",
        bg: "#fef2f2",
        border: "#fecaca",
        icon: "✕",
      };
    default:
      return {
        label: status,
        color: "#475569",
        bg: "#f8fafc",
        border: "#e2e8f0",
        icon: "•",
      };
  }
}

function getActions(
  status: string,
): { label: string; nextStatus: string; style: "primary" | "danger" }[] {
  switch (status) {
    case "PENDING":
      return [
        { label: "Accept Booking", nextStatus: "ACCEPTED", style: "primary" },
        { label: "Cancel Booking", nextStatus: "CANCELLED", style: "danger" },
      ];
    case "ACCEPTED":
      return [
        { label: "Mark Completed", nextStatus: "COMPLETED", style: "primary" },
        { label: "Cancel Booking", nextStatus: "CANCELLED", style: "danger" },
      ];
    default:
      return [];
  }
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    if (!token) {
      router.push("/login");
      return;
    }
    if (role !== "ROLE_TECHNICIAN" && role !== "TECHNICIAN") {
      setError("Access denied.");
      setIsLoading(false);
      return;
    }
    fetchBooking();
  }, [id, router]);

  const fetchBooking = () => {
    authFetch(`${API_BASE}/technician/bookings/${id}`)
      .then(async (r) => {
        if (r.status === 403)
          throw new Error("You do not have access to this booking.");
        if (!r.ok) throw new Error("Booking not found.");
        return r.json();
      })
      .then(setBooking)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  };

  const handleStatusUpdate = async (nextStatus: string) => {
    if (nextStatus === "CANCELLED") {
      setShowCancelModal(true);
      return;
    }
    setUpdating(true);
    setUpdateError("");
    try {
      const res = await authFetch(
        `${API_BASE}/technician/bookings/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setUpdateError(body.error || "Failed to update status.");
        return;
      }
      setBooking(await res.json());
    } catch {
      setUpdateError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setCancelError("Please provide a cancellation reason.");
      return;
    }
    setUpdating(true);
    setCancelError("");
    try {
      const res = await authFetch(
        `${API_BASE}/technician/bookings/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "CANCELLED",
            cancellationReason: cancelReason,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCancelError(body.error || "Failed to cancel booking.");
        return;
      }
      setBooking(await res.json());
      setShowCancelModal(false);
      setCancelReason("");
    } catch {
      setCancelError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={s.page}>
        <div style={s.centerWrap}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Loading booking details…</p>
        </div>
        <style>{spin}</style>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={s.page}>
        <div style={s.centerWrap}>
          <div style={s.resultCard}>
            <div
              style={{
                ...s.resultIcon,
                background: "#fef2f2",
                color: "#dc2626",
              }}
            >
              ⚠
            </div>
            <h2 style={s.resultTitle}>Not Found</h2>
            <p style={s.resultSub}>
              {error || "This booking could not be loaded."}
            </p>
            <button
              style={s.btnPrimary}
              onClick={() => router.push("/technician/bookings")}
            >
              ← Back to Bookings
            </button>
          </div>
        </div>
        <style>{spin}</style>
      </div>
    );
  }

  const st = statusMeta(booking.status);
  const actions = getActions(booking.status);

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            <div style={s.logoBox}>🛠️</div>
            <div>
              <div style={s.logoTitle}>RMIS</div>
              <div style={s.logoSub}>Technician Portal</div>
            </div>
            <div style={s.breadcrumb}>
              <span style={s.breadcrumbSep}>•</span>
              <Link href="/technician/bookings" style={s.breadcrumbLink}>
                Bookings
              </Link>
              <span style={s.breadcrumbSep}>•</span>
              <span style={s.breadcrumbActive}>{booking.ticketNumber}</span>
            </div>
          </div>
          <button
            style={s.signOutBtn}
            onClick={() => {
              localStorage.removeItem("accessToken");
              router.push("/login");
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main style={s.main}>
        <button
          style={s.backBtn}
          onClick={() => router.push("/technician/bookings")}
        >
          ← Back to Bookings
        </button>

        {/* ── Hero ── */}
        <section style={s.hero}>
          <div style={s.heroOverlay} />
          <div style={s.heroLeft}>
            <div style={s.heroBadge}>
              <span style={s.heroBadgeDot} />
              Booking Detail
            </div>
            <h1 style={s.heroTitle}>{booking.serviceType}</h1>
            <div style={s.heroTicket}>{booking.ticketNumber}</div>
          </div>
          <div style={s.heroRight}>
            <div style={s.heroStatusBox}>
              <div style={s.heroStatusIcon}>{st.icon}</div>
              <div style={s.heroStatusLabel}>Current Status</div>
              <div
                style={{
                  ...s.statusBadgeLg,
                  color: st.color,
                  background: st.bg,
                  border: `1px solid ${st.border}`,
                }}
              >
                {st.label}
              </div>
            </div>
          </div>
        </section>

        {/* ── Update error ── */}
        {updateError && <div style={s.errorBanner}>⚠ {updateError}</div>}

        {/* ── Action bar ── */}
        {actions.length > 0 && (
          <div style={s.actionBar}>
            <div>
              <div style={s.actionBarTitle}>Update Status</div>
              <div style={s.actionBarSub}>
                Move this booking to the next stage
              </div>
            </div>
            <div style={s.actionBtns}>
              {actions.map((action) => (
                <button
                  key={action.nextStatus}
                  style={
                    action.style === "primary"
                      ? s.actionBtnPrimary
                      : s.actionBtnDanger
                  }
                  onClick={() => handleStatusUpdate(action.nextStatus)}
                  disabled={updating}
                >
                  {updating ? "Updating…" : action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Cancellation reason banner ── */}
        {booking.status === "CANCELLED" && booking.cancellationReason && (
          <div style={s.cancelledBanner}>
            <div style={s.cancelledBannerTitle}>⚠ Booking Cancelled</div>
            <div style={s.cancelledBannerReason}>
              Reason: {booking.cancellationReason}
            </div>
          </div>
        )}

        {/* ── Detail grid ── */}
        <div style={s.detailGrid}>
          <div style={s.detailCard}>
            <div style={s.cardHeading}>
              <span style={s.cardHeadingIcon}>📅</span>
              Scheduled Appointment
            </div>
            <div style={s.divider} />
            <DetailRow
              label="Date"
              value={formatDate(booking.scheduledDate)}
              highlight
            />
            <DetailRow
              label="Time"
              value={`${formatTime(booking.scheduledStartTime)} – ${formatTime(booking.scheduledEndTime)}`}
              highlight
            />
          </div>

          <div style={s.detailCard}>
            <div style={s.cardHeading}>
              <span style={s.cardHeadingIcon}>🔧</span>
              Service Information
            </div>
            <div style={s.divider} />
            <DetailRow label="Service Type" value={booking.serviceType} />
            <DetailRow
              label="Description"
              value={booking.description || "No description provided."}
              muted={!booking.description}
            />
            <DetailRow
              label="Ticket Raised"
              value={new Date(booking.createdAt).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            />
          </div>

          <div style={{ ...s.detailCard, ...s.detailCardFull }}>
            <div style={s.cardHeading}>
              <span style={s.cardHeadingIcon}>👤</span>
              Customer Information
            </div>
            <div style={s.divider} />
            <div style={s.customerGrid}>
              <DetailRow label="Name" value={booking.customerName} highlight />
              <DetailRow
                label="Type"
                value={
                  booking.customerType === "COMPANY" ? "Company" : "Individual"
                }
              />
              <DetailRow
                label="Email"
                value={booking.customerEmail}
                isLink={`mailto:${booking.customerEmail}`}
              />
              <DetailRow
                label="Phone"
                value={booking.customerPhone || "Not provided"}
                muted={!booking.customerPhone}
                isLink={
                  booking.customerPhone
                    ? `tel:${booking.customerPhone}`
                    : undefined
                }
              />
            </div>
            <div style={s.contactActions}>
              <a href={`mailto:${booking.customerEmail}`} style={s.contactBtn}>
                ✉ Send Email
              </a>
              {booking.customerPhone && (
                <a
                  href={`tel:${booking.customerPhone}`}
                  style={{ ...s.contactBtn, ...s.contactBtnOutline }}
                >
                  📞 Call Customer
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer style={s.footer}>
        © {new Date().getFullYear()} RMIS · Ministry of Environment
      </footer>

      {/* ── Cancel modal ── */}
      {showCancelModal && (
        <div
          style={s.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCancelModal(false);
          }}
        >
          <div style={s.modal}>
            <div style={s.modalIcon}>🗑️</div>
            <h3 style={s.modalTitle}>Cancel Booking?</h3>
            <p style={s.modalSub}>
              The customer will be notified by email. Please provide a reason.
            </p>
            <textarea
              style={s.cancelTextarea}
              rows={4}
              maxLength={500}
              placeholder="Enter cancellation reason…"
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                setCancelError("");
              }}
            />
            <div style={s.charCount}>{cancelReason.length} / 500</div>
            {cancelError && <div style={s.cancelErrorMsg}>⚠ {cancelError}</div>}
            <div style={s.modalActions}>
              <button
                style={s.modalBtnBack}
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setCancelError("");
                }}
              >
                Go Back
              </button>
              <button
                style={s.modalBtnConfirm}
                onClick={handleCancelConfirm}
                disabled={updating}
              >
                {updating ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{spin}</style>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  muted,
  isLink,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
  isLink?: string;
}) {
  return (
    <div style={s.detailRow}>
      <div style={s.detailLabel}>{label}</div>
      {isLink ? (
        <a
          href={isLink}
          style={{
            ...s.detailVal,
            color: "#047857",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {value}
        </a>
      ) : (
        <div
          style={{
            ...s.detailVal,
            ...(highlight ? { color: "#0f172a", fontWeight: 700 } : {}),
            ...(muted ? { color: "#94a3b8", fontStyle: "italic" } : {}),
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
}

const spin = `@keyframes spin { to { transform: rotate(360deg); } }`;

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: "#0f172a",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid #e2e8f0",
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#ecfdf5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "0.05em",
  },
  logoSub: { fontSize: 11, color: "#94a3b8" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginLeft: 8 },
  breadcrumbSep: { color: "#cbd5e1", fontSize: 12 },
  breadcrumbLink: {
    fontSize: 13,
    color: "#64748b",
    textDecoration: "none",
    fontWeight: 500,
  },
  breadcrumbActive: { fontSize: 13, color: "#047857", fontWeight: 700 },
  signOutBtn: {
    background: "#fff",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  main: { maxWidth: 1100, margin: "0 auto", padding: "20px 16px 60px" },
  backBtn: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    borderRadius: 10,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 24,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  hero: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)",
    padding: "20px 20px",
    marginBottom: 20,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap" as const,
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse 60% 80% at 90% 50%, rgba(255,255,255,0.05), transparent)",
  },
  heroLeft: { position: "relative", zIndex: 1 },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 999,
    padding: "4px 14px",
    fontSize: 11,
    fontWeight: 700,
    color: "#a7f3d0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    marginBottom: 14,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#34d399",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 10px",
    lineHeight: 1.2,
  },
  heroTicket: {
    fontSize: 14,
    color: "#6ee7b7",
    fontFamily: "monospace",
    fontWeight: 600,
  },
  heroRight: { position: "relative", zIndex: 1, flexShrink: 0 },
  heroStatusBox: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: "20px 28px",
    textAlign: "center" as const,
    backdropFilter: "blur(8px)",
  },
  heroStatusIcon: { fontSize: 28, marginBottom: 8 },
  heroStatusLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    marginBottom: 10,
  },
  statusBadgeLg: {
    fontSize: 13,
    fontWeight: 800,
    borderRadius: 999,
    padding: "5px 16px",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    display: "inline-block",
  },

  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "12px 18px",
    fontSize: 13,
    color: "#dc2626",
    fontWeight: 600,
    marginBottom: 16,
  },

  actionBar: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 20,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap" as const,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  actionBarTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 3,
  },
  actionBarSub: { fontSize: 12, color: "#94a3b8" },
  actionBtns: { display: "flex", gap: 10, flexWrap: "wrap" as const },
  actionBtnPrimary: {
    background: "#047857",
    border: "none",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  actionBtnDanger: {
    background: "#fff",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  cancelledBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "14px 20px",
    marginBottom: 20,
  },
  cancelledBannerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#dc2626",
    marginBottom: 4,
  },
  cancelledBannerReason: { fontSize: 13, color: "#7f1d1d" },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  detailCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: "24px 26px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  detailCardFull: { gridColumn: "1 / -1" },
  cardHeading: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 16,
  },
  cardHeadingIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "#ecfdf5",
    border: "1px solid #d1fae5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },
  divider: { height: 1, background: "#f1f5f9", marginBottom: 16 },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "10px 0",
    borderBottom: "1px solid #f8fafc",
  },
  detailLabel: {
    fontSize: 12,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    fontWeight: 600,
    flexShrink: 0,
    paddingRight: 16,
  },
  detailVal: {
    fontSize: 13,
    color: "#334155",
    fontWeight: 500,
    textAlign: "right" as const,
    maxWidth: "65%",
  },
  customerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 40px",
  },
  contactActions: {
    display: "flex",
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid #f1f5f9",
  },
  contactBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#047857",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
  },
  contactBtnOutline: {
    background: "#fff",
    color: "#047857",
    border: "1px solid #a7f3d0",
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(15,23,42,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    padding: "20px 16px",
    maxWidth: 440,
    width: "100%",
    textAlign: "center" as const,
    boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
  },
  modalIcon: { fontSize: 32, marginBottom: 14 },
  modalTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  modalSub: {
    fontSize: 13,
    color: "#64748b",
    margin: "0 0 20px",
    lineHeight: 1.6,
  },
  cancelTextarea: {
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 13,
    fontFamily: "inherit",
    resize: "vertical" as const,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  charCount: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "right" as const,
    marginTop: 4,
    marginBottom: 12,
  },
  cancelErrorMsg: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#dc2626",
    fontWeight: 600,
    marginBottom: 12,
  },
  modalActions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginTop: 8,
  },
  modalBtnBack: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  modalBtnConfirm: {
    background: "#dc2626",
    border: "none",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  centerWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "4px solid #d1fae5",
    borderTopColor: "#047857",
    animation: "spin 0.9s linear infinite",
  },
  loadingText: { fontSize: 14, color: "#94a3b8", margin: 0 },
  resultCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: "20px 16px",
    textAlign: "center" as const,
    maxWidth: 380,
    width: "100%",
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    margin: "0 auto 16px",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  resultSub: { fontSize: 13, color: "#94a3b8", margin: "0 0 20px" },
  btnPrimary: {
    background: "#047857",
    border: "none",
    color: "#fff",
    borderRadius: 10,
    padding: "11px 24px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },

  footer: {
    textAlign: "center" as const,
    padding: "16px 16px",
    borderTop: "1px solid #f1f5f9",
    fontSize: 12,
    color: "#cbd5e1",
  },
};
