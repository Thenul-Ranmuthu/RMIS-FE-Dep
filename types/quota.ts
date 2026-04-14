// RMIS-FE/types/quota.ts

export type QuotaStatus = "PENDING" | "APPROVED" | "REJECTED";

// ── List item — returned by paginated/filter endpoints ────────────────────
export interface QuotaRequest {
    id: string;                  // UUID — used for detail API call
    request_id: string;          // REQ-0001 — used for display
    request_number?: string;
    company_id?: string | number;
    company_name: string;
    requested_quota: number;
    status: QuotaStatus;
    submission_date: string;
    created_at?: string;
    updated_at?: string;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
}

// ── Detail item — returned by GET /ministry/quota-requests/{uuid} ─────────
export interface QuotaRequestDetail {
    id: string;
    request_id: string;
    company_name: string;
    company_email: string;
    company_id: string;
    requested_quota: number;
    submission_date: string;
    status: QuotaStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
}

// ── Paginated response shape ───────────────────────────────────────────────
export interface QuotaPaginatedResponse {
    data: QuotaRequest[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
}

// ── Filter state ──────────────────────────────────────────────────────────
export interface QuotaFilters {
    companyName: string;
    status: QuotaStatus | "";
    submissionDate: string;
}

// ── Stats (derived on frontend from current page data) ────────────────────
export interface QuotaStats {
    approvedTons: number;
    pendingCount: number;
    complianceRate: number;
}
