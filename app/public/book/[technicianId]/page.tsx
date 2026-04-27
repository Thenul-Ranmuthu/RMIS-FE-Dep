"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  raiseTicketAsUser,
  raiseTicketAsCompany,
} from "@/services/serviceTicketService";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface AvailabilitySlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  technicianId?: number;
  technicianName?: string;
}

interface TechnicianProfile {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
  skillLevel?: string;
  district?: string;
  yearsOfExperience?: number;
  phoneNumber?: string;
}

const SERVICE_TYPES = [
  "AC Installation",
  "AC Repair",
  "AC Gas Refill",
  "AC Servicing / Cleaning",
  "AC Inspection",
  "Gas Leak Detection",
  "Gas Pipe Installation",
  "Gas Appliance Repair",
  "General HVAC Service",
  "Other",
];

function groupByDate(
  slots: AvailabilitySlot[],
): Record<string, AvailabilitySlot[]> {
  return slots.reduce<Record<string, AvailabilitySlot[]>>((acc, s) => {
    (acc[s.date] ||= []).push(s);
    return acc;
  }, {});
}

function formatDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function BookTechnicianPage() {
  const { technicianId } = useParams<{ technicianId: string }>();
  const router = useRouter();

  // Auth
  const [role, setRole] = useState<"CUSTOMER" | "COMPANY" | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Technician + slots
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState("");

  // Form state
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successTicket, setSuccessTicket] = useState<{
    ticketNumber: string;
    id: number;
  } | null>(null);

  // ── Auth check ────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!raw || !token) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const r = (parsed.role || "").toUpperCase();
      if (r === "CUSTOMER" || r === "ROLE_CUSTOMER" || r === "PUBLIC USER") {
        setRole("CUSTOMER");
      } else if (r === "COMPANY" || r === "ROLE_COMPANY") {
        setRole("COMPANY");
      } else {
        console.warn("User has insufficient permissions or invalid role:", r);
        router.push("/unauthorised");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  // ── Fetch technician + available slots ────────────────────────
  useEffect(() => {
    if (!authChecked || !technicianId) return;

    const fetchData = async () => {
      setLoadingSlots(true);
      setSlotsError("");
      try {
        const [techRes, slotsRes] = await Promise.all([
          fetch(`${API_BASE}/public/technician/${technicianId}`),
          fetch(`${API_BASE}/public/technicians/${technicianId}/availability`),
        ]);
        if (!techRes.ok) throw new Error("Technician not found");
        const techData = await techRes.json();
        setTechnician(techData);

        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          setSlots(
            Array.isArray(slotsData)
              ? slotsData.filter(
                  (s: AvailabilitySlot) => s.status === "AVAILABLE",
                )
              : [],
          );
        }
      } catch (e: unknown) {
        setSlotsError((e as Error).message || "Failed to load availability.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchData();
  }, [authChecked, technicianId]);

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setSubmitError("Please select a time slot.");
      return;
    }
    if (!serviceType) {
      setSubmitError("Please select a service type.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const fn = role === "COMPANY" ? raiseTicketAsCompany : raiseTicketAsUser;
      const ticket = await fn(selectedSlot.id, serviceType, description);
      setSuccessTicket({ ticketNumber: ticket.ticketNumber, id: ticket.id });
    } catch (err: unknown) {
      const errObj = err as Record<string, string>;
      setSubmitError(
        errObj?.error ||
          "Failed to create booking. The slot may already be taken.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const groupedSlots = groupByDate(slots);
  const dateKeys = Object.keys(groupedSlots).sort();

  // ── Success screen ────────────────────────────────────────────
  const dashPath = role === "COMPANY" ? "/company/dashboard" : "/public-user";

  useEffect(() => {
    if (successTicket) {
      const timer = setTimeout(() => {
        router.push(dashPath);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successTicket, dashPath, router]);

  if (successTicket) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 font-['Public_Sans']">
        <div className="bg-[#111827] p-6 sm:p-10 rounded-[24px] sm:rounded-[40px] shadow-2xl border border-emerald-500/20 max-w-xl w-full text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600 shadow-[0_0_20px_rgba(5,150,105,0.4)]" />

          <div className="mb-8 flex justify-center">
            <div className="bg-emerald-500/10 rounded-full p-6 relative">
              <span className="material-symbols-outlined text-6xl text-emerald-400 animate-bounce">
                task_alt
              </span>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-20" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-50 tracking-tight mb-4">
            Booking Successful!
          </h2>
          <p className="text-slate-400 font-medium mb-8 leading-relaxed max-w-sm mx-auto">
            Your ticket{" "}
            <span className="text-emerald-400 font-black tracking-widest italic">
              #{successTicket.ticketNumber}
            </span>{" "}
            has been confirmed. The technician has been notified via email.
          </p>

          <div className="bg-slate-800/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 sm:mb-10 text-left border border-white/5 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">
                  Service
                </p>
                <p className="font-bold text-slate-100">{serviceType}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">
                  Status
                </p>
                <p className="font-bold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Pending Review
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg shadow-emerald-900/40 active:scale-[0.98] flex items-center justify-center gap-3"
              onClick={() => router.push(dashPath)}
            >
              Go to Dashboard
            </button>
            <p className="text-[10px] text-emerald-500/40 font-black uppercase tracking-[0.2em] mt-4 animate-pulse">
              Redirecting in 5 seconds
            </p>
          </div>
        </div>
        <style jsx global>
          {pageStyles}
        </style>
      </main>
    );
  }

  // ── Loading / Error ──────────────────────────────────────────
  if (!authChecked || loadingSlots) {
    return (
      <div className="book-page">
        <div className="center-wrap">
          <div className="spinner" />
          <p className="loading-txt">Loading availability...</p>
        </div>
        <style jsx global>
          {pageStyles}
        </style>
      </div>
    );
  }

  if (slotsError) {
    return (
      <div className="book-page">
        <div className="center-wrap">
          <div className="err-card">
            <p className="err-title">Could not load data</p>
            <p className="err-msg">{slotsError}</p>
            <button className="btn-back" onClick={() => router.back()}>
              ← Go Back
            </button>
          </div>
        </div>
        <style jsx global>
          {pageStyles}
        </style>
      </div>
    );
  }

  const initials = technician
    ? `${technician.firstName?.[0] || ""}${technician.lastName?.[0] || ""}`.toUpperCase()
    : "T";

  return (
    <div className="book-page">
      <div className="bg-texture" />

      <div className="book-layout">
        <div className="layout-header">
          <button className="back-btn" onClick={() => router.back()}>
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Back
          </button>
        </div>

        {/* ── Left: Technician profile ────────────────────── */}
        <aside className="tech-pane">
          <div className="tech-avatar">{initials}</div>
          <h2 className="tech-name">
            {technician?.firstName} {technician?.lastName}
          </h2>
          <p className="tech-spec">
            {technician?.specialization || "General Technician"}
          </p>

          <div className="tech-meta-list">
            {technician?.skillLevel && (
              <div className="tech-meta-row">
                <span className="meta-icon">⭐</span>
                <span className="meta-label">Skill Level</span>
                <span className="meta-val">
                  {technician.skillLevel.charAt(0) +
                    technician.skillLevel.slice(1).toLowerCase()}
                </span>
              </div>
            )}
            {technician?.yearsOfExperience !== undefined && (
              <div className="tech-meta-row">
                <span className="meta-icon">⌛</span>
                <span className="meta-label">Experience</span>
                <span className="meta-val">
                  {technician.yearsOfExperience} yrs
                </span>
              </div>
            )}
            {technician?.district && (
              <div className="tech-meta-row">
                <span className="meta-icon">📍</span>
                <span className="meta-label">District</span>
                <span className="meta-val">{technician.district}</span>
              </div>
            )}
            {technician?.phoneNumber && (
              <div className="tech-meta-row">
                <span className="meta-icon">📞</span>
                <span className="meta-label">Contact</span>
                <span className="meta-val">{technician.phoneNumber}</span>
              </div>
            )}
          </div>

          {slots.length > 0 && (
            <div className="slot-count-badge">
              {slots.length} slot{slots.length !== 1 ? "s" : ""} available
            </div>
          )}
        </aside>

        {/* ── Right: Booking form ────────────────────────── */}
        <div className="form-pane">
          <div className="form-header">
            <h1>Book a Service Appointment</h1>
            <p>
              Select an available time slot, choose your service type, and
              confirm your booking.
            </p>
            <div className="step-breadcrumb">
              <span className="crumb-active">Step 1 of 3</span>
              <span className="crumb-sep"> · </span>
              <span className="crumb-active">Time</span>
              <span className="crumb-sep"> → </span>
              <span className="crumb-dim">Service</span>
              <span className="crumb-sep"> → </span>
              <span className="crumb-dim">Confirm</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Step 1: Pick a slot ────────────────── */}
            <div className="form-section">
              <div className="section-label">
                <span className="step-num">1</span>
                Select a Time Slot
              </div>

              {slots.length === 0 ? (
                <div className="no-slots">
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    stroke="#64748b"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>
                    No available slots for this technician right now. Please
                    check back later.
                  </p>
                </div>
              ) : (
                <div className="slots-container">
                  {dateKeys.map((date) => (
                    <div key={date} className="date-group">
                      <div className="date-header">{formatDate(date)}</div>
                      <div className="slots-row">
                        {groupedSlots[date].map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`slot-chip${selectedSlot?.id === slot.id ? " slot-chip-selected" : ""}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {formatTime(slot.startTime)} –{" "}
                            {formatTime(slot.endTime)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSlot && (
                <div className="selected-slot-badge">
                  ✓ Selected: {formatDate(selectedSlot.date)} ·{" "}
                  {formatTime(selectedSlot.startTime)} –{" "}
                  {formatTime(selectedSlot.endTime)}
                </div>
              )}
            </div>

            {/* ── Step 2: Service type ────────────────── */}
            <div className="form-section">
              <div className="section-label">
                <span className="step-num">2</span>
                Service Type <span className="required">*</span>
              </div>
              <div className="form-select-wrap">
                <span className="form-select-icon">🔧</span>
                <select
                  id="serviceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="" disabled>
                    Choose a service
                  </option>
                  {SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Step 3: Description ──────────────────── */}
            <div className="form-section">
              <div className="section-label">
                <span className="step-num">3</span>
                Description <span className="optional">(optional)</span>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Describe the issue or what service you need..."
                className="form-textarea"
              />
              <div className="char-count">{description.length}/500</div>
            </div>

            {/* ── Error ───────────────────────────────── */}
            {submitError && (
              <div className="submit-error">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="#f87171"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span>{submitError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = "/login";
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#f87171",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "bold",
                      textAlign: "left",
                    }}
                  >
                    Session Expired? Click here to Log In Again
                  </button>
                </div>
              </div>
            )}

            {/* ── Submit ──────────────────────────────── */}
            <button
              type="submit"
              disabled={submitting || slots.length === 0 || !selectedSlot}
              className="submit-btn"
              id="submit-booking"
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Creating Booking...
                </>
              ) : (
                <>
                  Confirm & Book Appointment
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>
        {pageStyles}
      </style>
    </div>
  );
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .book-page {
    min-height: 100vh;
    background: #0d1f12;
    font-family: 'Inter', system-ui, sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .bg-texture {
    position: fixed; inset: 0;
    background-color: #0d1f12;
    background-size: cover; background-position: center;
    opacity: 0.18; z-index: 0; pointer-events: none;
  }

  .book-layout {
    display: grid; grid-template-columns: 300px 1fr; gap: 28px;
    max-width: 1060px; margin: 0 auto; padding: 36px 28px 80px;
    position: relative; z-index: 10; align-items: start;
  }

  .layout-header { grid-column: 1 / -1; margin-bottom: 4px; }

  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(74,222,128,0.18);
    color: #bbf7d0; border-radius: 10px; padding: 9px 18px;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .back-btn:hover { background: rgba(74,222,128,0.1); color: #f0fdf4; transform: translateX(-3px); }

  .tech-pane {
    background: #ffffff; border-radius: 28px; padding: 36px 22px 28px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    position: sticky; top: 32px; box-shadow: 0 24px 60px rgba(0,0,0,0.45);
  }

  .tech-avatar {
    width: 88px; height: 88px; border-radius: 50%;
    background: linear-gradient(135deg, #14532d, #166534);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; font-weight: 800; color: #fff; margin-bottom: 18px;
    border: 3px solid rgba(74,222,128,0.3); box-shadow: 0 8px 24px rgba(22,101,52,0.35);
  }

  .tech-name { font-size: 20px; font-weight: 800; color: #0d1f12; margin-bottom: 4px; }
  .tech-spec { font-size: 11px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 22px; }

  .tech-meta-list { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .tech-meta-row {
    display: flex; align-items: center; gap: 10px;
    background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px;
    padding: 12px 14px; text-align: left;
  }
  .meta-icon { font-size: 14px; flex-shrink: 0; }
  .meta-label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; flex: 1; }
  .meta-val { font-size: 13px; color: #0d1f12; font-weight: 700; }
  .slot-count-badge { font-size: 12px; color: #64748b; font-weight: 500; margin-top: 10px; }

  .form-pane {
    background: #ffffff; border-radius: 28px; padding: 44px 48px 48px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4); color: #0f172a;
  }

  .form-header { margin-bottom: 22px; }
  .form-header h1 { font-size: 26px; font-weight: 800; color: #0d1f12; margin-bottom: 8px; letter-spacing: -0.02em; }
  .form-header p { font-size: 14px; color: #475569; line-height: 1.55; font-weight: 500; margin-bottom: 16px; }

  .step-breadcrumb {
    display: inline-flex; align-items: center; gap: 5px;
    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 999px;
    padding: 7px 16px; font-size: 12px; font-weight: 600; color: #166534; margin-bottom: 24px;
  }
  .crumb-active { color: #15803d; font-weight: 700; }
  .crumb-sep { color: #86efac; }
  .crumb-dim { color: #86efac; }

  .form-section { margin-bottom: 28px; }
  .section-label {
    display: flex; align-items: center; gap: 12px;
    font-size: 11px; font-weight: 700; color: #0d1f12;
    text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 14px;
  }
  .step-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 8px; background: #14532d;
    color: #fff; font-size: 13px; font-weight: 800; flex-shrink: 0;
  }
  .required { color: #ef4444; margin-left: 2px; }
  .optional { color: #94a3b8; font-size: 10px; font-weight: 500; text-transform: none; letter-spacing: 0; }

  .slots-container { display: flex; flex-direction: column; gap: 16px; }
  .date-header {
    font-size: 11px; font-weight: 800; color: #374151; text-transform: uppercase;
    letter-spacing: 0.14em; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;
  }
  .date-header::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
  .slots-row { display: flex; flex-wrap: wrap; gap: 10px; }

  .slot-chip {
    background: #f8fafc; border: 1.5px solid #d1d5db; color: #374151;
    border-radius: 12px; padding: 11px 18px; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.18s; white-space: nowrap;
  }
  .slot-chip:hover:not(.slot-chip-selected) { border-color: #16a34a; background: #f0fdf4; color: #14532d; transform: translateY(-2px); }
  .slot-chip-selected {
    background: #14532d; border-color: #14532d; color: #fff;
    box-shadow: 0 6px 16px rgba(20,83,45,0.28); transform: translateY(-2px);
  }

  .no-slots {
    display: flex; align-items: center; gap: 12px;
    background: #fafafa; border: 1.5px dashed #d1d5db; border-radius: 12px;
    padding: 18px; color: #6b7280; font-size: 13px; font-weight: 500;
  }
  .selected-slot-badge { margin-top: 10px; font-size: 12px; color: #16a34a; font-weight: 600; display: inline-block; }

  .form-select-wrap { position: relative; }
  .form-select-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 15px; pointer-events: none; }

  .form-select, .form-textarea {
    width: 100%; background: #f8fafc; border: 1.5px solid #d1d5db; color: #0f172a;
    border-radius: 14px; padding: 14px 16px; font-size: 14px; font-weight: 600;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    appearance: none; font-family: 'Inter', sans-serif;
  }
  .form-select {
    padding-left: 42px; cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='4' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center; background-size: 12px;
  }
  .form-select:focus, .form-textarea:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); background: #fff; }
  .form-textarea { min-height: 128px; resize: vertical; }
  .form-textarea::placeholder { color: #9ca3af; font-weight: 400; }
  .char-count { font-size: 11px; color: #9ca3af; text-align: right; margin-top: 6px; font-weight: 500; }

  .submit-btn {
    width: 100%; background: linear-gradient(135deg, #14532d 0%, #166534 100%);
    color: #ffffff; border-radius: 16px; padding: 18px 0; margin-top: 18px;
    font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.25s;
    border: none; box-shadow: 0 10px 28px rgba(20,83,45,0.35);
    display: flex; align-items: center; justify-content: center; gap: 10px; letter-spacing: 0.02em;
  }
  .submit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #166534 0%, #15803d 100%); transform: translateY(-2px); box-shadow: 0 16px 40px rgba(20,83,45,0.45); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.5); }
  .btn-spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; }

  .submit-error {
    display: flex; align-items: center; gap: 8px;
    background: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c;
    border-radius: 12px; padding: 12px 16px; font-size: 13px; font-weight: 600; margin-bottom: 16px;
  }

  .center-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 14px; }
  .spinner { width: 48px; height: 48px; border-radius: 50%; border: 4px solid rgba(52,211,153,0.18); border-top-color: #34d399; animation: spin 0.9s linear infinite; }
  .loading-txt { color: #94a3b8; font-size: 13px; margin: 0; }
  .err-card { background: #111827; border: 1px solid rgba(248,113,113,0.2); border-radius: 16px; padding: 32px 28px; text-align: center; max-width: 360px; }
  .err-title { font-size: 18px; font-weight: 700; color: #f8fafc; margin: 0 0 8px; }
  .err-msg { font-size: 13px; color: #94a3b8; margin: 0 0 20px; }
  .btn-back { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #94a3b8; border-radius: 8px; padding: 9px 20px; font-size: 13px; cursor: pointer; transition: all 0.15s ease; }
  .btn-back:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .book-layout { grid-template-columns: 260px 1fr; gap: 20px; padding: 28px 20px 60px; }
    .form-pane { padding: 36px 32px 40px; }
    .form-header h1 { font-size: 22px; }
  }
  @media (max-width: 768px) {
    .book-layout { grid-template-columns: 1fr; padding: 24px 16px 40px; gap: 16px; }
    .tech-pane { position: static; flex-direction: row; flex-wrap: wrap; justify-content: center; padding: 24px 20px; border-radius: 20px; gap: 16px; }
    .tech-avatar { width: 64px; height: 64px; font-size: 22px; margin-bottom: 0; }
    .tech-name { font-size: 18px; }
    .tech-meta-list { flex-direction: row; flex-wrap: wrap; gap: 6px; }
    .tech-meta-row { flex: 1 1 calc(50% - 4px); min-width: 130px; padding: 10px 12px; border-radius: 10px; }
    .form-pane { padding: 28px 20px 32px; border-radius: 20px; }
    .form-header h1 { font-size: 20px; }
    .form-header p { font-size: 13px; }
    .slot-chip { padding: 9px 14px; font-size: 12px; }
    .form-select, .form-textarea { padding: 12px 14px; font-size: 13px; }
    .form-select { padding-left: 36px; }
    .submit-btn { padding: 16px 0; font-size: 14px; border-radius: 14px; }
  }
  @media (max-width: 480px) {
    .book-layout { padding: 16px 12px 32px; }
    .back-btn { padding: 7px 14px; font-size: 12px; }
    .tech-pane { padding: 20px 16px; border-radius: 16px; }
    .tech-avatar { width: 56px; height: 56px; font-size: 18px; }
    .tech-name { font-size: 16px; }
    .tech-spec { font-size: 10px; margin-bottom: 14px; }
    .tech-meta-row { flex: 1 1 100%; }
    .form-pane { padding: 24px 16px 28px; border-radius: 16px; }
    .form-header h1 { font-size: 18px; }
    .step-breadcrumb { font-size: 11px; padding: 5px 12px; }
    .section-label { font-size: 10px; gap: 8px; }
    .step-num { width: 22px; height: 22px; font-size: 11px; border-radius: 6px; }
    .slot-chip { padding: 8px 12px; font-size: 11px; border-radius: 10px; }
    .slots-row { gap: 6px; }
    .form-select, .form-textarea { font-size: 13px; border-radius: 12px; padding: 11px 12px; }
    .form-select { padding-left: 32px; }
    .submit-btn { padding: 14px 0; font-size: 13px; border-radius: 12px; }
    .char-count { font-size: 10px; }
  }
  @media (max-width: 360px) {
    .book-layout { padding: 12px 8px 24px; }
    .tech-pane { padding: 16px 12px; }
    .form-pane { padding: 20px 12px 24px; }
    .form-header h1 { font-size: 16px; }
    .slot-chip { padding: 7px 10px; font-size: 10px; }
  }
`;
