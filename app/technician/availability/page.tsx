"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getRole } from "@/services/authService";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";
const PRIMARY = "#047857";
const HERO_IMAGE = "/Gemini_Generated_Image_3kc8133kc8133kc8.png";

interface AvailabilitySlot {
  id: number;
  technicianId: number;
  technicianName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface SlotForm {
  date: string;
  startTime: string;
  endTime: string;
}

const emptyForm: SlotForm = { date: "", startTime: "", endTime: "" };

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

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":");
  const hour = Number.parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function getTodayString() {
  const now = new Date();
  now.setDate(now.getDate() + 1); // tomorrow minimum
  return now.toISOString().split("T")[0];
}

function groupByDate(slots: AvailabilitySlot[]) {
  return slots.reduce<Record<string, AvailabilitySlot[]>>((acc, slot) => {
    (acc[slot.date] ||= []).push(slot);
    return acc;
  }, {});
}

function statusMeta(status: string) {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Available",
        badge: {
          background: "#ecfdf5",
          color: PRIMARY,
          border: "1px solid #a7f3d0",
        },
        iconBg: "#d1fae5",
        icon: "✓",
      };
    case "BOOKED":
      return {
        label: "Booked",
        badge: {
          background: "#fff7ed",
          color: "#b45309",
          border: "1px solid #fed7aa",
        },
        iconBg: "#ffedd5",
        icon: "🔒",
      };
    default:
      return {
        label: status,
        badge: {
          background: "#eff6ff",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        },
        iconBg: "#dbeafe",
        icon: "•",
      };
  }
}

