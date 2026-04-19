"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

interface Certification {
  id?: number;
  certificationName: string;
  issuingAuthority?: string;
  fileType?: string;
  fileUrl?: string;
  originalFileName?: string;
}

interface Availability {
  id?: number;
  date?: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Technician {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  district?: string;
  specialization?: string;
  yearsOfExperience?: number;
  skillLevel?: string;
  status?: string;
  registrationDate?: string;
  approvalDate?: string;
  certifications?: Certification[];
}

const sriLankanDistricts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

function formatSlotDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupSlotsByDate(
  slots: Availability[],
): Record<string, Availability[]> {
  return slots.reduce<Record<string, Availability[]>>((acc, slot) => {
    const key = slot.date || "unknown";
    (acc[key] ||= []).push(slot);
    return acc;
  }, {});
}

export default function PublicDirectory() {
  const router = useRouter();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [slotsPopover, setSlotsPopover] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Lazy slots state
  const [slotsCache, setSlotsCache] = useState<Record<number, Availability[]>>(
    {},
  );
  const [loadingSlots, setLoadingSlots] = useState<number | null>(null);
  const [slotsError, setSlotsError] = useState<number | null>(null);

  const PER_PAGE = 6;

  useEffect(() => {
    const fetchTechnicians = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (selectedDate) params.append("date", selectedDate);
        if (selectedSkill) params.append("skillLevel", selectedSkill);
        const url = `${API_BASE}/public/technicians/search${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch technicians");
        const data = await res.json();
        setTechnicians(Array.isArray(data) ? data : []);
        // Clear slot cache when list refreshes — data may have changed
        setSlotsCache({});
        setSlotsPopover(null);
        setSlotsError(null);
      } catch {
        setError("Failed to load technicians. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTechnicians();
  }, [selectedDate, selectedSkill, reloadKey]);

  const handleSlotsClick = async (techId: number) => {
    // Toggle close
    if (slotsPopover === techId) {
      setSlotsPopover(null);
      return;
    }

    // Clear any previous slot error for this tech
    setSlotsError(null);

    // Already cached — just open
    if (slotsCache[techId] !== undefined) {
      setSlotsPopover(techId);
      return;
    }

    // Fetch from lazy endpoint
    setLoadingSlots(techId);
    try {
      const params = selectedDate ? `?date=${selectedDate}` : "";
      const res = await fetch(
        `${API_BASE}/public/technicians/${techId}/availability${params}`,
      );
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setSlotsCache((prev) => ({
        ...prev,
        [techId]: Array.isArray(data) ? data : [],
      }));
      setSlotsPopover(techId);
    } catch {
      setSlotsError(techId);
    } finally {
      setLoadingSlots(null);
    }
  };

  const specs = useMemo(
    () =>
      Array.from(
        new Set(
          technicians
            .map((t) => (t.specialization || "").trim())
            .filter(Boolean),
        ),
      ).sort(),
    [technicians],
  );

  const filtered = useMemo(() => {
    let list = [...technicians];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((t) => {
        const first = (t.firstName || "").toLowerCase();
        const last = (t.lastName || "").toLowerCase();

        return first.startsWith(q) || last.startsWith(q);
      });
    }
    if (selectedSpec)
      list = list.filter((t) => t.specialization === selectedSpec);
    if (selectedDist) list = list.filter((t) => t.district === selectedDist);
    return list;
  }, [technicians, searchTerm, selectedSpec, selectedDist]);

  useEffect(() => {
    setCurrentPage(1);
    setSlotsPopover(null);
  }, [searchTerm, selectedSpec, selectedDist, selectedDate, selectedSkill]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentItems = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpec("");
    setSelectedDist("");
    setSelectedSkill("");
    setSelectedDate("");
  };

  const initials = (f: string, l: string) =>
    `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase() || "T";

  const skillPillClass = (level?: string) => {
    if (level === "SENIOR") return "pill pill-amber";
    if (level === "INTERMEDIATE") return "pill pill-blue";
    return "pill pill-gray";
  };

  const skillLabel = (level?: string) => {
    if (!level) return "Unknown";
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-wrap">
          <div className="spinner" />
          <p>Loading technicians…</p>
        </div>
        <style jsx global>
          {globalStyles}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-image" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="badge">
              <span className="badge-dot" />
              <span>Public Directory</span>
            </div>
            <h1>
              Find Certified
              <br />
              <em>Technicians</em>
            </h1>
            <p>
              Browse verified environmental compliance technicians across Sri
              Lanka.
            </p>
          </div>
        </section>
        <div className="error-wrap">
          <div className="error-card">
            <div className="error-icon">
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#f87171"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button
              className="btn-primary full"
              onClick={() => setReloadKey((v) => v + 1)}
            >
              Try Again
            </button>
          </div>
        </div>
        <style jsx global>
          {globalStyles}
        </style>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot" />
            <span>Public Directory</span>
          </div>
          <h1>
            Find Certified
            <br />
            <em>Technicians</em>
          </h1>
          <p>
            Browse verified environmental compliance technicians across Sri
            Lanka. Filter by date, skill level, specialization, and district.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-val">{technicians.length}</div>
              <div className="stat-lbl">Total</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-val">{specs.length}</div>
              <div className="stat-lbl">Specializations</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-val">{filtered.length}</div>
              <div className="stat-lbl">Matched</div>
            </div>
          </div>
        </div>
      </section>

      <section className="filters-bar">
        <div className="filter-group filter-date">
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="filter-group small">
          <label>Skill Level</label>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">All levels</option>
            <option value="JUNIOR">Junior</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="SENIOR">Senior</option>
          </select>
        </div>
        <div className="filter-group small">
          <label>Specialization</label>
          <select
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
          >
            <option value="">All</option>
            {specs.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group small">
          <label>District</label>
          <select
            value={selectedDist}
            onChange={(e) => setSelectedDist(e.target.value)}
          >
            <option value="">All districts</option>
            {sriLankanDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group search">
          <label>Search</label>
          <div className="search-wrap">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="#64748b"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name…"
            />
          </div>
        </div>
        {(searchTerm ||
          selectedSpec ||
          selectedDist ||
          selectedSkill ||
          selectedDate) && (
          <button className="clear-btn" onClick={clearFilters}>
            Clear
          </button>
        )}
      </section>

      <div className="filter-meta">
        <span>
          Showing <strong>{filtered.length}</strong> technicians
          {selectedDate ? (
            <>
              {" "}
              on <strong>{selectedDate}</strong>
            </>
          ) : null}
        </span>
      </div>

      <main className="grid-wrap">
        {currentItems.length > 0 ? (
          <div className="grid">
            {currentItems.map((tech) => {
              const techSlots = slotsCache[tech.id];
              const isFetching = loadingSlots === tech.id;
              const hasFetchError = slotsError === tech.id;
              const isCached = techSlots !== undefined;
              const slotCount = isCached ? techSlots.length : 0;
              const hasSlots = isCached && slotCount > 0;
              const isOpen = slotsPopover === tech.id;
              const slotsByDate = hasSlots ? groupSlotsByDate(techSlots) : {};
              const dateKeys = Object.keys(slotsByDate)
                .filter((k) => k !== "unknown")
                .sort();
              const unknownSlots = slotsByDate["unknown"] || [];

              return (
                <article key={tech.id} className="card">
                  {isOpen && (
                    <>
                      <div
                        className="backdrop"
                        onClick={() => setSlotsPopover(null)}
                      />
                      <div className="slots-panel">
                        <div className="slots-title">
                          <span>Available slots</span>
                          <button
                            type="button"
                            className="slots-close"
                            onClick={() => setSlotsPopover(null)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="slots-scroll">
                          {hasSlots ? (
                            <>
                              {dateKeys.map((date) => (
                                <div key={date} className="slots-date-group">
                                  <div className="slots-date-header">
                                    <span className="slots-date-dot" />
                                    {formatSlotDate(date)}
                                  </div>
                                  {slotsByDate[date].map((a, idx) => (
                                    <div key={idx} className="slot-row">
                                      <span className="slot-time">
                                        {a.startTime.slice(0, 5)} –{" "}
                                        {a.endTime.slice(0, 5)}
                                      </span>
                                      <span
                                        className={`slot-status-pill slot-status-${a.status.toLowerCase()}`}
                                      >
                                        {a.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                              {unknownSlots.length > 0 && (
                                <div className="slots-date-group">
                                  {unknownSlots.map((a, idx) => (
                                    <div key={idx} className="slot-row">
                                      <span className="slot-time">
                                        {a.startTime.slice(0, 5)} –{" "}
                                        {a.endTime.slice(0, 5)}
                                      </span>
                                      <span
                                        className={`slot-status-pill slot-status-${a.status.toLowerCase()}`}
                                      >
                                        {a.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="slots-empty">
                              No available slots
                              {selectedDate ? ` on ${selectedDate}` : ""}.
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="card-header">
                    <div className="avatar">
                      {initials(tech.firstName, tech.lastName)}
                    </div>
                    <div className="card-header-main">
                      <div className="card-name">
                        {tech.firstName} {tech.lastName}
                      </div>
                      <div className="card-spec">
                        {tech.specialization || "General Technician"}
                      </div>
                      <div className="card-badges">
                        <span className="pill pill-green">Active</span>
                        {tech.skillLevel && (
                          <span className={skillPillClass(tech.skillLevel)}>
                            {skillLabel(tech.skillLevel)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <InfoRow
                      icon={<ClockIcon />}
                      label="Experience"
                      value={`${tech.yearsOfExperience || 0} years`}
                    />
                    {tech.district ? (
                      <InfoRow
                        icon={<PinIcon />}
                        label="District"
                        value={tech.district}
                      />
                    ) : null}
                    <InfoRow
                      icon={<PhoneIcon />}
                      label="Contact"
                      value={tech.phoneNumber || "Not available"}
                    />

                    {tech.certifications && tech.certifications.length > 0 && (
                      <div className="certs">
                        <div className="cert-label">Certifications</div>
                        <div className="cert-tags">
                          {tech.certifications.slice(0, 2).map((c, idx) => (
                            <span key={idx} className="cert-tag">
                              {c.certificationName}
                            </span>
                          ))}
                          {tech.certifications.length > 2 && (
                            <span className="cert-tag cert-more">
                              +{tech.certifications.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="card-actions">
                      <button
                        className={`btn-outline${hasFetchError ? " btn-outline-error" : ""}`}
                        onClick={() => handleSlotsClick(tech.id)}
                        disabled={isFetching}
                      >
                        {isFetching
                          ? "Loading…"
                          : hasFetchError
                            ? "⚠ Retry"
                            : isCached
                              ? `🕐 ${slotCount} Slot${slotCount !== 1 ? "s" : ""}`
                              : "🕐 View Slots"}
                      </button>
                      <button
                        className="btn-primary"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => router.push(`/public/book/${tech.id}`)}
                      >
                        Book Me →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#34d399"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3>No technicians found</h3>
            <p>Try adjusting your filters or search term.</p>
            <button className="btn-primary full" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${page === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} RMIS · Ministry of Environment
      </footer>

      <style jsx global>
        {globalStyles}
      </style>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="info-row">
      <div className="info-icon">{icon}</div>
      <div className="info-text">
        <div className="info-label">{label}</div>
        <div className="info-val">{value}</div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      fill="none"
      stroke="#34d399"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg
      width="13"
      height="13"
      fill="none"
      stroke="#34d399"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg
      width="13"
      height="13"
      fill="none"
      stroke="#34d399"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

const globalStyles = `
  * { box-sizing: border-box; }

  html, body { margin: 0; padding: 0; background: #0f172a; }

  .page {
    min-height: 100vh;
    background: #0f172a;
    color: #f8fafc;
    font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  }

  .hero {
    position: relative;
    padding: 48px 40px 40px;
    overflow: hidden;
    background: #0f172a;
    border-bottom: 1px solid rgba(4, 120, 87, 0.22);
  }

  .hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 60% 40%, rgba(4, 120, 87, 0.13) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-image {
    position: absolute; right: 0; top: 0; bottom: 0; width: 70%;
    background-image: url('/public technician.png');
    background-size: cover; background-position: center;
    opacity: 0.66; filter: saturate(0.5);
  }

  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to right, #0f172a 0%, rgba(15, 23, 42, 0.92) 36%, transparent 100%);
    pointer-events: none;
  }

  .hero-content { position: relative; z-index: 2; max-width: 560px; }

  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(4, 120, 87, 0.14); border: 1px solid rgba(4, 120, 87, 0.3);
    border-radius: 999px; padding: 4px 12px; margin-bottom: 16px;
  }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; }
  .badge span:last-child { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #34d399; }

  .hero h1 { font-size: clamp(34px, 4vw, 54px); font-weight: 500; line-height: 1.14; color: #f1f5f9; margin: 0 0 12px; }
  .hero h1 em { font-style: normal; color: #34d399; }
  .hero p { font-size: 14px; color: #94a3b8; line-height: 1.7; margin: 0 0 28px; max-width: 460px; }

  .hero-stats { display: flex; align-items: stretch; gap: 18px; flex-wrap: wrap; }
  .stat { min-width: 92px; }
  .stat-val { font-size: 26px; font-weight: 500; color: #f1f5f9; line-height: 1; }
  .stat-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
  .stat-divider { width: 1px; align-self: stretch; background: rgba(255, 255, 255, 0.08); }

  .filters-bar {
    background: #111827; border-bottom: 1px solid rgba(4, 120, 87, 0.16);
    padding: 20px 40px; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;
  }

  .filter-group { display: flex; flex-direction: column; gap: 5px; min-width: 140px; }
  .filter-date { width: 160px; }
  .small { width: 160px; }
  .search { width: 230px; }

  .filter-group label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }

  .filter-group input,
  .filter-group select {
    background: #1e293b; border: 1px solid rgba(4, 120, 87, 0.18);
    color: #e2e8f0; border-radius: 8px; padding: 9px 12px;
    font-size: 13px; width: 100%; outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease; appearance: none;
  }
  .filter-group input::placeholder { color: #475569; }
  .filter-group input:focus,
  .filter-group select:focus { border-color: #047857; box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12); }

  .search-wrap { position: relative; width: 100%; }
  .search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .search-wrap input { padding-left: 34px !important; }

  .clear-btn {
    background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.18);
    color: #f87171; border-radius: 8px; padding: 9px 16px; font-size: 12px;
    cursor: pointer; white-space: nowrap; align-self: flex-end;
    transition: background 0.15s ease, transform 0.12s ease;
  }
  .clear-btn:hover { background: rgba(239, 68, 68, 0.18); }
  .clear-btn:active { transform: scale(0.98); }

  .filter-meta {
    background: #0f172a; padding: 14px 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex; align-items: center; justify-content: space-between;
  }
  .filter-meta span { font-size: 12px; color: #64748b; }
  .filter-meta strong { color: #e2e8f0; }

  .grid-wrap { padding: 28px 40px 48px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  .card {
    position: relative; background: #111827;
    border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 14px; overflow: hidden;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .card:hover { transform: translateY(-3px); border-color: rgba(4, 120, 87, 0.34); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28); }

  .card-header {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
    padding: 18px 18px 16px; display: flex; gap: 13px; align-items: center;
  }

  .avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 500; color: #fff; flex-shrink: 0;
  }

  .card-header-main { min-width: 0; flex: 1; }
  .card-name { font-size: 15px; font-weight: 500; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-spec { font-size: 12px; color: rgba(255, 255, 255, 0.62); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-badges { display: flex; gap: 5px; margin-top: 8px; flex-wrap: wrap; }

  .pill { font-size: 10px; font-weight: 500; border-radius: 999px; padding: 2px 9px; letter-spacing: 0.04em; border: 1px solid transparent; }
  .pill-green  { background: rgba(52, 211, 153, 0.15); color: #34d399;  border-color: rgba(52, 211, 153, 0.2); }
  .pill-amber  { background: rgba(251, 191, 36, 0.12); color: #fbbf24;  border-color: rgba(251, 191, 36, 0.2); }
  .pill-blue   { background: rgba(96, 165, 250, 0.12); color: #93c5fd;  border-color: rgba(96, 165, 250, 0.2); }
  .pill-gray   { background: rgba(148, 163, 184, 0.12); color: #94a3b8; border-color: rgba(148, 163, 184, 0.2); }

  .card-body { padding: 16px 18px 18px; }

  .info-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .info-icon {
    width: 30px; height: 30px; border-radius: 7px;
    background: rgba(4, 120, 87, 0.12); border: 1px solid rgba(4, 120, 87, 0.18);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .info-text { min-width: 0; }
  .info-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 1px; }
  .info-val { font-size: 13px; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .certs { margin-top: 4px; margin-bottom: 14px; }
  .cert-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 5px; }
  .cert-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .cert-tag { font-size: 10px; color: #94a3b8; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 5px; padding: 3px 8px; }
  .cert-more { color: #34d399; border-color: rgba(52, 211, 153, 0.2); background: rgba(52, 211, 153, 0.08); }

  .card-actions { display: flex; gap: 8px; align-items: center; }

  .btn-outline, .btn-primary, .page-btn { transition: all 0.15s ease; }

  .btn-outline {
    flex: 0 0 auto; background: transparent;
    border: 1px solid rgba(4, 120, 87, 0.35); color: #34d399;
    border-radius: 9px; padding: 10px 14px; font-size: 12px; cursor: pointer; white-space: nowrap;
  }
  .btn-outline:hover:not(:disabled) { background: rgba(4, 120, 87, 0.12); }
  .btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-outline-error { border-color: rgba(239, 68, 68, 0.4); color: #f87171; }
  .btn-outline-error:hover:not(:disabled) { background: rgba(239, 68, 68, 0.08); }

  .btn-primary {
    flex: 1; background: #047857; border: none; color: #fff;
    border-radius: 9px; padding: 10px 0; font-size: 12px; font-weight: 500; cursor: pointer;
  }
  .btn-primary:hover { background: #065f46; }
  .btn-primary.full {
    width: 100%; margin-top: 10px; padding: 11px 0; border-radius: 10px; font-weight: 600;
    display: flex; justify-content: center; align-items: center; text-align: center; line-height: 1;
  }

  /* Slots popover */
  .backdrop { position: fixed; inset: 0; z-index: 10; }

  .slots-panel {
    position: absolute; top: 10px; left: 10px; right: 10px; z-index: 20;
    background: #1a2744;
    border: 1px solid rgba(4, 120, 87, 0.3);
    border-radius: 12px;
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }

  .slots-title {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px 10px;
    border-bottom: 1px solid rgba(4, 120, 87, 0.18);
    background: rgba(4, 120, 87, 0.1);
    font-size: 10px; font-weight: 700; color: #34d399;
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  .slots-close {
    background: none; border: none; color: #475569; cursor: pointer;
    font-size: 15px; line-height: 1; padding: 0; transition: color 0.12s;
  }
  .slots-close:hover { color: #94a3b8; }

  .slots-scroll {
    max-height: 240px; overflow-y: auto;
    padding: 8px 10px 10px;
    display: flex; flex-direction: column; gap: 2px;
    scrollbar-width: thin; scrollbar-color: rgba(4, 120, 87, 0.3) transparent;
  }
  .slots-scroll::-webkit-scrollbar { width: 4px; }
  .slots-scroll::-webkit-scrollbar-thumb { background: rgba(4, 120, 87, 0.3); border-radius: 4px; }

  .slots-empty { font-size: 12px; color: #475569; text-align: center; padding: 16px 0; }

  .slots-date-group { margin-bottom: 6px; }
  .slots-date-group:last-child { margin-bottom: 0; }

  .slots-date-header {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 700; color: #6ee7b7;
    text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 4px 5px;
  }

  .slots-date-dot { width: 5px; height: 5px; border-radius: 50%; background: #34d399; flex-shrink: 0; }

  .slot-row {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(4, 120, 87, 0.07); border: 1px solid rgba(4, 120, 87, 0.14);
    border-radius: 7px; padding: 6px 10px; margin-bottom: 4px;
  }
  .slot-row:last-child { margin-bottom: 0; }
  .slot-time { font-size: 12px; color: #a7f3d0; font-weight: 600; }

  .slot-status-pill {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; border-radius: 99px; padding: 2px 8px; border: 1px solid transparent;
  }
  .slot-status-available { background: rgba(52, 211, 153, 0.12); color: #34d399; border-color: rgba(52, 211, 153, 0.22); }
  .slot-status-booked { background: rgba(251, 191, 36, 0.12); color: #fbbf24; border-color: rgba(251, 191, 36, 0.22); }
  .slot-status-pill:not(.slot-status-available):not(.slot-status-booked) {
    background: rgba(148, 163, 184, 0.1); color: #94a3b8; border-color: rgba(148, 163, 184, 0.2);
  }

  /* Empty / Error */
  .empty { text-align: center; padding: 72px 20px 40px; max-width: 420px; margin: 0 auto; }
  .empty-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(4, 120, 87, 0.12); border: 1px solid rgba(4, 120, 87, 0.2);
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
  }
  .empty h3 { font-size: 18px; font-weight: 500; color: #e2e8f0; margin: 0 0 8px; }
  .empty p { font-size: 13px; color: #64748b; margin: 0 0 14px; }

  .pagination { display: flex; gap: 6px; justify-content: center; padding: 0 40px 40px; flex-wrap: wrap; }
  .page-btn {
    padding: 8px 14px; border-radius: 8px; font-size: 12px; cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1); background: #111827; color: #94a3b8;
  }
  .page-btn:hover:not(:disabled) { background: #1e293b; color: #e2e8f0; }
  .page-btn.active { background: #047857; color: #fff; border-color: #047857; }
  .page-btn:disabled { opacity: 0.3; cursor: default; }

  .footer { text-align: center; padding: 24px 40px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #334155; }

  .loading-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 14px; }
  .loading-wrap p { margin: 0; color: #94a3b8; font-size: 13px; font-weight: 500; }
  .spinner { width: 52px; height: 52px; border-radius: 50%; border: 4px solid rgba(52, 211, 153, 0.18); border-top-color: #34d399; animation: spin 0.9s linear infinite; }

  .error-wrap { display: flex; justify-content: center; padding: 32px 20px 60px; }
  .error-card { width: 100%; max-width: 380px; background: #111827; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 28px; text-align: center; box-shadow: 0 18px 44px rgba(0, 0, 0, 0.3); }
  .error-icon { width: 64px; height: 64px; border-radius: 999px; background: rgba(248, 113, 113, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; border: 1px solid rgba(248, 113, 113, 0.12); }
  .error-card h2 { margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #f8fafc; }
  .error-card p { margin: 0 0 16px; font-size: 13px; color: #94a3b8; line-height: 1.6; }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .hero-image { width: 100%; opacity: 0.08; }
    .hero-overlay { background: linear-gradient(to right, #0f172a 0%, rgba(15, 23, 42, 0.92) 62%, rgba(4, 120, 87, 0.08) 100%); }
  }

  @media (max-width: 768px) {
    .hero, .filters-bar, .filter-meta, .grid-wrap, .pagination, .footer { padding-left: 16px; padding-right: 16px; }
    .hero { padding-top: 32px; padding-bottom: 28px; }
    .grid { grid-template-columns: 1fr; }
    .filter-date, .small, .search { width: 100%; }
    .clear-btn { width: 100%; }
    .card-actions { flex-direction: column; align-items: stretch; }
    .btn-outline { width: 100%; }
    .navbar { padding-left: 16px; padding-right: 16px; }
    .filters-bar { flex-direction: column; gap: 10px; }
    .pagination { padding-left: 16px; padding-right: 16px; }
    .hero h1 { font-size: clamp(26px, 7vw, 40px); }
  }
`;
