"use client";
// RMIS-FE/app/ministry/quota-requests/page.tsx

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken, getRole } from "@/services/authService";
import Link from "next/link";
import {
    LayoutDashboard,
    Files,
    BarChart2,
    Settings,
    LogOut,
    Leaf,
    FileText,
    CheckCircle,
    RefreshCw,
} from "lucide-react";
import QuotaTable from "@/components/quota-requests/QuotaTable";
import QuotaFiltersPanel from "@/components/quota-requests/QuotaFilters";
import QuotaPagination from "@/components/quota-requests/QuotaPagination";
import QuotaReviewModal from "@/components/quota-requests/QuotaReviewModal";
import { QuotaFilters, QuotaPaginatedResponse, QuotaStatus } from "@/types/quota";
import { getQuotaRequests } from "@/services/quotaService";

const EMPTY_FILTERS: QuotaFilters = {
    companyName: "",
    status: "",
    submissionDate: "",
};

// ── Inner component — needs Suspense wrapper for useSearchParams ───────────
function QuotaRequestsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── URL-derived state ──────────────────────────────────────────────────
    const [authChecked, setAuthChecked] = useState(false);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "5", 10);
    const companyName = searchParams.get("companyName") || "";
    const status = (searchParams.get("status") || "") as QuotaStatus | "";
    const submissionDate = searchParams.get("submissionDate") || "";
    const filters = useMemo(
        () => ({ companyName, status, submissionDate }),
        [companyName, status, submissionDate]
    );

    // ── Component state ────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("quota_requests");
    const [data, setData] = useState<QuotaPaginatedResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Modal state (RMIS-27) ──────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);      // UUID
    const [selectedRequestId, setSelectedRequestId] = useState<string>(""); // REQ-0001

    // ── Auth guard ─────────────────────────────────────────────────────────
    useEffect(() => {
        const token = getToken();
        const role = getRole();
        if (!token) {
            router.push("/ministry");
            return;
        }
        if (role !== "MINISTRY_OFFICER" && role !== "ADMIN") {
            router.push("/unauthorised");
        }
        setAuthChecked(true); // ← only render page after auth passes
    }, []);

    

    // ── Fetch data whenever filters, page, or pageSize changes ────────────
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const result = await getQuotaRequests(filters, page, pageSize);
                setData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [companyName, status, submissionDate, page, pageSize]);

    // ── Handle browser back button for modal (RMIS-27) ────────────────────
    useEffect(() => {
        const handlePopState = () => {
            const match = window.location.pathname.match(/\/quota-requests\/([^\/?]+)/);
            if (!match) {
                setModalOpen(false);
            } else {
                setSelectedId(match[1]);
                setModalOpen(true);
            }
        };
        window.addEventListener("popstate", handlePopState);

        // Handle direct URL load with modal open
        const match = window.location.pathname.match(/\/quota-requests\/([^\/?]+)/);
        if (match) {
            setSelectedId(match[1]);
            setModalOpen(true);
        }

        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // ── Refresh helper — used by RMIS-23 onStatusChange ───────────────────
    const refreshData = () => {
        const token = getToken();
        if (!token) return;
        setIsLoading(true);
        getQuotaRequests(filters, page, pageSize)
            .then(setData)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    // ── Filter / page handlers ─────────────────────────────────────────────
    const handleFilterChange = (newFilters: QuotaFilters) => {
        const params = new URLSearchParams(searchParams);
        params.set("companyName", newFilters.companyName);
        params.set("status", newFilters.status);
        params.set("submissionDate", newFilters.submissionDate);
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageSizeChange = (newSize: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("pageSize", newSize.toString());
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // ── Modal handlers (RMIS-27) ───────────────────────────────────────────
    const handleReview = (id: string, requestId: string) => {
        setSelectedId(id);
        setSelectedRequestId(requestId);
        setModalOpen(true);
        window.history.pushState(
            { modalOpen: true },
            "",
            `/ministry/quota-requests/${id}`
        );
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedId(null);
        setSelectedRequestId("");
        if (window.location.pathname.match(/\/quota-requests\/([^\/?]+)/)) {
            window.history.pushState(null, "", "/ministry/quota-requests");
        }
    };

    // ── Logout ─────────────────────────────────────────────────────────────
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        document.cookie = "accessToken=; path=/; max-age=0"; // ← clear cookie
        router.push("/ministry");
    };

    // ── Stats ──────────────────────────────────────────────────────────────
    const rows = data?.data ?? [];
    const approvedTons = rows
        .filter((r) => r.status === "APPROVED")
        .reduce((sum, r) => sum + r.requested_quota, 0);
    const pendingCount = rows.filter((r) => r.status === "PENDING").length;
    const totalCount = data?.totalRecords ?? 0;

    if (!authChecked) return null;
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundImage: `url('/bg.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* ── Review Modal (RMIS-27) ─────────────────────────────────── */}
            {modalOpen && selectedId && (
                <QuotaReviewModal
                    id={selectedId}
                    requestId={selectedRequestId}
                    onClose={handleCloseModal}
                />
            )}

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <RefreshCw size={24} color="#2ecc71" />
                    </div>
                    <div className="logo-text">
                        <h1>Ministry of Environment</h1>
                        <span>Environmental Quota Division</span>
                    </div>
                </div>

                <ul className="nav-links">
                    <li
                        className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </li>
                    <li
                        className={`nav-item ${activeTab === "quota_requests" ? "active" : ""}`}
                        onClick={() => setActiveTab("quota_requests")}
                    >
                        <Files size={18} />
                        <span>Quota Requests</span>
                    </li>
                    <li
                        className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
                        onClick={() => setActiveTab("reports")}
                    >
                        <BarChart2 size={18} />
                        <span>Reports</span>
                    </li>
                    <li
                        className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </li>
                </ul>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div
                            className="avatar"
                            style={{
                                backgroundImage: "url('https://i.pravatar.cc/150?img=11')",
                            }}
                        />
                        <div className="user-info">
                            <h4>Ministry Officer</h4>
                            <span>Recs: {totalCount}</span>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                            <CheckCircle size={16} color="rgba(255,255,255,0.5)" />
                        </div>
                    </div>
                    <div className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────────────────────── */}
            <main className="main-content">
                <div className="page-header">
                    <h2>Quota Requests Management</h2>
                    <p>Review, approve, or reject industrial environmental quota applications.</p>
                </div>

                <div className="master-table-card">
                    <QuotaFiltersPanel filters={filters} onFilterChange={handleFilterChange} />

                    <div className="table-section">
                        <QuotaTable
                            data={rows}
                            isLoading={isLoading}
                            onReview={handleReview}         // ← RMIS-27: opens QuotaReviewModal
                            onStatusChange={refreshData}    // ← RMIS-23: refreshes after approve/reject
                        />
                    </div>

                    {data && (
                        <QuotaPagination
                            currentPage={data.currentPage}
                            totalCount={data.totalRecords}
                            totalPages={data.totalPages}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}
                </div>

                {/* Summary Cards */}
                <div
                    className="summary-cards-container"
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
                >
                    <div className="summary-card">
                        <div className="summary-icon green">
                            <Leaf size={20} />
                        </div>
                        <div className="summary-info">
                            <h3>Approved Quotas</h3>
                            <div className="summary-value">
                                {approvedTons.toLocaleString()} <span>Tons</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon yellow">
                            <FileText size={20} />
                        </div>
                        <div className="summary-info">
                            <h3>Pending Review</h3>
                            <div className="summary-value">
                                {pendingCount} <span>Requests</span>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="app-footer">
                    <span>&copy; 2024 Ministry of Environment</span>
                    <Link href="#">All Rights Reserved.</Link>
                    <Link href="#">Help Center</Link>
                </footer>
            </main>
        </div>
    );
}



// ── Suspense wrapper — required because useSearchParams needs it ───────────
export default function QuotaRequestsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuotaRequestsContent />
        </Suspense>
    );
}