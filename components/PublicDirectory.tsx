"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewsModal } from "./ReviewsModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

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
  averageRating?: number;
  ratingCount?: number;
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
  const [reviewsModalTech, setReviewsModalTech] = useState<Technician | null>(
    null,
  );
  const [reloadKey, setReloadKey] = useState(0);

  // Lazy slots state
  const [slotsCache, setSlotsCache] = useState<Record<number, Availability[]>>(
    {},
  );
  const [loadingSlots, setLoadingSlots] = useState<number | null>(null);
  const [slotsError, setSlotsError] = useState<number | null>(null);

  // Ratings cache: stores {avg, count} per technician, fetched lazily
  const [ratingsCache, setRatingsCache] = useState<
    Record<number, { avg: number; count: number }>
  >({});

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
    // Also clear ratings cache on refresh
    setRatingsCache({});
  }, [selectedDate, selectedSkill, reloadKey]);

  // Fetch ratings for visible technicians on the current page
  useEffect(() => {
    if (currentItems.length === 0) return;
    const toFetch = currentItems.filter(
      (t) => ratingsCache[t.id] === undefined,
    );
    if (toFetch.length === 0) return;

    toFetch.forEach(async (tech) => {
      try {
        const res = await fetch(
          `${API_BASE}/public/technicians/${tech.id}/feedbacks`,
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const reviews = Array.isArray(data) ? data : [];
        const count = reviews.length;
        const avg =
          count > 0
            ? reviews.reduce(
                (sum: number, r: any) => sum + (r.rating || 0),
                0,
              ) / count
            : 0;
        setRatingsCache((prev) => ({ ...prev, [tech.id]: { avg, count } }));
      } catch {
        // If endpoint doesn't exist yet, show 0 reviews gracefully
        setRatingsCache((prev) => ({
          ...prev,
          [tech.id]: { avg: 0, count: 0 },
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, technicians]);

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
        <div className="hero-radial"></div>
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot"></span>
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
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-val">{specs.length}</div>
              <div className="stat-lbl">Specializations</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-val">{filtered.length}</div>
              <div className="stat-lbl">Matched</div>
            </div>
          </div>
        </div>
      </section>

      <div className="filters-wrap">
        <div className="filters-bar">
          <div className="fg">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="fg">
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
          <div className="fg">
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
          <div className="fg">
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
          <div className="fg">
            <label>Search</label>
            <div className="sw">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {(searchTerm ||
            selectedSpec ||
            selectedDist ||
            selectedSkill ||
            selectedDate) && (
            <button className="clear-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div className="filter-meta">
        <span className="fmc">
          Showing <strong>{filtered.length}</strong> technicians
          {selectedDate && (
            <>
              {" "}
              on <strong>{selectedDate}</strong>
            </>
          )}
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
                  <div className="card-accent"></div>
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
                    <div className="chm">
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
                    {/* Rating display */}
                    {(() => {
                      const ratingData = ratingsCache[tech.id];
                      return (
                        <div className="rating-row">
                          <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={
                                  ratingData && ratingData.avg >= star
                                    ? "star-full"
                                    : ratingData && ratingData.avg >= star - 0.5
                                      ? "star-half"
                                      : "star-empty"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="rating-text">
                            {!ratingData ? "..." : ratingData.avg.toFixed(1)}
                          </span>
                          <span className="rating-count">
                            {!ratingData
                              ? ""
                              : ratingData.count > 0
                                ? `(${ratingData.count} review${ratingData.count !== 1 ? "s" : ""})`
                                : "(No reviews)"}
                          </span>
                          {ratingData && ratingData.count > 0 && (
                            <button
                              className="reviews-link"
                              onClick={() => setReviewsModalTech(tech)}
                            >
                              View
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    <div className="info-grid">
                      <div className="info-row">
                        <div className="info-icon">
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="var(--p1)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </div>
                        <div>
                          <div className="info-label">Experience</div>
                          <div className="info-val">
                            {tech.yearsOfExperience || 0} years
                          </div>
                        </div>
                      </div>
                      <div className="info-row">
                        <div className="info-icon">
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="var(--p1)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div>
                          <div className="info-label">District</div>
                          <div className="info-val">
                            {tech.district || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div
                        className="info-row"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <div className="info-icon">
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="var(--p1)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <div>
                          <div className="info-label">Contact</div>
                          <div className="info-val">
                            {tech.phoneNumber || "Not available"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-div"></div>

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
                        className={`btn-slots ${hasFetchError ? "error" : ""}`}
                        onClick={() => handleSlotsClick(tech.id)}
                        disabled={isFetching}
                      >
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        {isFetching
                          ? "Loading…"
                          : hasFetchError
                            ? "Retry"
                            : isCached
                              ? `${slotCount} Slots`
                              : "View Slots"}
                      </button>
                      <button
                        className="btn-book"
                        onClick={() => router.push(`/public/book/${tech.id}`)}
                      >
                        Book Now
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
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
                stroke="var(--p2)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
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

      {reviewsModalTech && (
        <ReviewsModal
          technicianId={reviewsModalTech.id}
          technicianName={`${reviewsModalTech.firstName} ${reviewsModalTech.lastName}`}
          onClose={() => setReviewsModalTech(null)}
        />
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ←
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
            →
          </button>
        </div>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} RMIS · Ministry of Environment · All rights
        reserved
      </footer>

      <style jsx global>
        {globalStyles}
      </style>
    </div>
  );
}

const globalStyles = `
  :root {
    --p1:#1A4A38;--p2:#2C7A4B;--p3:#4ade80;
    --bg:#f0faf5;--bg2:#e6f4ee;
    --card:#ffffff;--card-border:rgba(26,74,56,0.1);
    --hdr-bg:linear-gradient(160deg,#1A4A38 0%,#2C7A4B 55%,#1a5e40 100%);
    --tm:#1F2937;--ts:#374151;--tmu:#6B7280;--tfa:#9CA3AF;
    --pg:rgba(26,74,56,0.08);--pb:rgba(26,74,56,0.15);
    --sbg:#C2EAD1;--st:#327552;--sbo:#86c9a6;
    --abg:#FAEAB3;--at:#B07C25;--abo:#e8c96a;
    --bbg:#dbeafe;--bt:#1e40af;--bbo:#93c5fd;
    --gbg:#f1f5f9;--gt:#64748b;--gbo:#cbd5e1;
    --rsm:8px;--rmd:12px;--rlg:20px;--rxl:24px;
    --shadow:0 4px 24px rgba(26,74,56,0.08),0 1px 4px rgba(26,74,56,0.06);
    --shadow-hover:0 12px 40px rgba(26,74,56,0.16),0 2px 8px rgba(26,74,56,0.1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .page {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: var(--bg);
    color: var(--tm);
    line-height: 1.5;
    min-height: 100vh;
  }

  /* ── HERO ── */
  .hero { position: relative; padding: 56px 40px 110px; overflow: hidden; background: var(--hdr-bg); }
  .hero::after {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
  .hero-radial { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 60% 80% at 70% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 5% 30%, rgba(0, 0, 0, 0.1) 0%, transparent 60%); }
  .hero-content { position: relative; z-index: 2; max-width: 620px; }
  
  .badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-radius: 999px; padding: 5px 16px; margin-bottom: 22px;
  }
  .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #a7f3d0; box-shadow: 0 0 8px rgba(167, 243, 208, 0.8); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { box-shadow: 0 0 8px rgba(167, 243, 208, 0.8) } 50% { box-shadow: 0 0 18px rgba(167, 243, 208, 1), 0 0 30px rgba(167, 243, 208, 0.4) } }
  .badge span { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #d1fae5; }
  
  .hero h1 { font-size: clamp(34px, 5vw, 56px); font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; color: #fff; margin-bottom: 14px; }
  .hero h1 em { font-style: normal; color: #a7f3d0; }
  .hero p { font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.75; margin-bottom: 32px; max-width: 480px; }
  
  .hero-stats { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
  .stat { display: flex; flex-direction: column; gap: 4px; }
  .stat-val { font-size: 30px; font-weight: 800; color: #fff; line-height: 1; }
  .stat-lbl { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 0.08em; }
  .stat-divider { width: 1px; height: 40px; background: rgba(255, 255, 255, 0.2); }

  /* ── FILTER BAR ── */
  .filters-wrap { position: relative; z-index: 10; margin: -52px 40px 0; }
  .filters-bar {
    background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.7); border-radius: var(--rxl); padding: 24px 28px;
    display: grid; grid-template-columns: 160px repeat(3, 1fr) 240px; gap: 16px;
    box-shadow: 0 16px 48px rgba(26, 74, 56, 0.12), 0 2px 8px rgba(26, 74, 56, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  .fg { display: flex; flex-direction: column; gap: 6px; }
  .fg label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--p1); }
  .fg input, .fg select {
    background: #f8fdf9; border: 1.5px solid rgba(26, 74, 56, 0.15); border-radius: var(--rsm);
    color: var(--tm); padding: 10px 13px; font-size: 13px; font-family: inherit; width: 100%; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s; appearance: none; -webkit-appearance: none;
  }
  .fg input::placeholder { color: var(--tfa); }
  .fg input:focus, .fg select:focus { border-color: var(--p2); box-shadow: 0 0 0 3px rgba(44, 122, 75, 0.12); }
  .fg select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231A4A38' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; background-color: #f8fdf9;
  }
  .sw { position: relative; }
  .sw svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .sw input { padding-left: 34px !important; }
  
  .clear-btn {
    grid-column: 1 / -1; background: rgba(239, 68, 68, 0.05); border: 1.5px solid rgba(239, 68, 68, 0.15);
    color: #ef4444; border-radius: var(--rsm); padding: 8px 16px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; margin-top: 4px;
  }
  .clear-btn:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

  /* ── META ── */
  .filter-meta { padding: 28px 40px 0; display: flex; align-items: center; justify-content: space-between; }
  .fmc { font-size: 13px; color: var(--tmu); }
  .fmc strong { color: var(--tm); font-weight: 700; }

  /* ── GRID ── */
  .grid-wrap { padding: 20px 40px 60px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

  /* ── CARD ── */
  .card {
    position: relative; background: var(--card); border: 1px solid var(--card-border);
    border-radius: var(--rlg); overflow: hidden; box-shadow: var(--shadow);
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s, border-color 0.2s;
  }
  .card:hover { transform: translateY(-6px); box-shadow: var(--shadow-hover); border-color: rgba(44, 122, 75, 0.25); }
  .card-accent { height: 4px; background: linear-gradient(90deg, #1A4A38, #2C7A4B, #4ade80, #2C7A4B, #1A4A38); }
  
  .card-header {
    background: linear-gradient(135deg, #f0faf5 0%, #e6f5ed 100%);
    border-bottom: 1px solid rgba(26, 74, 56, 0.08); padding: 18px 20px; display: flex; gap: 14px; align-items: center;
  }
  .avatar {
    width: 54px; height: 54px; border-radius: 14px;
    background: linear-gradient(135deg, #1A4A38, #2C7A4B);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 800; color: #fff; flex-shrink: 0; box-shadow: 0 4px 14px rgba(26, 74, 56, 0.3);
  }
  .chm { flex: 1; min-width: 0; }
  .card-name { font-size: 16px; font-weight: 700; color: var(--tm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
  .card-spec { font-size: 12px; color: var(--tmu); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 9px; }
  
  .card-badges { display: flex; gap: 5px; flex-wrap: wrap; }
  .pill { font-size: 10px; font-weight: 700; border-radius: 999px; padding: 3px 11px; letter-spacing: 0.04em; border: 1px solid transparent; }
  .pill-green { background: var(--sbg); color: var(--st); border-color: var(--sbo); }
  .pill-amber { background: var(--abg); color: var(--at); border-color: var(--abo); }
  .pill-blue { background: var(--bbg); color: var(--bt); border-color: var(--bbo); }
  .pill-gray { background: var(--gbg); color: var(--gt); border-color: var(--gbo); }

  .card-body { padding: 18px 20px 20px; }

  /* ── STARS ── */
  .rating-row {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #fffbeb, #fef9e7);
    border: 1px solid #fde68a; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px;
  }
  .stars { display: flex; gap: 1px; line-height: 1; }
  .star-full { color: #f59e0b; font-size: 15px; }
  .star-half { position: relative; font-size: 15px; color: #e5e7eb; display: inline-block; }
  .star-half::before { content: '★'; color: #f59e0b; position: absolute; left: 0; top: 0; width: 55%; overflow: hidden; display: block; }
  .star-empty { color: #d1d5db; font-size: 15px; }
  .rating-text { font-size: 13px; font-weight: 700; color: #92400e; }
  .rating-count { font-size: 12px; color: #b45309; }
  .reviews-link {
    background: none; border: 1px solid rgba(245, 158, 11, 0.3); color: #b45309;
    font-size: 10px; font-weight: 700; border-radius: 6px; padding: 3px 8px;
    cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s;
  }
  .reviews-link:hover { background: rgba(245, 158, 11, 0.1); }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .info-row { display: flex; align-items: center; gap: 10px; }
  .info-icon {
    width: 34px; height: 34px; border-radius: 999px;
    background: linear-gradient(135deg, rgba(26,74,56,0.07), rgba(44,122,75,0.05));
    border: 1px solid rgba(26,74,56,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .info-label { font-size: 10px; font-weight: 700; color: var(--tmu); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
  .info-val { font-size: 13px; font-weight: 600; color: var(--tm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  .card-div { height: 1px; background: linear-gradient(90deg, transparent, rgba(26,74,56,0.1), transparent); margin: 14px 0; }
  
  .certs { margin-bottom: 16px; }
  .cert-label { font-size: 10px; font-weight: 700; color: var(--tmu); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px; }
  .cert-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .cert-tag { font-size: 11px; color: var(--p1); background: rgba(26,74,56,0.06); border: 1px solid rgba(26,74,56,0.12); border-radius: 6px; padding: 3px 9px; font-weight: 500; }
  .cert-more { color: var(--p2); font-weight: 700; }

  .card-actions { display: flex; gap: 8px; }
  .btn-slots {
    flex: 0 0 auto; display: flex; align-items: center; gap: 6px;
    background: #fff; border: 1.5px solid rgba(26, 74, 56, 0.2); color: var(--p1);
    border-radius: var(--rmd); padding: 10px 14px; font-size: 12px; font-weight: 600;
    cursor: pointer; white-space: nowrap; transition: all 0.15s; box-shadow: 0 1px 3px rgba(26, 74, 56, 0.08);
  }
  .btn-slots:hover:not(:disabled) { background: #f0faf5; border-color: var(--p2); color: var(--p2); transform: translateY(-1px); }
  .btn-slots:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-slots.error { border-color: #ef4444; color: #ef4444; }

  .btn-book {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    background: linear-gradient(135deg, #1A4A38 0%, #2C7A4B 100%);
    border: none; color: #d1fae5; border-radius: var(--rmd); padding: 11px 0;
    font-size: 13px; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 16px rgba(26, 74, 56, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.2s;
  }
  .btn-book:hover { background: linear-gradient(135deg, #2C7A4B 0%, #1a5e40 100%); box-shadow: 0 6px 24px rgba(26, 74, 56, 0.4); transform: translateY(-1px); }
  .btn-book:active { transform: scale(0.98); }

  /* ── SLOTS POPOVER ── */
  .backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(26, 74, 56, 0.1); backdrop-filter: blur(4px); }
  .slots-panel {
    position: absolute; top: 10px; left: 10px; right: 10px; z-index: 110;
    background: #ffffff; border: 1px solid var(--p2); border-radius: 16px;
    box-shadow: 0 24px 64px rgba(26, 74, 56, 0.25); overflow: hidden;
  }
  .slots-title {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; background: var(--bg); border-bottom: 1px solid rgba(26, 74, 56, 0.1);
    font-size: 11px; font-weight: 800; color: var(--p1); text-transform: uppercase; letter-spacing: 0.1em;
  }
  .slots-close { background: none; border: none; color: var(--tmu); cursor: pointer; font-size: 18px; padding: 4px; }
  .slots-scroll { max-height: 300px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
  .slots-date-group { margin-bottom: 12px; }
  .slots-date-header { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--p2); text-transform: uppercase; margin-bottom: 6px; }
  .slots-date-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--p3); }
  .slot-row {
    display: flex; align-items: center; justify-content: space-between;
    background: #f8fdfa; border: 1px solid rgba(26, 74, 56, 0.08); border-radius: 8px; padding: 8px 12px; margin-bottom: 4px;
  }
  .slot-time { font-size: 13px; font-weight: 700; color: var(--p1); }
  .slot-status-pill { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; }
  .slot-status-available { background: var(--sbg); color: var(--st); }
  .slot-status-booked { background: var(--abg); color: var(--at); }
  .slots-empty { text-align: center; padding: 32px; color: var(--tmu); font-size: 13px; }

  /* ── PAGINATION ── */
  .pagination { display: flex; gap: 6px; justify-content: center; padding: 0 40px 48px; flex-wrap: wrap; }
  .page-btn {
    padding: 8px 15px; border-radius: var(--rsm); font-size: 12px; font-weight: 600;
    cursor: pointer; background: #fff; border: 1.5px solid rgba(26, 74, 56, 0.15);
    color: var(--tmu); box-shadow: 0 1px 3px rgba(26, 74, 56, 0.06); transition: all 0.15s;
  }
  .page-btn:hover:not(:disabled) { background: #f0faf5; border-color: var(--p2); color: var(--p1); }
  .page-btn.active { background: var(--hdr-bg); border-color: transparent; color: #fff; box-shadow: 0 3px 12px rgba(26, 74, 56, 0.3); }
  .page-btn:disabled { opacity: 0.35; cursor: default; }

  footer { text-align: center; padding: 24px 40px; border-top: 1px solid rgba(26, 74, 56, 0.08); font-size: 11px; color: var(--tfa); letter-spacing: 0.03em; }

  /* ── UTILS ── */
  .loading-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; background: var(--bg); }
  .spinner { width: 48px; height: 48px; border: 4px solid var(--sbg); border-top-color: var(--p2); border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty { text-align: center; padding: 80px 20px; }
  .empty-icon { width: 64px; height: 64px; background: var(--bg2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
  .empty h3 { color: var(--p1); margin-bottom: 8px; }
  .btn-primary.full { width: 100%; max-width: 200px; margin: 20px auto 0; display: block; }

  @media(max-width:1400px){
    .grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
  }
  @media(max-width:1100px){
    .filters-bar{grid-template-columns:repeat(3,1fr)}
    .filters-wrap{margin:-52px 24px 0}
    .grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
  }
  @media(max-width:768px){
    .hero{padding:36px 20px 100px}
    .hero h1{font-size:28px;letter-spacing:-0.5px}
    .hero p{font-size:13px}
    .hero-stats{gap:16px}
    .stat-val{font-size:22px}
    .filters-wrap{margin:-48px 16px 0}
    .filters-bar{grid-template-columns:1fr 1fr;padding:16px;gap:10px;border-radius:16px}
    .filter-meta{padding:20px 16px 0}
    .grid-wrap{padding:16px 16px 40px}
    .grid{grid-template-columns:1fr;gap:16px}
    .card-actions{flex-direction:column}
    .btn-slots{width:100%;justify-content:center}
    .btn-book{width:100%}
    .pagination{padding:0 16px 32px;gap:4px}
    .page-btn{padding:6px 12px;font-size:11px}
    footer{padding:20px 16px;font-size:10px}
  }
  @media(max-width:480px){
    .hero{padding:28px 16px 90px}
    .hero h1{font-size:24px}
    .badge{padding:4px 12px}
    .badge span{font-size:10px}
    .hero-stats{gap:12px}
    .stat-val{font-size:18px}
    .stat-lbl{font-size:9px}
    .stat-divider{height:28px}
    .filters-wrap{margin:-44px 12px 0}
    .filters-bar{grid-template-columns:1fr;padding:14px;gap:8px;border-radius:14px}
    .fg label{font-size:9px}
    .fg input,.fg select{padding:8px 10px;font-size:12px}
    .filter-meta{padding:16px 12px 0}
    .fmc{font-size:12px}
    .grid-wrap{padding:12px 12px 32px}
    .card-header{padding:14px 16px}
    .avatar{width:44px;height:44px;border-radius:12px;font-size:14px}
    .card-name{font-size:14px}
    .card-spec{font-size:11px}
    .card-body{padding:14px 16px 16px}
    .info-grid{grid-template-columns:1fr;gap:8px}
    .info-icon{width:28px;height:28px}
    .rating-row{padding:8px 10px;gap:6px}
    .slots-panel{border-radius:12px}
  }
  @media(max-width:360px){
    .hero{padding:24px 12px 80px}
    .hero h1{font-size:20px}
    .hero p{font-size:12px;margin-bottom:20px}
    .filters-wrap{margin:-40px 8px 0}
    .grid-wrap{padding:10px 8px 28px}
    .card{border-radius:14px}
  }
`;