export default function TechnicianAvailabilityPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorised, setIsUnauthorised] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<AvailabilitySlot | null>(
    null,
  );

  const [form, setForm] = useState<SlotForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "ROLE_TECHNICIAN" && role !== "TECHNICIAN") {
      setIsUnauthorised(true);
      return;
    }

    fetchSlots();
  }, [router]);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/technician/availability`);
      if (!res.ok) throw new Error("Failed to fetch availability");
      setSlots(await res.json());
    } catch {
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    window.setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setFormError("");
    setShowAddModal(true);
  };

  const openEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setForm({
      date: slot.date,
      startTime: slot.startTime.slice(0, 5),
      endTime: slot.endTime.slice(0, 5),
    });
    setFormError("");
  };

  const handleAdd = async () => {
    setFormError("");
    if (!form.date || !form.startTime || !form.endTime) {
      setFormError("All fields are required.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError("End time must be later than start time.");
      return;
    }

    setFormLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/technician/availability`, {
        method: "POST",
        body: JSON.stringify({
          date: form.date,
          startTime: `${form.startTime}:00`,
          endTime: `${form.endTime}:00`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to add slot");

      setShowAddModal(false);
      setForm(emptyForm);
      showSuccess("Availability slot added successfully.");
      fetchSlots();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingSlot) return;

    setFormError("");
    if (!form.date || !form.startTime || !form.endTime) {
      setFormError("All fields are required.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError("End time must be later than start time.");
      return;
    }

    setFormLoading(true);
    try {
      const res = await authFetch(
        `${API_BASE}/technician/availability/${editingSlot.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            date: form.date,
            startTime: `${form.startTime}:00`,
            endTime: `${form.endTime}:00`,
          }),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update slot");

      setEditingSlot(null);
      setForm(emptyForm);
      showSuccess("Availability slot updated successfully.");
      fetchSlots();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSlot) return;

    setFormLoading(true);
    try {
      const res = await authFetch(
        `${API_BASE}/technician/availability/${deletingSlot.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Failed to delete slot");

      setDeletingSlot(null);
      showSuccess("Slot removed successfully.");
      fetchSlots();
    } catch {
      setFormError("Failed to delete slot.");
    } finally {
      setFormLoading(false);
    }
  };

  if (isUnauthorised) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 text-center shadow-sm max-w-md w-full">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
            🔒
          </div>
          <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-500">
            Only technicians can manage availability.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            ← Go Home
          </Link>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(slots);
  const dateKeys = Object.keys(grouped).sort();
  const availableCount = slots.filter((s) => s.status === "AVAILABLE").length;
  const bookedCount = slots.filter((s) => s.status === "BOOKED").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(4,120,87,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_28%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)]" />

      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg text-emerald-700 ring-1 ring-emerald-100">
              🛠️
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wide text-slate-900">
                RMIS
              </div>
              <div className="text-xs text-slate-500">
                Technician Availability
              </div>
            </div>
            <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex">
              <span>•</span>
              <Link
                href="/technician/dashboard"
                className="font-medium text-slate-500 transition hover:text-emerald-700"
              >
                Dashboard
              </Link>
              <span>•</span>
              <span className="font-semibold text-emerald-700">
                Availability
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              router.push("/login");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${HERO_IMAGE})`,
              filter: "saturate(0.95) contrast(1.02)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/72 to-slate-950/35" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,120,87,0.18),transparent_40%)]" />

          <div className="relative grid min-h-[260px] gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.9fr] lg:p-10">
            <div className="max-w-2xl h-full flex flex-col text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Availability management
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Manage your schedule with a cleaner, faster workflow.
              </h1>

              <div className="mt-auto pt-4 flex flex-wrap gap-3">
                <button
                  onClick={openAdd}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700"
                >
                  <span className="text-lg leading-none">+</span>
                  Add Slot
                </button>
                <div className="inline-flex items-center rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
                  <span className="mr-2 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  {slots.length} total slots
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                  Today’s overview
                </div>
                <div className="mt-2 text-3xl font-black">{slots.length}</div>
                <div className="text-sm text-white/75">
                  Scheduled availability slots
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoTile
                  label="Available"
                  value={availableCount}
                  tone="emerald"
                />
                <InfoTile label="Booked" value={bookedCount} tone="amber" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-sm text-slate-200">
                Keep tomorrow and the rest of the week clear by setting clean
                time windows that clients can book instantly.
              </div>
            </div>
          </div>
        </section>

        {successMsg && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">
            ✅ {successMsg}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Slots"
            value={slots.length}
            icon="📅"
            accent={PRIMARY}
            bg="rgba(4,120,87,0.08)"
          />
          <StatCard
            label="Available"
            value={availableCount}
            icon="✅"
            accent="#16a34a"
            bg="rgba(22,163,74,0.08)"
          />
          <StatCard
            label="Booked"
            value={bookedCount}
            icon="🔒"
            accent="#b45309"
            bg="rgba(180,83,9,0.08)"
          />
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                My Availability
              </h2>
              <p className="text-sm text-slate-500">
                Manage your future booking windows and keep your calendar tidy.
              </p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              + Add Slot
            </button>
          </div>

          {isLoading ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">
                  ⏳
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  Loading slots...
                </p>
              </div>
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl text-emerald-700">
                📆
              </div>
              <h3 className="text-xl font-black text-slate-900">
                No availability set yet
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                Add your first availability slot so clients can start booking
                time with you.
              </p>
              <button
                onClick={openAdd}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
              >
                + Add First Slot
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {dateKeys.map((date) => {
                const slotsForDate = grouped[date];
                return (
                  <div
                    key={date}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
                      <div>
                        <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                          {formatDate(date)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 sm:p-5">
                      {slotsForDate.map((slot) => {
                        const meta = statusMeta(slot.status);

                        return (
                          <div
                            key={slot.id}
                            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black"
                                style={{ background: meta.iconBg }}
                              >
                                {meta.icon}
                              </div>
                              <div>
                                <div className="text-base font-extrabold text-slate-900">
                                  {formatTime(slot.startTime)} –{" "}
                                  {formatTime(slot.endTime)}
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                  Slot ID #{slot.id}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                              <span
                                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]"
                                style={meta.badge as CSSProperties}
                              >
                                {meta.label}
                              </span>

                              {slot.status !== "BOOKED" && (
                                <>
                                  <button
                                    onClick={() => openEdit(slot)}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeletingSlot(slot);
                                      setFormError("");
                                    }}
                                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-8 flex flex-col gap-3 border-t border-slate-200 px-1 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 Ministry of Environment. All Rights Reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="transition hover:text-emerald-700">
              Privacy Policy
            </Link>
            <Link href="#" className="transition hover:text-emerald-700">
              Help Center
            </Link>
          </div>
        </footer>
      </main>

      {showAddModal && (
        <ModalOverlay onClose={() => setShowAddModal(false)}>
          <ModalHeading
            title="Add Availability Slot"
            subtitle="Choose a future date and your available time window."
          />
          <SlotForm
            form={form}
            onChange={setForm}
            error={formError}
            loading={formLoading}
            onSubmit={handleAdd}
            onCancel={() => setShowAddModal(false)}
            submitLabel="Add Slot"
          />
        </ModalOverlay>
      )}

      {editingSlot && (
        <ModalOverlay onClose={() => setEditingSlot(null)}>
          <ModalHeading
            title="Edit Availability Slot"
            subtitle={`Update the date or time for slot #${editingSlot.id}.`}
          />
          <SlotForm
            form={form}
            onChange={setForm}
            error={formError}
            loading={formLoading}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSlot(null)}
            submitLabel="Save Changes"
          />
        </ModalOverlay>
      )}

      {deletingSlot && (
        <ModalOverlay onClose={() => setDeletingSlot(null)}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
              🗑️
            </div>
            <h3 className="text-2xl font-black text-slate-900">Remove Slot?</h3>
            <p className="mt-2 text-sm text-slate-500">
              {formatDate(deletingSlot.date)}
            </p>
            <p className="mt-1 text-base font-bold text-slate-700">
              {formatTime(deletingSlot.startTime)} –{" "}
              {formatTime(deletingSlot.endTime)}
            </p>
            <p className="mt-3 text-sm text-rose-600">
              This action cannot be undone.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => setDeletingSlot(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={formLoading}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {formLoading ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function InfoTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber";
}) {
  const styles =
    tone === "emerald"
      ? { bg: "rgba(4,120,87,0.18)", text: "#d1fae5" }
      : { bg: "rgba(180,83,9,0.18)", text: "#ffedd5" };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black" style={{ color: styles.text }}>
        {value}
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full"
          style={{
            background: styles.text,
            width: tone === "emerald" ? "72%" : "48%",
          }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  bg,
}: {
  label: string;
  value: number;
  icon: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
          style={{ background: bg }}
        >
          {icon}
        </div>
        <div>
          <div className="text-3xl font-black" style={{ color: accent }}>
            {value}
          </div>
          <div className="text-sm font-semibold text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function ModalHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 pr-10">
      <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
        Technician availability
      </div>
      <h3 className="mt-3 text-2xl font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
    </div>
  );
}

function SlotForm({
  form,
  onChange,
  error,
  loading,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: SlotForm;
  onChange: (f: SlotForm) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #dbe3ea",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    color: "#0f172a",
    background: "#f8fafc",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 800,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  };

  return (
    <div>
      <div className="mb-4">
        <label style={labelStyle}>Date</label>
        <input
          type="date"
          min={getTodayString()}
          value={form.date}
          onChange={(e) => onChange({ ...form, date: e.target.value })}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label style={labelStyle}>Start Time</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => onChange({ ...form, startTime: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>End Time</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => onChange({ ...form, endTime: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
