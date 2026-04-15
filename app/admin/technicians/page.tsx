"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRole } from "@/services/authService";
import UnauthorisedMessage from "@/components/audit-log/UnauthorisedMessage";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

interface Certification {
  id: number;
  certificationName: string;
  fileType: string;
  fileUrl: string;
  originalFileName: string;
}

interface Technician {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  district: string;
  specialization: string;
  yearsOfExperience: number;
  skillLevel: string;
  status: string;
  registrationDate: string;
  approvalDate: string | null;
  certifications: Certification[];
}

type TabType = "PENDING" | "ACTIVE" | "REJECTED";

export default function AdminTechnicianPage() {
  const router = useRouter();
  const [isUnauthorised, setIsUnauthorised] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");

  // ── Auth guard ─────────────────────────────────────────────────
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

  // ── Fetch technicians by status ────────────────────────────────
  useEffect(() => {
    fetchTechnicians();
  }, [activeTab]);

  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/admin/technicians/${activeTab.toLowerCase()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch");
      setTechnicians(await res.json());
    } catch (err) {
      console.error(err);
      setTechnicians([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!selectedSkillLevel) {
      alert("Please select a skill level before approving");
      return;
    }
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/admin/technicians/${id}/approve?skillLevel=${selectedSkillLevel}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Approval failed");
      setSelectedTechnician(null);
      setSelectedSkillLevel("");
      fetchTechnicians();
    } catch (err) {
      alert("Failed to approve technician");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    if (rejectingId == null) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/admin/technicians/${rejectingId}/reject?reason=${encodeURIComponent(rejectReason)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Rejection failed");
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingId(null);
      setSelectedTechnician(null);
      fetchTechnicians();
    } catch {
      alert("Failed to reject technician");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this technician?")) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/technicians/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSelectedTechnician(null);
      fetchTechnicians();
    } catch {
      alert("Failed to delete technician");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    router.push("/ministry");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const skillLevelBadge = (level: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      JUNIOR: { bg: "#f3f4f6", color: "#374151" },
      INTERMEDIATE: { bg: "#dbeafe", color: "#1d4ed8" },
      SENIOR: { bg: "#fef3c7", color: "#d97706" },
    };
    const s = styles[level] ?? { bg: "#f1f5f9", color: "#475569" };
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.color,
          padding: "3px 10px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {level || "—"}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> =
      {
        PENDING: { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
        ACTIVE: { bg: "#dcfce7", color: "#166534", label: "Active" },
        REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
      };
    const s = styles[status] ?? {
      bg: "#f1f5f9",
      color: "#475569",
      label: status,
    };
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.color,
          padding: "3px 10px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {s.label}
      </span>
    );
  };

  if (isUnauthorised) return <UnauthorisedMessage />;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────── */}
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

          <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
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
              <span>📋</span> Audit Logs
            </div>
          </Link>

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
            <span>🔧</span> Technicians
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

      {/* ── Main Content ───────────────────────────────────────── */}
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
            Technician Management
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
            Review, approve, or reject technician registration applications.
          </p>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Pending Review",
              icon: "⏳",
              bg: "#fffbeb",
              border: "#fde68a",
              iconBg: "#fef3c7",
              count: activeTab === "PENDING" ? technicians.length : "—",
              color: "#d97706",
            },
            {
              label: "Active",
              icon: "✅",
              bg: "#f0fdf4",
              border: "#bbf7d0",
              iconBg: "#dcfce7",
              count: activeTab === "ACTIVE" ? technicians.length : "—",
              color: "#16a34a",
            },
            {
              label: "Rejected",
              icon: "❌",
              bg: "#fff1f2",
              border: "#fecdd3",
              iconBg: "#fee2e2",
              count: activeTab === "REJECTED" ? technicians.length : "—",
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
                    color: card.color,
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

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 4,
            backgroundColor: "#fff",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            padding: 4,
            marginBottom: 20,
            width: "fit-content",
          }}
        >
          {(["PENDING", "ACTIVE", "REJECTED"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedTechnician(null);
                setSelectedSkillLevel("");
              }}
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                transition: "all 0.15s",
                backgroundColor: activeTab === tab ? "#0f172a" : "transparent",
                color: activeTab === tab ? "#fff" : "#64748b",
              }}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Table + detail panel */}
        <div style={{ display: "flex", gap: 20 }}>
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
                style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                Loading technicians...
              </div>
            ) : technicians.length === 0 ? (
              <div
                style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                No {activeTab.toLowerCase()} technicians found.
              </div>
            ) : (
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
                      "Name",
                      "Email",
                      "Specialization",
                      "Skill Level",
                      "Registered",
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
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => {
                        setSelectedTechnician(t);
                        setSelectedSkillLevel("");
                      }}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        cursor: "pointer",
                        backgroundColor:
                          selectedTechnician?.id === t.id
                            ? "#f0fdf4"
                            : "transparent",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTechnician?.id !== t.id)
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTechnician?.id !== t.id)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 16px",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                      >
                        {t.firstName} {t.lastName}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
                        {t.email}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
                        {t.specialization || "—"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        {t.skillLevel ? (
                          skillLevelBadge(t.skillLevel)
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
                        {formatDate(t.registrationDate)}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        {statusBadge(t.status)}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            color: "#1a4a38",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          {selectedTechnician && (
            <div
              style={{
                width: 340,
                flexShrink: 0,
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                alignSelf: "flex-start",
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
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {selectedTechnician.firstName} {selectedTechnician.lastName}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      margin: "3px 0 0",
                    }}
                  >
                    ID #{selectedTechnician.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTechnician(null);
                    setSelectedSkillLevel("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Info rows */}
              {[
                { label: "Email", value: selectedTechnician.email },
                { label: "Phone", value: selectedTechnician.phoneNumber },
                {
                  label: "District",
                  value: selectedTechnician.district || "—",
                },
                { label: "Address", value: selectedTechnician.address || "—" },
                {
                  label: "Specialization",
                  value: selectedTechnician.specialization || "—",
                },
                {
                  label: "Experience",
                  value:
                    selectedTechnician.yearsOfExperience != null
                      ? `${selectedTechnician.yearsOfExperience} yrs`
                      : "—",
                },
                {
                  label: "Registered",
                  value: formatDate(selectedTechnician.registrationDate),
                },
                {
                  label: "Approved",
                  value: formatDate(selectedTechnician.approvalDate),
                },
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: 12 }}>
                  <p
                    style={{
                      fontSize: 11,
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

              {/* Skill Level */}
              <div style={{ marginBottom: 12 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    margin: "0 0 4px",
                  }}
                >
                  Skill Level
                </p>
                {selectedTechnician.skillLevel ? (
                  skillLevelBadge(selectedTechnician.skillLevel)
                ) : (
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>
                    Not assigned yet
                  </span>
                )}
              </div>

              {/* Status */}
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    margin: "0 0 4px",
                  }}
                >
                  Status
                </p>
                {statusBadge(selectedTechnician.status)}
              </div>

              {/* Certifications */}
              {selectedTechnician.certifications?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      margin: "0 0 8px",
                    }}
                  >
                    Certifications ({selectedTechnician.certifications.length})
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {selectedTechnician.certifications.map((cert) => (
                      <a
                        key={cert.id}
                        href={`${API_BASE}${cert.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 7,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f0fdf4")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8fafc")
                        }
                      >
                        <span style={{ fontSize: 16 }}>📄</span>
                        <div>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0f172a",
                              margin: 0,
                            }}
                          >
                            {cert.certificationName}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                              margin: 0,
                            }}
                          >
                            {cert.originalFileName}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedTechnician.status === "PENDING" && (
                  <>
                    {/* Skill level selector */}
                    <div style={{ marginBottom: 4 }}>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          margin: "0 0 6px",
                        }}
                      >
                        Assign Skill Level{" "}
                        <span style={{ color: "#dc2626" }}>*</span>
                      </p>
                      <select
                        value={selectedSkillLevel}
                        onChange={(e) => setSelectedSkillLevel(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 10px",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                          background: "#f8fafc",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">Select level…</option>
                        <option value="JUNIOR">Junior</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="SENIOR">Senior</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleApprove(selectedTechnician.id)}
                      disabled={actionLoading || !selectedSkillLevel}
                      style={{
                        width: "100%",
                        padding: "11px 0",
                        borderRadius: 8,
                        border: "none",
                        backgroundColor: "#16a34a",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: selectedSkillLevel ? "pointer" : "not-allowed",
                        opacity: actionLoading || !selectedSkillLevel ? 0.5 : 1,
                        transition: "opacity 0.15s",
                      }}
                    >
                      {actionLoading ? "Approving..." : "✅ Approve Technician"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(selectedTechnician.id);
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading}
                      style={{
                        width: "100%",
                        padding: "11px 0",
                        borderRadius: 8,
                        border: "none",
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      ❌ Reject Technician
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedTechnician.id)}
                  disabled={actionLoading}
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    opacity: actionLoading ? 0.6 : 1,
                  }}
                >
                  🗑 Delete Technician
                </button>
              </div>
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

      {/* ── Reject reason modal ────────────────────────────────── */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 32,
              width: 440,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 8px",
              }}
            >
              Reject Technician
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
              Please provide a reason for rejection. This will be recorded.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                padding: "10px 12px",
                fontSize: 14,
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectingId(null);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectReason.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  opacity: actionLoading || !rejectReason.trim() ? 0.6 : 1,
                }}
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
