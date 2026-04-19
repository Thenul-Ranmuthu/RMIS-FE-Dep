"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getRole } from "@/services/authService";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

interface Booking {
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
    weekday: "short",
    year: "numeric",
    month: "short",
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
      };
    case "ACCEPTED":
      return {
        label: "Scheduled",
        color: "#047857",
        bg: "#ecfdf5",
        border: "#a7f3d0",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        color: "#dc2626",
        bg: "#fef2f2",
        border: "#fecaca",
      };
    default:
      return {
        label: status,
        color: "#475569",
        bg: "#f8fafc",
        border: "#e2e8f0",
      };
  }
}

const STATUS_TABS = ["ALL", "PENDING", "ACCEPTED", "CANCELLED"];

export default function TechnicianBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorised, setIsUnauthorised] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    if (!token) {
      router.push("/");
      return;
    }
    if (role !== "ROLE_TECHNICIAN" && role !== "TECHNICIAN") {
      setIsUnauthorised(true);
      return;
    }
    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/technician/bookings`);
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      setError("Failed to load bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchByStatus = async (status: string) => {
    setActiveTab(status);
    if (status === "ALL") {
      fetchBookings();
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await authFetch(
        `${API_BASE}/technician/bookings?status=${status}`,
      );
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnauthorised) {
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
              🔒
            </div>
            <h2 style={s.resultTitle}>Access Denied</h2>
            <p style={s.resultSub}>Only technicians can view this page.</p>
            <button style={s.btnPrimary} onClick={() => router.push("/")}>
              ← Go Home
            </button>
          </div>
        </div>
        <style>{spin}</style>
      </div>
    );
  }

  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const scheduled = bookings.filter((b) => b.status === "ACCEPTED").length;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;

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
              <Link href="/technician/dashboard" style={s.breadcrumbLink}>
                Dashboard
              </Link>
              <span style={s.breadcrumbSep}>•</span>
              <Link href="/technician/availability" style={s.breadcrumbLink}>
                Availability
              </Link>
              <span style={s.breadcrumbSep}>•</span>
              <span style={s.breadcrumbActive}>Bookings</span>
            </div>
          </div>
          <button
            style={s.signOutBtn}
            onClick={() => {
              localStorage.removeItem("accessToken");
              router.push("/");
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main style={s.main}>
        {/* ── Hero ── */}
        <section style={s.hero}>
          <div style={s.heroOverlay} />
          <div style={s.heroContent}>
            <div style={s.heroBadge}>
              <span style={s.heroBadgeDot} />
              My Assigned Bookings
            </div>
            <h1 style={s.heroTitle}>Your Work Schedule</h1>
            <p style={s.heroSub}>
              View all service tickets assigned to you. Track status, review
              customer details, and stay on top of your upcoming jobs.
            </p>
          </div>
          {/* ── Stat tiles ── */}
          <div style={s.heroStats}>
            <HeroStat label="Total" value={bookings.length} color="#a7f3d0" />
            <div style={s.heroStatDivider} />
            <HeroStat label="Pending" value={pending} color="#fde68a" />
            <div style={s.heroStatDivider} />
            <HeroStat label="Scheduled" value={scheduled} color="#a7f3d0" />
            <div style={s.heroStatDivider} />
            <HeroStat label="Cancelled" value={cancelled} color="#fca5a5" />
          </div>
        </section>

        {/* ── Status filter tabs ── */}
        <div style={s.tabsWrap}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              style={{
                ...s.tabBtn,
                ...(activeTab === tab ? s.tabBtnActive : {}),
              }}
              onClick={() => fetchByStatus(tab)}
            >
              {tab === "ALL"
                ? "All Bookings"
                : tab.charAt(0) + tab.slice(1).toLowerCase()}
              {tab !== "ALL" && (
                <span
                  style={{
                    ...s.tabCount,
                    background: activeTab === tab ? "#047857" : "#e2e8f0",
                    color: activeTab === tab ? "#fff" : "#64748b",
                  }}
                >
                  {tab === "PENDING"
                    ? pending
                    : tab === "ACCEPTED"
                      ? scheduled
                      : cancelled}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading bookings…</p>
          </div>
        ) : error ? (
          <div style={s.errorBanner}>⚠ {error}</div>
        ) : bookings.length === 0 ? (
          <div style={s.emptyWrap}>
            <div style={s.emptyIcon}>📋</div>
            <h3 style={s.emptyTitle}>No bookings found</h3>
            <p style={s.emptySub}>
              {activeTab === "ALL"
                ? "You have no assigned bookings yet."
                : `No ${activeTab.toLowerCase()} bookings at the moment.`}
            </p>
          </div>
        ) : (
          <div style={s.grid}>
            {bookings.map((booking) => {
              const st = statusMeta(booking.status);
              return (
                <article key={booking.id} style={s.card}>
                  {/* Card header */}
                  <div style={s.cardHeader}>
                    <div style={s.cardHeaderLeft}>
                      <div style={s.ticketNum}>{booking.ticketNumber}</div>
                      <div style={s.serviceType}>{booking.serviceType}</div>
                    </div>
                    <span
                      style={{
                        ...s.statusBadge,
                        color: st.color,
                        background: st.bg,
                        border: `1px solid ${st.border}`,
                      }}
                    >
                      {st.label}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={s.cardBody}>
                    <InfoRow
                      icon="👤"
                      label="Customer"
                      value={booking.customerName}
                    />
                    <InfoRow
                      icon="📅"
                      label="Date"
                      value={formatDate(booking.scheduledDate)}
                    />
                    <InfoRow
                      icon="🕐"
                      label="Time"
                      value={`${formatTime(booking.scheduledStartTime)} – ${formatTime(booking.scheduledEndTime)}`}
                    />
                    <InfoRow
                      icon="🏷️"
                      label="Type"
                      value={
                        booking.customerType === "COMPANY"
                          ? "Company"
                          : "Individual"
                      }
                    />
                    {booking.status === "CANCELLED" &&
                      booking.cancellationReason && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 10,
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              color: "#f87171",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            Reason
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#dc2626",
                              fontWeight: 600,
                              fontStyle: "italic",
                            }}
                          >
                            "{booking.cancellationReason}"
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Card footer */}
                  <div style={s.cardFooter}>
                    <span style={s.createdAt}>
                      Raised{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      style={s.detailBtn}
                      onClick={() =>
                        router.push(`/technician/bookings/${booking.id}`)
                      }
                    >
                      View Details →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer style={s.footer}>
        © {new Date().getFullYear()} RMIS · Ministry of Environment
      </footer>
      <style>{spin}</style>
    </div>
  );
}

function HeroStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div style={s.infoRow}>
      <div style={s.infoIcon}>{icon}</div>
      <div>
        <div style={s.infoLabel}>{label}</div>
        <div style={s.infoVal}>{value}</div>
      </div>
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

  // header
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid #e2e8f0",
  },
  headerInner: {
    maxWidth: 1200,
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

  // main
  main: { maxWidth: 1200, margin: "0 auto", padding: "20px 16px 60px" },

  // hero
  hero: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
    padding: "24px 20px 20px",
    marginBottom: 28,
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse 70% 80% at 80% 50%, rgba(255,255,255,0.04), transparent)",
  },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 560 },
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
    textTransform: "uppercase",
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
    fontSize: 36,
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 10px",
    lineHeight: 1.15,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
    margin: 0,
  },
  heroStats: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    background: "rgba(255,255,255,0.15)",
  },

  // tabs
  tabsWrap: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    transition: "all 0.15s",
  },
  tabBtnActive: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
  },
  tabCount: {
    borderRadius: 999,
    padding: "1px 8px",
    fontSize: 11,
    fontWeight: 700,
  },

  // loading / error / empty
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
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
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "14px 20px",
    fontSize: 13,
    color: "#dc2626",
    fontWeight: 600,
  },
  emptyWrap: { textAlign: "center", padding: "72px 20px" },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 8px",
  },
  emptySub: { fontSize: 14, color: "#94a3b8", margin: 0 },

  // grid & card
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    background: "linear-gradient(135deg, #064e3b, #047857)",
    padding: "18px 20px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardHeaderLeft: { flex: 1, minWidth: 0 },
  ticketNum: {
    fontSize: 13,
    fontWeight: 700,
    color: "#a7f3d0",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    padding: "3px 10px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  cardBody: {
    padding: "16px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  infoRow: { display: "flex", alignItems: "center", gap: 10 },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#f0fdf4",
    border: "1px solid #d1fae5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 10,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 1,
  },
  infoVal: { fontSize: 13, color: "#1e293b", fontWeight: 600 },

  cardFooter: {
    padding: "12px 20px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createdAt: { fontSize: 11, color: "#cbd5e1" },
  detailBtn: {
    background: "#047857",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },

  // result / center
  centerWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  resultCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: "28px 20px",
    textAlign: "center",
    maxWidth: 380,
    width: "100%",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
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
    textAlign: "center",
    padding: "20px 16px",
    borderTop: "1px solid #f1f5f9",
    fontSize: 12,
    color: "#cbd5e1",
  },
};
