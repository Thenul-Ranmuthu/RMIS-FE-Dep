"use client";
// RMIS-FE/app/ministry/quota-requests/page.tsx

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken, getRole, logout } from "@/services/authService";
import Link from "next/link";
import {
    LayoutDashboard,
    Files,
    BarChart2,
    LogOut,
    CheckCircle,
    RefreshCw,
} from "lucide-react";
import MinistrySidebar from "@/components/MinistrySidebar";
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



    // ── Stats ──────────────────────────────────────────────────────────────
    const rows = data?.data ?? [];
    const totalCount = data?.totalRecords ?? 0;

// Preview of the new Sidebar layout
    if (!authChecked) return null;

    return (
        <div className="admin-theme" style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundImage: "url('/ministry_dashboard_bg_deer_1776617937111.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            {/* ── Review Modal (RMIS-27) ─────────────────────────────────── */}
            {modalOpen && selectedId && (
                <QuotaReviewModal
                    id={selectedId}
                    requestId={selectedRequestId}
                    onClose={handleCloseModal}
                />
            )}

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <MinistrySidebar totalCount={totalCount} />

            {/* ── Main Content ──────────────────────────────────────────── */}
            <main className="main-content" style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(40px)' }}>
                <div className="page-header" style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '800px',
                    margin: '0 auto 32px auto',
                    textAlign: 'center'
                }}>
                    <div style={{ width: '100%' }}>
                        <h2>Quota Requests Management</h2>
                        <p>Review, approve, or reject industrial environmental quota applications.</p>
                    </div>
                </div>

                <div className="master-table-card" style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                    <QuotaFiltersPanel filters={filters} onFilterChange={handleFilterChange} />

                    <div className="table-section">
                        <QuotaTable
                            data={rows}
                            isLoading={isLoading}
                            onReview={handleReview}
                            onStatusChange={refreshData}
                        />
                    </div>

                    {data && (
                        <div style={{ padding: '0 24px 24px 24px' }}>
                            <QuotaPagination
                                currentPage={data.currentPage}
                                totalCount={data.totalRecords}
                                totalPages={data.totalPages}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </div>
                    )}
                </div>

                <footer className="app-footer" style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>&copy; 2024 Ministry of Environment</span>
                    <Link href="#" style={{ color: 'var(--primary-color)', fontSize: '13px', fontWeight: 600 }}>Help Center</Link>
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
