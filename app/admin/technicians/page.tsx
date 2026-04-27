"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/services/authService";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

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
type UserCategory = "TECHNICIANS" | "COMPANIES";

export default function AdminTechnicianPage() {
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [userCategory, setUserCategory] = useState<UserCategory>("TECHNICIANS");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const endpoint =
        userCategory === "TECHNICIANS" ? "technicians" : "companies";
      const res = await fetch(
        `${API_BASE}/admin/${endpoint}/${activeTab.toLowerCase()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch");
      setTechnicians(await res.json());
    } catch {
      setTechnicians([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, userCategory]);

  const handleApprove = async (id: number) => {
    if (!selectedSkillLevel) {
      alert("Please select a skill level before approving");
      return;
    }
    setActionLoading(true);
    try {
      const token = getToken();
      const endpoint =
        userCategory === "TECHNICIANS" ? "technicians" : "companies";
      const res = await fetch(
        `${API_BASE}/admin/${endpoint}/${id}/approve?skillLevel=${selectedSkillLevel}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed");
      setSelectedTechnician(null);
      setSelectedSkillLevel("");
      fetchData();
    } catch (err) {
      alert(
        `Failed to approve ${userCategory === "TECHNICIANS" ? "technician" : "company"}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim() || rejectingId == null) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const endpoint =
        userCategory === "TECHNICIANS" ? "technicians" : "companies";
      const res = await fetch(
        `${API_BASE}/admin/${endpoint}/${rejectingId}/reject?reason=${encodeURIComponent(rejectReason)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed");
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingId(null);
      setSelectedTechnician(null);
      fetchData();
    } catch {
      alert(
        `Failed to reject ${userCategory === "TECHNICIANS" ? "technician" : "company"}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            <h2>User Verification</h2>
            <p>
              Review, approve, or reject technician registration applications.
            </p>
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
          <div className="summary-icon yellow">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div className="summary-info">
            <h3>Pending</h3>
            <div className="summary-value">
              {activeTab === "PENDING" ? technicians.length : "—"}
            </div>
          </div>
        </div>
        <div className="summary-card highlight">
          <div className="summary-icon green">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <div className="summary-info">
            <h3>Active</h3>
            <div className="summary-value">
              {activeTab === "ACTIVE" ? technicians.length : "—"}
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div
            className="summary-icon"
            style={{ backgroundColor: "#f0c9c9", color: "#a33b3b" }}
          >
            <span className="material-symbols-outlined">person_off</span>
          </div>
          <div className="summary-info">
            <h3>Rejected</h3>
            <div className="summary-value">
              {activeTab === "REJECTED" ? technicians.length : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="master-table-card" style={{ marginTop: "24px" }}>
        <div
          className="filters-section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* User Category Tabs on Left */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setUserCategory("TECHNICIANS")}
              className={`page-btn ${userCategory === "TECHNICIANS" ? "active-tab" : ""}`}
              style={{
                borderRadius: "8px",
                padding: "8px 16px",
                backgroundColor:
                  userCategory === "TECHNICIANS" ? "#1a4a38" : "white",
                color: userCategory === "TECHNICIANS" ? "white" : "#4b5563",
                border:
                  userCategory === "TECHNICIANS" ? "none" : "1px solid #e5e7eb",
                fontWeight: 600,
              }}
            >
              Technicians
            </button>
            <button
              onClick={() => setUserCategory("COMPANIES")}
              className={`page-btn ${userCategory === "COMPANIES" ? "active-tab" : ""}`}
              style={{
                borderRadius: "8px",
                padding: "8px 16px",
                backgroundColor:
                  userCategory === "COMPANIES" ? "#1a4a38" : "white",
                color: userCategory === "COMPANIES" ? "white" : "#4b5563",
                border:
                  userCategory === "COMPANIES" ? "none" : "1px solid #e5e7eb",
                fontWeight: 600,
              }}
            >
              Company Users
            </button>
          </div>

          {/* Status Filter on Right */}
          <div className="filters-grid" style={{ margin: 0 }}>
            <div
              className="filter-group"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <label style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                Filter by Status:
              </label>
              <div className="filter-input" style={{ minWidth: "180px" }}>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as TabType)}
                >
                  <option value="PENDING">Pending Approval</option>
                  <option value="ACTIVE">Active Records</option>
                  <option value="REJECTED">Rejected Applications</option>
                </select>
                <span className="material-symbols-outlined select-icon">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  {userCategory === "TECHNICIANS"
                    ? "Technician"
                    : "Company Name"}
                </th>
                <th>
                  {userCategory === "TECHNICIANS"
                    ? "Specialization"
                    : "Reg. Number"}
                </th>
                <th>
                  {userCategory === "TECHNICIANS"
                    ? "Experience"
                    : "Contact Email"}
                </th>
                <th>Registration Date</th>
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
                    Loading technicians...
                  </td>
                </tr>
              ) : technicians.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                technicians.map((t) => (
                  <tr key={t.id} onClick={() => setSelectedTechnician(t)}>
                    <td>
                      <div className="req-id">
                        {userCategory === "TECHNICIANS"
                          ? `${t.firstName} ${t.lastName}`
                          : (t as any).companyName || t.email}
                      </div>
                      <div style={{ fontSize: "11px", opacity: 0.7 }}>
                        {t.email}
                      </div>
                    </td>
                    <td>
                      {userCategory === "TECHNICIANS"
                        ? t.specialization || "—"
                        : (t as any).registrationNumber || "—"}
                    </td>
                    <td>
                      {userCategory === "TECHNICIANS"
                        ? `${t.yearsOfExperience || 0} yrs`
                        : t.email}
                    </td>
                    <td>{formatDate(t.registrationDate)}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          t.status === "ACTIVE"
                            ? "status-approved"
                            : t.status === "PENDING"
                              ? "status-pending"
                              : "status-rejected"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <span className="action-link">Review</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-footer" style={{ padding: "16px 32px" }}>
            <div className="pagination-info" style={{ marginLeft: "8px" }}>
              Count: {technicians.length}
            </div>
          </div>
        </div>
      </div>

      {selectedTechnician && (
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
            style={{ width: "600px", background: "white", padding: "32px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h3>
                {userCategory === "TECHNICIANS" ? "Technician" : "Company"}{" "}
                Profile:{" "}
                {userCategory === "TECHNICIANS"
                  ? `${selectedTechnician.firstName} ${selectedTechnician.lastName}`
                  : (selectedTechnician as any).companyName}
              </h3>
              <button
                onClick={() => {
                  setSelectedTechnician(null);
                  setSelectedSkillLevel("");
                }}
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
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <p>
                <strong>Email:</strong> {selectedTechnician.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedTechnician.phoneNumber}
              </p>
              <p>
                <strong>Experience:</strong>{" "}
                {selectedTechnician.yearsOfExperience} years
              </p>
              <p>
                <strong>Status:</strong> {selectedTechnician.status}
              </p>
            </div>

            {selectedTechnician.status === "PENDING" && (
              <div
                style={{
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  marginBottom: "24px",
                }}
              >
                <p style={{ marginBottom: "12px", fontWeight: 600 }}>
                  Approval Action
                </p>
                <div className="filter-group" style={{ marginBottom: "16px" }}>
                  <label>Assign Skill Level</label>
                  <div className="filter-input" style={{ width: "100%" }}>
                    <select
                      value={selectedSkillLevel}
                      onChange={(e) => setSelectedSkillLevel(e.target.value)}
                    >
                      <option value="">Select level...</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="SENIOR">Senior</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleApprove(selectedTechnician.id)}
                    className="btn-primary"
                    disabled={actionLoading || !selectedSkillLevel}
                  >
                    {actionLoading ? "Processing..." : "Approve Application"}
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(selectedTechnician.id);
                      setShowRejectModal(true);
                    }}
                    className="btn-primary"
                    style={{ backgroundColor: "#dc2626" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="master-table-card"
            style={{ width: "400px", background: "white", padding: "24px" }}
          >
            <h3 style={{ marginBottom: "16px" }}>Reject Application</h3>
            <textarea
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginBottom: "16px",
              }}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowRejectModal(false)}
                className="page-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn-primary"
                style={{ backgroundColor: "#dc2626" }}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
